/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-use-before-define */

import 'mocha';
import 'webdriverio';
import { BrowserObject, Element } from 'webdriverio';

import { Ensure, equals } from '@serenity-js/assertions';
import { Ability, Actor, actorCalled, Cast, engage, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server';

import { TestApp } from '../TestApp';

describe('Chrome Authenticator Extension, when used with WebDriver.io,', function () {

    this.timeout(5000);

    class Actors implements Cast {
        prepare(actor: Actor): Actor {
            return actor.whoCan(
                BrowseTheWeb.using(browser),
                ManageALocalServer.runningAHttpListener(TestApp.allowingUsersAuthenticatedWith({
                    username: 'admin',
                    password: 'Password123',
                })),
            );
        }
    }

    beforeEach(() => engage(new Actors()));
    beforeEach(() => actorCalled('Dave').attemptsTo(StartLocalServer.onRandomPort()));

    it(`enables a Chrome web browser-based test to authenticate with a web app`, () =>
        actorCalled('Dave').attemptsTo(
            Navigate.to(LocalServer.url()),
            Ensure.that(Text.of(TestPage.Title), equals('Authenticated!')),
        ));
});

// Serenity/JS doesn't support WebdriverIO natively yet.
// However, below is a minimalistic proof-of-concept Screenplay Pattern-style integration code
// that brings the two frameworks together.
//
// If you'd like Serenity/JS to support WebdriverIO out of the box, please:
// - vote on https://github.com/serenity-js/serenity-js/issues/493
// - ask your boss to sponsor this feature - https://github.com/sponsors/serenity-js

const Navigate = {
    to: (url: Question<string>) =>
        Interaction.where(`#actor navigates to ${ url }`, actor =>
            actor.answer(url).then(actualUrl => BrowseTheWeb.as(actor).get(actualUrl))
        ),
};

const Target = {
    the: (name: string) => ({
        locatedBy: (selector: string | Function | object) =>
            Question.about<Promise<Element>>(`the ${ name }`, actor =>
                BrowseTheWeb.as(actor).locate(selector),
            ),
    }),
};

const Text = {
    of: (target: Question<Promise<Element>>) =>
        Question.about<Promise<string>>(`text of ${ target }`, actor =>
            actor.answer(target).then(element => element.getText()),
        ),
};

const TestPage = {
    Title: Target.the('header').locatedBy('h1'),
};

class BrowseTheWeb implements Ability {
    static using(browserInstance: BrowserObject) {
        return new BrowseTheWeb(browserInstance);
    }

    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    constructor(private readonly browserInstance: BrowserObject) {
    }

    get(destination: string): Promise<void> {
        return this.browserInstance.url(destination);
    }

    locate(selector: string | Function | object): Promise<Element> {
        return this.browserInstance.$(selector);
    }
}
