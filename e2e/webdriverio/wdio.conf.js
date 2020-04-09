const { Authenticator } = require('../../lib');

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
    }],

    logLevel: 'info',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,

    services: ['chromedriver'],
    
    framework: 'mocha',
    reporters: ['spec'],
 
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
        require: 'ts-node/register',
    },
};
