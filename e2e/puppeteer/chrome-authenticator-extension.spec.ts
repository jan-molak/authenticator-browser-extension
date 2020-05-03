/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-use-before-define,@typescript-eslint/no-explicit-any */

import { Ensure, equals } from '@serenity-js/assertions';
import { Ability, Actor, actorCalled, Cast, engage, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer, StopLocalServer } from '@serenity-js/local-server';
import { Browser, ElementHandle, Page, Response } from 'puppeteer';

import { Authenticator } from '../../src';
import { TestApp } from '../TestApp';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer');

let page: Page;
let browser: Browser;

describe('Chrome Authenticator Extension, when used with Puppeteer', function () {
    this.timeout(15000);

    before(async () => {
        const authenticator = Authenticator.for('admin', 'Password123')
            .asDirectoryAt(`${ process.cwd() }/build/puppeteer/authenticator`);

        browser = await puppeteer.launch({
            headless: false,

            args: [
                `--disable-extensions-except=${ authenticator }`,
                `--load-extension=${ authenticator }`,
                `--no-sandbox`,
            ],
        });
        page = await browser.newPage();
    });

    class Actors implements Cast {
        prepare(actor: Actor): Actor {
            return actor.whoCan(
                BrowseTheWeb.using(page),
                ManageALocalServer.runningAHttpListener(
                    TestApp.allowingUsersAuthenticatedWith({
                        username: 'admin',
                        password: 'Password123',
                    }),
                ),
            );
        }
    }

    beforeEach(() => engage(new Actors()));
    beforeEach(() =>
        actorCalled('Dave').attemptsTo(StartLocalServer.onRandomPort()),
    );

    it(`enables a Chrome web browser-based test to authenticate with a web app`, () =>
        actorCalled('Dave').attemptsTo(
            Navigate.to(LocalServer.url()),
            Ensure.that(Text.of(TestPage.Title), equals('Authenticated!')),
        ));

    after(async () => await browser.close());
    after(() => actorCalled('Dave').attemptsTo(StopLocalServer.ifRunning()));
});

// Serenity/JS doesn't support Puppeteer natively yet.
// However, below is a minimalists proof-of-concept Screenplay Pattern-style integration code
// that brings the two frameworks together.
//
// If you'd like Serenity/JS to support Puppeteer out of the box, please:
// - vote on https://github.com/serenity-js/serenity-js/issues/493
// - ask your boss to sponsor this feature - https://github.com/sponsors/serenity-js

const Navigate = {
    to: (url: Question<string>) =>
        Interaction.where(`#actor navigates to ${ url }`, actor =>
            actor
                .answer(url)
                .then(actualUrl => BrowseTheWeb.as(actor).get(actualUrl))
                .then((_: Response | null) => void 0),          // eslint-disable-line @typescript-eslint/no-unused-vars
        ),
};

const Target = {
    the: (name: string) => ({
        locatedBy: (selector: string) =>
            Question.about<Promise<ElementHandle | null>>(`the ${ name }`, actor =>
                BrowseTheWeb.as(actor).locate(selector),
            ),
    }),
};

const Text = {
    of: (target: Question<Promise<ElementHandle | null>>) =>
        Question.about<Promise<string>>(`text of ${ target }`, actor =>
            actor.answer(target).then(element => {
                return page.evaluate(actualElement => actualElement.textContent, element);
            }),
        ),
};

const TestPage = {
    Title: Target.the('header').locatedBy('h1'),
};

class BrowseTheWeb implements Ability {
    static using(browserInstance: Page) {
        return new BrowseTheWeb(browserInstance);
    }

    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    constructor(private readonly page: Page) {
    }

    get(destination: string): Promise<Response | null> {
        return this.page.goto(destination);
    }

    locate(selector: string): Promise<ElementHandle | null> {
        return this.page.$(selector);
    }
}
