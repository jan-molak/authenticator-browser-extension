import 'mocha';
import { expect } from 'chai';
import { given } from 'mocha-testdata';
import path = require('path');
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
});
