/* eslint-disable @typescript-eslint/no-use-before-define, unicorn/prevent-abbreviations */

import * as nodeFS from 'fs';
import * as gracefulFS from 'graceful-fs';
import Mustache = require('mustache');
import readPkg = require('read-pkg');
import path = require('upath');
import { coerce, SemVer } from 'semver';
import { endsWith, ensure, isArray, isDefined, isGreaterThan, isNumber, isString, or, property } from 'tiny-types';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- no type definitions available
const Zip = require('node-zip');

export class Authenticator {
    /**
     * @param {string} username
     * @param {string} password
     * @param {string[]} permissions
     *  See https://developer.chrome.com/extensions/declare_permissions
     */
    static for(username: string, password: string, permissions: string[] = ['<all_urls>']): Authenticator {
        return new Authenticator(username, password, permissions);
    }

    asBase64(): string {
        return this.extensionFile().generate({ base64: true, compression: 'DEFLATE' });
    }

    asFileAt(
        relativePathToExtensionFile: string,
        mode: number = Number.parseInt('0777', 8) & (~process.umask()),
    ): string {

        ensure('path to extension file', relativePathToExtensionFile,
            isString(),
            property('length', isGreaterThan(0)),
            or(endsWith('.xpi'), endsWith('.crx')),
        );

        ensure('mode', mode, isNumber());

        const fullPath = path.resolve(this.cwd, relativePathToExtensionFile);

        this.fs.mkdirSync(path.dirname(fullPath), { recursive: true, mode });

        const data = this.extensionFile().generate({ base64: false, compression: 'STORE' });

        this.fs.writeFileSync(fullPath, data, { encoding: 'binary', mode });

        return fullPath;
    }

    asDirectoryAt(
        relativePathToDestinationDirectory: string,
        mode: number = Number.parseInt('0777', 8) & (~process.umask()),
    ): string {

        ensure('path to destination directory', relativePathToDestinationDirectory,
            isString(), property('length', isGreaterThan(0))
        );

        ensure('mode', mode, isNumber());

        const fullPath = path.resolve(this.cwd, relativePathToDestinationDirectory);

        this.fs.mkdirSync(fullPath, { recursive: true, mode });

        this.fs.writeFileSync(path.resolve(fullPath, 'manifest.json'), this.authenticatorManifest());
        this.fs.writeFileSync(path.resolve(fullPath, 'authenticator.js'), this.authenticatorScript());

        return fullPath;
    }

    public constructor(
        private readonly username: string,
        private readonly password: string,
        private readonly permissions: string[],
        private readonly cwd: string = process.cwd(),
        private readonly fs: typeof nodeFS = gracefulFS,
    ) {
        ensure('username', username, isString(), property('length', isGreaterThan(0)));
        ensure('password', password, isString(), property('length', isGreaterThan(0)));
        ensure('permissions', permissions, isArray(), property('length', isGreaterThan(0)));
        ensure('cwd', cwd, isString(), property('length', isGreaterThan(0)));
        ensure('fs', cwd, isDefined());
    }

    private extensionFile(): NodeZip {
        const zip: NodeZip = new Zip();

        zip.file('manifest.json', this.authenticatorManifest());
        zip.file('authenticator.js', this.authenticatorScript());

        return zip;
    }

    private authenticatorManifest(): string {
        const { name, description, version } = readPkg.sync({ cwd: this.cwd });

        return Mustache.render(
            this.contentsOf('../extension/manifest.mustache.json'), {
                name,
                description,
                permissions: this.permissions.map(permission => `"${ permission }"`).join(', '),
                version: (coerce(version as string) as SemVer).version,
            },
        )
    }

    private authenticatorScript(): string {
        return Mustache.render(
            this.contentsOf('../extension/authenticator.mustache.js'),
            { username: this.username, password: this.password },
        )
    }

    private contentsOf(fileName: string): string {
        return this.fs.readFileSync(path.join(__dirname, fileName)).toString('utf8');
    }
}

interface NodeZip {
    file(name: string, contents: string | Buffer): void;

    /**
     * https://github.com/Stuk/jszip/blob/3109282aed65d902188086f2d37a009ce9eb268c/documentation/api_jszip/generate_async.md#compression-and-compressionoptions-options
     * @param options
     */
    generate(options: { base64: boolean; compression: 'DEFLATE' | 'STORE' }): string;
}
