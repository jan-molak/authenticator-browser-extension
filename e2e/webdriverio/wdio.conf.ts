/* eslint-disable unicorn/prevent-abbreviations */
import { Authenticator } from '../../lib';

exports.config = {
    runner: 'local',
    specs: [
        'e2e/webdriverio/**/*.spec.ts'
    ],

    maxInstances: 1,

    capabilities: [{

        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--disable-infobars',
                '--no-sandbox',
                '--disable-gpu',
                '--window-size=1024x768',
            ],
            extensions: [
                Authenticator.for('admin', 'Password123').asBase64()
            ]
        }
    }, {
        browserName: 'firefox',
    }],

    logLevel: 'debug',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,

    // Geckodriver config
    path: '/',

    // NOTE: Make sure to use Firefox Developer Edition - https://www.mozilla.org/en-GB/firefox/developer/
    //       and either add it to the PATH env variable, or specify below
    //       Only Firefox Developer Edition supports custom, unsigned extensions.
    // geckoDriverArgs: ['--binary=/path/to/developer/edition/of/firefox'],

    services: [
        'chromedriver',
        'geckodriver',

        ['firefox-profile', {
            extensions: [
                Authenticator.for('admin', 'Password123')
                    .asFileAt('build/wdio/authenticator.xpi')
            ],
            // NOTE: this option is required to load an unsigned extension
            'xpinstall.signatures.required': false
        }],
    ],
    
    framework: 'mocha',
    reporters: ['spec'],
 
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
};
