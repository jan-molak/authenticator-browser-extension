# Authenticator (Browser Extension)

[![npm version](https://badge.fury.io/js/authenticator-browser-extension.svg)](https://badge.fury.io/js/authenticator-browser-extension)
[![Build Status](https://travis-ci.org/jan-molak/authenticator-browser-extension.svg?branch=master)](https://travis-ci.org/jan-molak/authenticator-browser-extension)
[![Coverage Status](https://coveralls.io/repos/github/jan-molak/authenticator-browser-extension/badge.svg)](https://coveralls.io/github/jan-molak/authenticator-browser-extension)
[![npm](https://img.shields.io/npm/dm/authenticator-browser-extension.svg)](https://npm-stat.com/charts.html?package=authenticator-browser-extension)
[![Known Vulnerabilities](https://snyk.io/test/github/jan-molak/authenticator-browser-extension/badge.svg)](https://snyk.io/test/github/jan-molak/authenticator-browser-extension)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


Authenticator is a [web browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
that enables your browser-based automated tests to authenticate with web apps
using [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).

Authenticator generates the browser extension dynamically, so you can easily provide the username and password
via a config file or env variables.

Authenticator currently supports:
- [Google Chrome](https://www.google.co.uk/chrome/)

## Usage

The best place to look for usage examples is the [e2e test suite](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e).

### Protractor

Import the `authenticator-browser-extension` in the [`protractor.conf.js`](https://www.protractortest.org/#/api-overview#example-config-file) file:

```javascript
// protractor.conf.js

const { Authenticator } = require('authenticator-browser-extension');

exports.config = {
    // protractor config
}
```

#### Chrome

Add the Authenticator to the list of Chrome extensions:

```javascript
// protractor.conf.js

exports.config = {

    capabilities: {
        browserName: 'chrome',

        chromeOptions: {
            extensions: [
                Authenticator.for('username', 'password').asBase64()
            ]
        }
    },
}
```

## Known limitations

### Chrome headless

Chrome running in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome)
doesn't support browser extensions. Chrome developers have [decided against](https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c5)
implementing this feature in any near future due to complexity of the task.

The best way to get around this limitation is to use Chrome together with
the [X Virtual Framebuffer (XVFB)](https://en.wikipedia.org/wiki/Xvfb).

## Your feedback matters!

Do you find Authenticator useful? Give it a star! ★

Found a bug? Need a feature? Raise [an issue](https://github.com/jan-molak/authenticator-browser-extension/issues?q=is%3Aopen) or submit a pull request.

Have feedback? Let me know on twitter: [@JanMolak](https://twitter.com/JanMolak)

## License
Authenticator library is licensed under the Apache-2.0 license.

_- Copyright &copy; 2019- [Jan Molak](https://janmolak.com)_
