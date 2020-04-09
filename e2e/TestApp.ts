import express = require('express');
import basicAuth = require('express-basic-auth');

export class TestApp {
    static allowingUsersAuthenticatedWith(credentials: { username: string; password: string }): express.Express {
        const app = express();

        app.use(basicAuth({
            users: { [credentials.username]: credentials.password },
            challenge: true, // <--- needed to actually show the dialog box
        }));

        app.get('/', (request: express.Request, response: express.Response) => {
            response.send(`
                <!DOCTYPE html>
                <html>
                    <body>
                        <h1>Authenticated!</h1>
                    </body>
                </html>
            `);
        });

        return app;
    }
}
