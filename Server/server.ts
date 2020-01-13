import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as uuid from 'uuid';

export class Server {
    public app: express.Express;
    public serverName = "webserver";
    public tokens: string[] = [];
    public cred: [string, string][] = [['admin', 'pw']];
    public scoreCard : [string, string][] = [['admin', '100']];

    constructor() {
        // initialize the express js app
        this.app = express();

        // register central logging
        this.app.use(this.logMiddleware.bind(this));

        // add the processing of json payload
        this.app.use([bodyParser.json()])

        // offer the angular page PacMan\dist\PacMan
        this.app.use(express.static(path.join(__dirname, "../PacMan/dist/PacMan")));  // http://expressjs.com/en/starter/static-files.html

        // make a signin endpoint with
        // - credential check
        // - logging // TODO: #GDPR :-)
        // - generate token
        // - store tokens (further improvement: expire-time)
        this.app.post('/signin', (req, res) => {
            var isLog = false;
            for (let element of this.cred) {
                if (element[0] === req.body.username && element[1] === req.body.password) {
                    isLog = true;
                    break;
                } else {
                    isLog = false;
                }
            }

        if (isLog) {
            console.log('  auth: ' + req.header('Authorization'));
            let newToken = uuid() as string;
            this.tokens.push(newToken);
            console.log('  token added to store: ' + newToken);
            res.status(200).json({ token: newToken });
        } else {
            res.status(403).json({ reason: 'wrong credentials' });
        }
        });

        this.app.post('/register', (req, res) => {

            var isRegistred = false;
            for (let element of this.cred) {
                if (element[0] === req.body.username) {
                    isRegistred = true;
                    break;
                } else {
                    isRegistred = false;
                }
            }
            if (isRegistred) {
                res.status(403).json({reason: 'Name already taken'});
            } else {
                this.cred.push(req.body.username, req.body.password);
                res.status(200).json({reason: 'Successfull'})
            }
        });

        this.app.post('/addScore', (req, res) => {
            let curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            } else {
                this.scoreCard.push([req.body.username, req.body.points]);
                res.status(200).json({reason: 'Points added'});
                console.log('  data returned properly');
            }
        })

        this.app.get('/score', (req, res) => {
            let curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            } else {
                res.status(200).json({board: this.scoreCard});
                console.log('  data returned properly');
            }
        })
        this.app.get('')

        // make a data endpoint with
        // - Auth check
        // - logging
        this.app.get('/data', (req, res) => {
            let curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            } else {
                res.status(200).json(['img1', 'img2', 'img3']);
                console.log('  data returned properly');
            }
        });

        // start the server on port 3000
        this.app.listen(3000, () => console.log('started at http://localhost:3000/'));
    }

    private logMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log(this.serverName + ': ' + req.url);
        next();
    }
}

// create the server
new Server();