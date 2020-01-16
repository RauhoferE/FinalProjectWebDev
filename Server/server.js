"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var uuid = require("uuid");
// The server as a class.
var Server = /** @class */ (function () {
    // Initializes the server.
    function Server() {
        var _this = this;
        // The name of the server.
        this.serverName = "webserver";
        // The array of login tokens.
        this.tokens = [];
        // The credentials stored on the server.
        this.cred = [['admin', 'pw']];
        // The score board.
        this.scoreCard = [['admin', '99999999', 'Cool Game'], ['noob', '-13', 'Bad Game']];
        // The score board with only the top ten players.
        this.tempArr = [];
        // initialize the express js app
        this.app = express();
        // register central logging
        this.app.use(this.logMiddleware.bind(this));
        // add the processing of json payload
        this.app.use([bodyParser.json()]);
        // offer the angular page PacMan\dist\PacMan
        this.app.use(express.static(path.join(__dirname, "../PacMan/dist/PacMan"))); // http://expressjs.com/en/starter/static-files.html
        // This method checks if the username and password are correct.
        this.app.post('/signin', function (req, res) {
            var isLog = false;
            for (var _i = 0, _a = _this.cred; _i < _a.length; _i++) {
                var element = _a[_i];
                console.log(element[0]);
                if (element[0] === req.body.username && element[1] === req.body.password) {
                    isLog = true;
                    break;
                }
                else {
                    isLog = false;
                }
            }
            if (isLog) {
                console.log('  auth: ' + req.header('Authorization'));
                var newToken = uuid();
                _this.tokens.push(newToken);
                console.log('  token added to store: ' + newToken);
                res.status(200).json({ token: newToken });
            }
            else {
                res.status(403).json({ reason: 'wrong credentials' });
            }
        });
        // This method lets users register an account.
        this.app.post('/credentials', function (req, res) {
            var isRegistred = false;
            for (var _i = 0, _a = _this.cred; _i < _a.length; _i++) {
                var element = _a[_i];
                if (element[0] === req.body.username) {
                    isRegistred = true;
                    break;
                }
                else {
                    isRegistred = false;
                }
            }
            if (isRegistred) {
                res.status(403).json({ reason: 'Name already taken' });
            }
            else {
                _this.cred.push([req.body.username, req.body.password]);
                res.status(200).json({ reason: 'Successfull' });
            }
        });
        // This method lets users post their score.
        this.app.post('/score', function (req, res) {
            var curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (_this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            }
            else {
                _this.scoreCard.push([req.body.username, req.body.points, req.body.message]);
                _this.scoreCard.sort(_this.compare);
                res.status(200).json({ reason: 'Points added' });
                console.log('  data returned properly');
            }
        });
        // This method gets the top score from the leader board.
        this.app.get('/score', function (req, res) {
            var curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (_this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            }
            else {
                var arrLength = 10;
                if (_this.scoreCard.length < 10) {
                    arrLength = _this.scoreCard.length;
                }
                for (var index = 0; index < arrLength; index++) {
                    _this.tempArr.push(_this.scoreCard[index]);
                }
                res.status(200).json({ board: _this.tempArr });
                console.log('  data returned properly');
            }
        });
        this.app.get('');
        // This method returns data from the server.
        this.app.get('/data', function (req, res) {
            var curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (_this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            }
            else {
                res.status(200).json(['img1', 'img2', 'img3']);
                console.log('  data returned properly');
            }
        });
        // This method starts the server on the specified ip and port number.
        this.app.listen(3000, function () { return console.log('started at http://localhost:3000/'); });
    }
    // THis method compares the elements of the score board with each other and sorts them descendingly.
    Server.prototype.compare = function (a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] < b[1]) ? 1 : -1;
        }
    };
    // The logger middle ware.
    Server.prototype.logMiddleware = function (req, res, next) {
        console.log(this.serverName + ': ' + req.url);
        next();
    };
    return Server;
}());
exports.Server = Server;
// create the server
new Server();
