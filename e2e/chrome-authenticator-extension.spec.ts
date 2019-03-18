import 'mocha';
import { Ensure, equals } from '@serenity-js/assertions';
import { Actor } from '@serenity-js/core';
import { LocalServer, ManageALocalServer, StartLocalServer } from '@serenity-js/local-server';
import { BrowseTheWeb, Navigate, Target, Text } from '@serenity-js/protractor';
import { by, protractor } from 'protractor';
import { TestApp } from './TestApp';

describe('Chrome Authenticator Extension', function () {

    this.timeout(5000);

    const Dave = Actor.named('Dave').whoCan(
        BrowseTheWeb.using(protractor.browser),
        ManageALocalServer.running(TestApp.allowingUsersAuthenticatedWith({
            username: 'admin',
            password: 'Password123',
        })),
    );

    const TestPage = {
        Title: Target.the('header').located(by.css('h1')),
    };

    beforeEach(() => Dave.attemptsTo(StartLocalServer.onRandomPort()));

    it(`enables a Chrome web browser-based test to authenticate with a web app`, () => Dave.attemptsTo(
        Navigate.to(LocalServer.url()),
        Ensure.that(Text.of(TestPage.Title), equals('Authenticated!')),
    ));
});
