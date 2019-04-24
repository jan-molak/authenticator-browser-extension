import fs = require('fs');
import Mustache = require('mustache');
import readPkg = require('read-pkg');
import path = require('upath');

const Zip = require('node-zip');                   // tslint:disable-line:no-var-requires  no type definitions available
import { coerce, SemVer } from 'semver';
import { ensure, isArray, isGreaterThan, isString, property } from 'tiny-types';

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
        return this.extension().generate({ base64: true, compression: 'DEFLATE' });
    }

    private constructor(
        private readonly username: string,
        private readonly password: string,
        private readonly permissions: string[],
    ) {
        ensure('username', username, isString(), property('length', isGreaterThan(0)));
        ensure('password', password, isString(), property('length', isGreaterThan(0)));
        ensure('permissions', permissions, isArray(), property('length', isGreaterThan(0)));
    }

    private extension(): NodeZip {
        const zip: NodeZip = new Zip();

        const { name, description, version } = readPkg.sync({ cwd: path.resolve(__dirname, '..') });

        zip.file('manifest.json', Mustache.render(
            contentsOf('../extension/manifest.mustache.json'), {
                name,
                description,
                permissions: this.permissions.map(permission => `"${ permission }"`).join(', '),
                version: (coerce(version as string) as SemVer).version,
            },
        ));

        zip.file('authenticator.js', Mustache.render(
            contentsOf('../extension/authenticator.mustache.js'),
            { username: this.username, password: this.password },
        ));

        return zip;
    }
}

function contentsOf(fileName: string): string {
    return fs.readFileSync(path.join(__dirname, fileName)).toString('utf8');
}

interface NodeZip {
    file(name: string, contents: string | Buffer): void;
    generate(options: { base64: boolean, compression: 'DEFLATE' }): string;
}
