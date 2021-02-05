# Authenticator (Browser Extension)

[![npm version](https://badge.fury.io/js/authenticator-browser-extension.svg)](https://badge.fury.io/js/authenticator-browser-extension)
[![Build Status](https://github.com/jan-molak/authenticator-browser-extension/workflows/build/badge.svg)](https://github.com/jan-molak/authenticator-browser-extension/actions)
[![Coverage Status](https://coveralls.io/repos/github/jan-molak/authenticator-browser-extension/badge.svg)](https://coveralls.io/github/jan-molak/authenticator-browser-extension)
[![npm](https://img.shields.io/npm/dm/authenticator-browser-extension.svg)](https://npm-stat.com/charts.html?package=authenticator-browser-extension)
[![Known Vulnerabilities](https://snyk.io/test/github/jan-molak/authenticator-browser-extension/badge.svg)](https://snyk.io/test/github/jan-molak/authenticator-browser-extension)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjan-molak%2Fauthenticator-browser-extension?ref=badge_shield)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![Twitter Follow](https://img.shields.io/twitter/follow/JanMolak?style=social)](https://twitter.com/JanMolak)

Authenticator is a [web browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
that enables your automated tests to authenticate with web apps using [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).

Authenticator generates the browser extension dynamically, so you can easily provide the username and password
via a config file or env variables.

Authenticator is [proven to work](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e) with following test frameworks:
- [WebdriverIO](https://webdriver.io/) ([example](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/webdriverio))
- [Protractor](https://www.protractortest.org/#/) ([example](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/protractor))
- [Puppeteer](https://github.com/puppeteer/puppeteer) ([example](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/puppeteer))

and following browsers:
- [Google Chrome](https://www.google.co.uk/chrome/) ([example 1](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/protractor), [example 2](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/webdriverio))
- [Firefox Developer Edition](https://www.mozilla.org/en-GB/firefox/developer/) ([example](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/webdriverio))

It's possible that Authenticator will work with other browsers supporting [Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) and [`webRequest.onAuthRequired`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onAuthRequired) API. However, I didn't have a chance to verify it yet. 

## For Enterprise

<a href="https://tidelift.com/subscription/pkg/npm-authenticator-browser-extension?utm_source=npm-authenticator-browser-extension&utm_medium=referral&utm_campaign=enterprise&utm_term=repo" target="_blank"><img width="163" height="24" src="https://cdn2.hubspot.net/hubfs/4008838/website/logos/logos_for_download/Tidelift_primary-logo.png" class="tidelift-logo" /></a>

Authenticator is available as part of the [Tidelift Subscription](https://tidelift.com/subscription/pkg/npm-authenticator-browser-extension?utm_source=npm-authenticator-browser-extension&utm_medium=referral&utm_campaign=enterprise&utm_term=repo). The maintainers of Authenticator and thousands of other packages are working with Tidelift to deliver one enterprise subscription that covers all of the open source you use. If you want the flexibility of open source and the confidence of commercial-grade software, this is for you. [Learn more.](https://tidelift.com/subscription/pkg/npm-authenticator-browser-extension?utm_source=npm-authenticator-browser-extension&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Usage

Install the module from npm:

```
npm install --save-dev authenticator-browser-extension
```

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

```typescript
// puppeteer/chrome-authenticator-extension.spec.ts
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

### Playwright

Requires launching a [persistent browser context instance](https://playwright.dev/docs/api/class-browsertype?_highlight=persistent#browsertypelaunchpersistentcontextuserdatadir-options) containing the `Authenticator` extension. In every other way a carbon copy of the Puppeteer prototype.  

```typescript
// playwright/chrome-authenticator-extension.spec.ts
const extensionDirectory = `${process.cwd()}/build/playwright/authenticator`;

const authenticator = Authenticator.for(
    'admin',
    'Password123'
).asDirectoryAt(extensionDirectory);

browser = await playwright['chromium'].launchPersistentContext(
    extensionDirectory,
    {
        args: [
            `--disable-extensions-except=${authenticator}`,
            `--load-extension=${authenticator}`,
            `--no-sandbox`,
        ],
        headless: false,
    }
);
```

## Known limitations

### Chrome headless

Chrome doesn't support browser extensions when running in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome) and Chrome developers have [decided against](https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c5) implementing this feature in any near future due to complexity of the task.

The best way to get around this limitation is to use Chrome together with
the [X Virtual Framebuffer (XVFB)](https://en.wikipedia.org/wiki/Xvfb).

### Firefox

Authenticator generates the web extension dynamically on your machine, which means that the extension is not signed by Mozilla. For this reason, in order to use Authenticator, you need to configure Firefox with a `xpinstall.signatures.required` flag set to `false` (see [example](https://github.com/jan-molak/authenticator-browser-extension/tree/master/e2e/webdriverio)).

**NOTE**: Firefox 48 (Pushed from Firefox 46) and newer [do not allow for unsigned extensions to be installed](https://wiki.mozilla.org/Add-ons/Extension_Signing#Timeline), so you need to use [Firefox Developer Edition](https://www.mozilla.org/en-GB/firefox/developer/) instead.

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
