import express = require('express');
const basicAuth = require('express-basic-auth');

export class TestApp {
    static allowingUsersAuthenticatedWith(credentials: { username: string, password: string }) {
        const app = express();

        app.use(basicAuth({
            users: { [credentials.username]: credentials.password },
            challenge: true, // <--- needed to actually show the dialog box
        }));

        app.get('/', (req: express.Request, res: express.Response) => {
            res.send(`
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
