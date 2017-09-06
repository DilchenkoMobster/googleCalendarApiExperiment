

var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var eventUtils = require('./eventUtils');
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser');
var router = express.Router();

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

var oauth2Client;


var ROOMS = [
    amsNYC = {
        calendarId: "mobiquityinc.com_2d3232333833353433323338@resource.calendar.google.com",
        name: "AMS-NYC"
    },
    amsFrisco = {
        calendarId: "mobiquityinc.com_2d3237333336353639353331@resource.calendar.google.com",
        name: "AMS-Frisco"
    }
]

function getClientCredentials() {
// Load client secrets from a local file.
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        var credentials = JSON.parse(content);
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    });
}

function startServer() {
    router.get('/', function (req, res) {
        authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
                res.render('index', {google_auth_url: authUrl});
            } else {
                oauth2Client.credentials = JSON.parse(token);
                listEvents(oauth2Client, res);
            }
        });
    });

    router.get('/callback_authorized', function (req, res) {
        oauth2Client.getToken(req.query.code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            listEvents(oauth2Client, res);
        });

    });

    router.get('/callback_authorized', function (req, res) {
        oauth2Client.getToken(req.query.code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            listEvents(oauth2Client, res);
        });

    });

    app.use(bodyParser.json());
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
    app.use(router);

    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
}
getClientCredentials();
startServer();

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {res} response that will be sent after retrieving of all calendars.
 */
function listEvents(auth, res) {

    var calendar = google.calendar('v3');
    var roomSchedules = [];
    ROOMS.forEach( room => {
        var googleApiUsePromise = new Promise((resolve, reject) => {
            calendar.events.list({
                auth: auth,
                calendarId: room.calendarId,
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                timeZone: 'UTC',
                singleEvents: true,
                orderBy: 'startTime'
            }, function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var roomSchedule = {
                    name: response.summary,
                    schedules: [] // TODO: probably it is better to name it "events"
                };
                response.items.forEach(event => roomSchedule.schedules.push(eventUtils.createScheduleItem(event)));
                resolve(roomSchedule);
            });
        });
        googleApiUsePromise.then(result => {
                roomSchedules.push(result);
                if (roomSchedules.length === ROOMS.length) {
                    res.render('events', {events: roomSchedules});
                }
            },
            error => console.log("Something went wrong during google calendar api invocation"));
    });
}