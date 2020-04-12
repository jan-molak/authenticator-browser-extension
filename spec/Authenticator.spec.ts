/* eslint-disable @typescript-eslint/no-use-before-define, unicorn/consistent-function-scoping */

import 'mocha';

import { expect } from 'chai';
import * as fs from 'fs';
import { createFsFromVolume, DirectoryJSON, Volume } from 'memfs';
import { given } from 'mocha-testdata';
import path = require('upath');
import readPkg = require('read-pkg');                               // eslint-disable-line unicorn/prevent-abbreviations
import { Authenticator } from '../src';

// eslint-disable-next-line @typescript-eslint/no-var-requires -- no type definitions available
const Zip = require('node-zip');

describe('Authenticator', () => {

    describe('#asBase64', () => {

        it('allows for an extension to be generated as a base64-encoded zip', () => {
            const data = Authenticator.for('user', 'pass').asBase64();

            const zip = new Zip(data, {base64: true, checkCRC32: true});

            const pkg = readPkg.sync({ cwd: path.resolve(__dirname, '..') });   // eslint-disable-line unicorn/prevent-abbreviations

            const manifest = JSON.parse(zip.files['manifest.json']._data);

            expect(manifest.description).to.deep.equal(pkg.description);
            expect(manifest.name).to.deep.equal(pkg.name);
            expect(manifest.version).to.match(/(\d\.?){3}/);

            // authenticator
            const authenticator = zip.files['authenticator.js']._data;

            expect(authenticator).to.contain(
                '{ authCredentials: { username: `user`, password: `pass` }}'
            );
        });
    });

    describe('#asFileAt', () => {
        const cwd = process.cwd();
        let fakeFS: typeof fs,
            authenticator: Authenticator;

        beforeEach(() => {
            fakeFS = fakeFSWith({
                'extension/authenticator.mustache.js': contentsOf('extension/authenticator.mustache.js'),
                'extension/manifest.mustache.json': contentsOf('extension/manifest.mustache.json'),
            }, cwd);

            authenticator = new Authenticator(
                'user',
                'pass',
                ['<all_urls>'],
                cwd,
                fakeFS,
            );
        });

        it('allows for an extension to be generated as a .crx file at a specified location', () => {
            authenticator.asFileAt('./build/extensions/authenticator.xpi');

            expect(fakeFS.existsSync(path.resolve(process.cwd(), 'build/extensions/authenticator.xpi'))).equals(true);
        });

        it('allows for the file mode to be configured', () => {
            const mode644 = 0o100644;

            authenticator.asFileAt('./build/extensions/authenticator.xpi', mode644);

            const stat = fakeFS.statSync(path.resolve(process.cwd(), 'build/extensions/authenticator.xpi'));

            expect(stat.mode).equals(mode644);
        });

        it('complains if the relative path is empty', () => {
            expect(() => authenticator.asFileAt(''))
                .to.throw('path to extension file should have a property "length" that is greater than 0');
        });
    });

    describe('#asDirectoryAt', () => {
        const cwd = process.cwd();
        let fakeFS: typeof fs,
            authenticator: Authenticator;

        beforeEach(() => {
            fakeFS = fakeFSWith({
                'extension/authenticator.mustache.js': contentsOf('extension/authenticator.mustache.js'),
                'extension/manifest.mustache.json': contentsOf('extension/manifest.mustache.json'),
            }, cwd);

            authenticator = new Authenticator(
                'user',
                'pass',
                ['<all_urls>'],
                cwd,
                fakeFS,
            );
        });

        it('allows for an extension to be generated in a directory at a specified location', () => {
            authenticator.asDirectoryAt('./build/extensions/authenticator');

            expect(fakeFS.existsSync(path.resolve(process.cwd(), 'build/extensions/authenticator/manifest.json'))).equals(true);
            expect(fakeFS.existsSync(path.resolve(process.cwd(), 'build/extensions/authenticator/authenticator.js'))).equals(true);
        });

        it('allows for the file mode to be configured', () => {
            const mode644 = 0o440644;

            authenticator.asDirectoryAt('./build/extensions/authenticator', mode644);

            const stat = fakeFS.statSync(path.resolve(process.cwd(), 'build/extensions/authenticator'));

            expect(stat.mode).equals(mode644);
        });

        it('complains if the relative path is empty', () => {
            expect(() => authenticator.asDirectoryAt(''))
                .to.throw('path to destination directory should have a property "length" that is greater than 0');
        });
    });

    describe('permissions', () => {

        it('applies to all URLs by default', () => {
            const data = Authenticator.for('user', 'pass').asBase64();

            const zip = new Zip(data, {base64: true, checkCRC32: true});

            const manifest = JSON.parse(zip.files['manifest.json']._data);

            expect(manifest.permissions).to.contain('<all_urls>');
        });

        it('allows the developer to restrict the extension to specific URLs', () => {
            const data = Authenticator.for('user', 'pass', [ 'http://localhost/' ]).asBase64();

            const zip = new Zip(data, {base64: true, checkCRC32: true});

            const manifest = JSON.parse(zip.files['manifest.json']._data);

            expect(manifest.permissions).to.contain('http://localhost/');
            expect(manifest.permissions).to.not.contain('<all_urls>');
        });

        it('complains when given no permissions', () => {
            expect(() => Authenticator.for('user', 'pass', [ ]))
                .to.throw('permissions should have a property "length" that is greater than 0');
        });
    });

    describe('when handling errors', () => {

        /* eslint-disable @typescript-eslint/indent */
        given([
            { value: null,      expected: 'username should be a string',                                        },
            { value: undefined, expected: 'username should be a string',                                        },
            { value: '',        expected: 'username should have a property "length" that is greater than 0',    },
            { value: {},        expected: 'username should be a string',                                        },
            { value: [],        expected: 'username should be a string',                                        },
        ]).
        it('complains if provided with an invalid username', ({ value, expected }: { value: unknown; expected: string }) => {
            expect(() => Authenticator.for(value as string, 'password')).to.throw(expected);
        });

        given([
            { value: null,      expected: 'password should be a string',                                    },
            { value: undefined, expected: 'password should be a string',                                    },
            { value: '',        expected: 'password should have a property "length" that is greater than 0' },
            { value: {},        expected: 'password should be a string',                                    },
            { value: [],        expected: 'password should be a string',                                    },
        ]).
        it('complains if provided with an invalid password', ({ value, expected }: { value: unknown; expected: string }) => {
            expect(() => Authenticator.for('username', value as string)).to.throw(expected)
        });
        /* eslint-enable @typescript-eslint/indent */
    });

    function fakeFSWith(tree: DirectoryJSON, cwd: string): typeof fs {
        return createFsFromVolume(Volume.fromJSON(tree, cwd)) as unknown as typeof fs;
    }

    function contentsOf(pathToFile: string): string {
        return fs.readFileSync(path.resolve(process.cwd(), pathToFile)).toString('utf-8')
    }
});
