import fs = require('fs');
import Mustache = require('mustache');
const Zip = require('node-zip');                   // tslint:disable-line:no-var-requires  no type definitions available
import readPkg = require('read-pkg');
import { ensure, isGreaterThan, isString, property } from 'tiny-types';
import path = require('upath');

export class Authenticator {
    static for(username: string, password: string): Authenticator {
        return new Authenticator(username, password);
    }

    asBase64(): string {
        return this.extension().generate({ base64: true, compression: 'DEFLATE' });
    }

    private constructor(
        private readonly username: string,
        private readonly password: string,
    ) {
        ensure('username', username, isString(), property('length', isGreaterThan(0)));
        ensure('password', password, isString(), property('length', isGreaterThan(0)));
    }

    private extension(): NodeZip {
        const zip: NodeZip = new Zip();

        const { name, description, version } = readPkg.sync(path.resolve(__dirname, '../package.json'));

        zip.file('manifest.json', Mustache.render(
            contentsOf('../extension/manifest.mustache.json'),
            { name, description, version },
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
