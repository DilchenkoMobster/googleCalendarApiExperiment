

var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var app = require('express')();
var bodyParser = require('body-parser');
var express = require('express');
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
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(content), listEvents);
    });
}

getClientCredentials();


router.get('/', function(req, res){
    authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    res.render('index', {google_auth_url: authUrl})


});

router.get('/callback_authorized', function (req, res) {
    oauth2Client.getToken(req.query.code, function(err, token) {
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

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {

    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            // callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);
}

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
 */
function listEvents(auth, res) {

    var calendar = google.calendar('v3');
    var roomSchedules = [];
    var local_room;
    for (var i in ROOMS){
        var googleApiUsePromise = new Promise((resolve, reject) => {
            calendar.events.list({
            auth: auth,
            calendarId: ROOMS[i].calendarId,
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            timeZone: 'UTC',
            singleEvents: true,
            orderBy: 'startTime'
        }, function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var events = response.items;
            if (events.length == 0) {
                console.log('No upcoming events found.');
            } else {
                var roomSchedule = {
                    name: ROOMS[i].name,
                    schedules: []
                };
                events.forEach((event) => {

                    roomSchedule.schedules.push({
                    summary: event.summary,
                    start_time: event.start.dateTime,
                    end_time: event.end.dateTime,
                    owner: event.creator.email,
                    atendees: event.atendees
                });
            });
                console.log(roomSchedule);

                local_room = roomSchedule;
                resolve(roomSchedule);
            }
        });
    });
        googleApiUsePromise.then(result => { console.log(result+'\n\n\n---------\n');roomSchedules.push(result); },
        error => console.log("Something went wrong during google calendar api invocation"));
    }
    //console.log(roomSchedules);
    return res.render('events', {events: roomSchedules});

    // googleApiUsePromise.then(
    //
    //     result => { return res.render('events', {events: [roomSchedules]}); },
    //     error => console.log("Something went wrong during google calendar api invocation"));
}