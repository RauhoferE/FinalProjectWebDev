import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as uuid from 'uuid';

// The server as a class.
export class Server {
    // The server uses express js.
    public app: express.Express;

    // The name of the server.
    public serverName = "webserver";

    // The array of login tokens.
    public tokens: string[] = [];

    // The credentials stored on the server.
    public cred: [string, string][] = [['admin', 'pw']];

    // The score board.
    public scoreCard : [string, string, string][] = [['admin', '99999999', 'Cool Game'],['noob', '-13', 'Bad Game']];

    // The score board with only the top ten players.
    private tempArr: [string,string,string][] = [];

    // Initializes the server.
    constructor() {
        // initialize the express js app
        this.app = express();

        // register central logging
        this.app.use(this.logMiddleware.bind(this));

        // add the processing of json payload
        this.app.use([bodyParser.json()])

        // offer the angular page PacMan\dist\PacMan
        this.app.use(express.static(path.join(__dirname, "../PacMan/dist/PacMan")));  // http://expressjs.com/en/starter/static-files.html

        // This method checks if the username and password are correct.
        this.app.post('/signin', (req, res) => {
            var isLog = false;
            for (let element of this.cred) {
                console.log(element[0]);
                
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

        // This method lets users register an account.
        this.app.post('/credentials', (req, res) => {

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
                this.cred.push([req.body.username, req.body.password]);
                res.status(200).json({reason: 'Successfull'})
            }
        });

        // This method lets users post their score.
        this.app.post('/score', (req, res) => {
            let curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            } else {

                this.scoreCard.push([req.body.username, req.body.points, req.body.message]);
                this.scoreCard.sort(this.compare);
                res.status(200).json({reason: 'Points added'});
                console.log('  data returned properly');
            }
        })

        // This method gets the top score from the leader board.
        this.app.get('/score', (req, res) => {
            let curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            } else {

                var arrLength = 10;
                if (this.scoreCard.length < 10) {
                    arrLength = this.scoreCard.length;
                } 

                for (let index = 0; index < arrLength; index++) {
                    this.tempArr.push(this.scoreCard[index]);
                }
                res.status(200).json({board: this.tempArr});
                console.log('  data returned properly');
            }
        })

        this.app.get('')

        // This method returns data from the server.
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

        // This method starts the server on the specified ip and port number.
        this.app.listen(3000, () => console.log('started at http://localhost:3000/'));
    }

    // THis method compares the elements of the score board with each other and sorts them descendingly.
    private compare(a: any,b: any): any {
            if (a[1] === b[1]) {
                return 0;
            }
            else {
                return (a[1] < b[1]) ? 1 : -1;
            }
        
    }

    // The logger middle ware.
    private logMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log(this.serverName + ': ' + req.url);
        next();
    }
}

// create the server
new Server();