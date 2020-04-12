# Authenticator (Browser Extension)

[![npm version](https://badge.fury.io/js/authenticator-browser-extension.svg)](https://badge.fury.io/js/authenticator-browser-extension)
[![Build Status](https://travis-ci.org/jan-molak/authenticator-browser-extension.svg?branch=master)](https://travis-ci.org/jan-molak/authenticator-browser-extension)
[![Coverage Status](https://coveralls.io/repos/github/jan-molak/authenticator-browser-extension/badge.svg)](https://coveralls.io/github/jan-molak/authenticator-browser-extension)
[![npm](https://img.shields.io/npm/dm/authenticator-browser-extension.svg)](https://npm-stat.com/charts.html?package=authenticator-browser-extension)
[![Known Vulnerabilities](https://snyk.io/test/github/jan-molak/authenticator-browser-extension/badge.svg)](https://snyk.io/test/github/jan-molak/authenticator-browser-extension)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension?ref=badge_shield)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


Authenticator is a [web browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
that enables your WebdriverIO, Protractor and Puppeteer-based automated tests to authenticate with web apps
using [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).

Authenticator generates the browser extension dynamically, so you can easily provide the username and password
via a config file or env variables.

Authenticator currently supports:
- [Google Chrome](https://www.google.co.uk/chrome/)

## Usage

The best place to look for usage examples is the [e2e test suite](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e).

### WebdriverIO

Import the `authenticator-browser-extension` in the [`wdio.conf.js`](https://webdriver.io/docs/options.html) file and add `Authenticator` to the list of Chrome extensions:

```javascript
// wdio.conf.js

const { Authenticator } = require('authenticator-browser-extension');

exports.config = {
    
    capabilities: [{
        browserName: 'chrome',

        'goog:chromeOptions': {
            extensions: [
                Authenticator.for('username', 'password').asBase64()
            ]
        }
    }],
    
    // other WebdriverIO config
}
```

### Protractor

Import the `authenticator-browser-extension` in the [`protractor.conf.js`](https://www.protractortest.org/#/api-overview#example-config-file) file and add `Authenticator` to the list of Chrome extensions:

```javascript
// protractor.conf.js

const { Authenticator } = require('authenticator-browser-extension');

exports.config = {

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            extensions: [
                Authenticator.for('username', 'password').asBase64()
            ]
        }
    },

    // other Protractor config
}
```

### Puppeteer

Import the `authenticator-browser-extension` and generate an expanded `Authenticator` web extension directory before launching a Puppeteer browser:

```javascript
const { Authenticator } = require('authenticator-browser-extension');
 
const authenticator = Authenticator.for('admin', 'Password123')
    .asDirectoryAt(`${process.cwd()}/build/puppeteer/authenticator`);

browser = await puppeteer.launch({
    headless: false,

    args: [
        `--disable-extensions-except=${authenticator}`,
        `--load-extension=${authenticator}`,
        `--no-sandbox`,
    ],
});
```

## Known limitations

### Chrome headless

Chrome doesn't support browser extensions when running in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome) and Chrome developers have [decided against](https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c5) implementing this feature in any near future due to complexity of the task.

The best way to get around this limitation is to use Chrome together with
the [X Virtual Framebuffer (XVFB)](https://en.wikipedia.org/wiki/Xvfb).

## Your feedback matters!

Do you find Authenticator useful? Give it a star! ★

Found a bug? Need a feature? Raise [an issue](https://github.com/jan-molak/authenticator-browser-extension/issues?q=is%3Aopen) or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

## Before you go

☕ If Authenticator has made your life a little bit easier and saved at least $5 worth of your time,
please consider repaying the favour and [buying me a coffee](https://github.com/sponsors/jan-molak) via [Github Sponsors](https://github.com/sponsors/jan-molak). Thanks! 🙏

## License
Authenticator library is licensed under the Apache-2.0 license.

_- Copyright &copy; 2019- [Jan Molak](https://janmolak.com)_


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension?ref=badge_large)
