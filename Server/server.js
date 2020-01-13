"use strict";
exports.__esModule = true;
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var uuid = require("uuid");
var Server = /** @class */ (function () {
    function Server() {
        var _this = this;
        this.serverName = "webserver";
        this.tokens = [];
        this.cred = [['admin', 'pw']];
        this.scoreCard = [['admin', '100']];
        // initialize the express js app
        this.app = express();
        // register central logging
        this.app.use(this.logMiddleware.bind(this));
        // add the processing of json payload
        this.app.use([bodyParser.json()]);
        // offer the angular page PacMan\dist\PacMan
        this.app.use(express.static(path.join(__dirname, "../PacMan/dist/PacMan"))); // http://expressjs.com/en/starter/static-files.html
        // make a signin endpoint with
        // - credential check
        // - logging // TODO: #GDPR :-)
        // - generate token
        // - store tokens (further improvement: expire-time)
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
        this.app.post('/score', function (req, res) {
            var curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (_this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            }
            else {
                _this.scoreCard.push([req.body.username, req.body.points]);
                res.status(200).json({ reason: 'Points added' });
                console.log('  data returned properly');
            }
        });
        this.app.get('/score', function (req, res) {
            var curToken = req.header('Authorization');
            console.log('  auth: ' + curToken);
            if (_this.tokens.indexOf(curToken) === -1) {
                // https://http.cat/401
                res.status(401).json({ reason: 'not logged in' });
                console.log('  do not return data');
            }
            else {
                res.status(200).json({ board: _this.scoreCard });
                console.log('  data returned properly');
            }
        });
        this.app.get('');
        // make a data endpoint with
        // - Auth check
        // - logging
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
        // start the server on port 3000
        this.app.listen(3000, function () { return console.log('started at http://localhost:3000/'); });
    }
    Server.prototype.logMiddleware = function (req, res, next) {
        console.log(this.serverName + ': ' + req.url);
        next();
    };
    return Server;
}());
exports.Server = Server;
// create the server
new Server();
