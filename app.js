var googleAuth = require('google-auth-library');
var auth = new googleAuth();
var persist = require('./persist');
var eventUtils = require('./eventUtils');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var google = require('googleapis');
var fs = require('fs');


// Needs the client_secret.json provided by google in the same folder as app.js
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
    _oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
});


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

module.exports = {


    generateAuthUrl: function(callback){
        var authUrl = _oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        callback(authUrl);
    },

    exchangeCode: function(code, callback) {
        _oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            console.log(token);
            persist.storeUser(token.access_token, token.refresh_token, token.token_type, token.expiry_date, code,
                //If things go right, callback to
                function(){
                callback(code);
            },
                //In case things go wrong just next() by now
                function(){
                    next();
                });
        });
    },
    getCalendars: function(code, callback) {
        var calendar = google.calendar('v3');
        var roomSchedules = [];
        persist.getCredentials(code, function(credentials_info){
            _oauth2Client.credentials = credentials_info;
            ROOMS.forEach( room => {
                var googleApiUsePromise = new Promise((resolve, reject) => {
                    calendar.events.list({
                    auth: _oauth2Client,
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
                    console.log('CALLING RESOLVE');
                    resolve(roomSchedule);
                });
        });
            googleApiUsePromise.then(result => {
                roomSchedules.push(result);
            if (roomSchedules.length === ROOMS.length) {
                callback(roomSchedules);
            }
        },
            error => console.log("Something went wrong during google calendar api invocation"));
        });

        });


    },

    getCalendar: function (code, roomId, callback) {
        var calendar = google.calendar('v3');
        var roomSchedules = [];
        persist.getCredentials(code, function (credentials_info) {
            _oauth2Client.credentials = credentials_info;

            calendar.events.list({
                auth: _oauth2Client,
                calendarId: roomId,
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

                callback(roomSchedule);

            });


        });

    }

}