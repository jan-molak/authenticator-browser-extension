require('ts-node/register');

const { Authenticator } = require('../../lib');

exports.config = {
    chromeDriver: require('chromedriver/lib/chromedriver').path,
    SELENIUM_PROMISE_MANAGER: false,
    directConnect: true,

    allScriptsTimeout: 110000,
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        reporter: 'spec',
        // require: 'ts-node/register' // this doesn't work due to breaking changes introduced in Mocha 6.0
    },

    specs: [ '**/*.spec.ts' ],

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
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
    },

    onPrepare: () => {
        browser.waitForAngularEnabled(false);
    },
};
