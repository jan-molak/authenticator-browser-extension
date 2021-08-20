/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-use-before-define, @typescript-eslint/ban-types */

import 'mocha';
import 'webdriverio';

import { Ensure, equals } from '@serenity-js/assertions';
import { Actor, actorCalled, Cast, engage } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server';
import { BrowseTheWeb, by, Navigate, Target, Text } from '@serenity-js/webdriverio';

import { TestApp } from '../TestApp';

describe('Authenticator Browser Extension, when used with WebDriver.io,', function () {

    this.timeout(30_000);

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

    it(`enables a web browser-based test to authenticate with a web app`, () =>
        actorCalled('Dave').attemptsTo(
            Navigate.to(LocalServer.url()),
            Ensure.that(Text.of(TestPage.Title), equals('Authenticated!')),
        ));
});

const TestPage = {
    Title: Target.the('header').located(by.css('h1')),
};
