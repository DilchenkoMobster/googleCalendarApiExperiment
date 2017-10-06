var googleAuth = require('google-auth-library');
var auth = new googleAuth();
var persist = require('./persist/persist');
var eventUtils = require('./utils/eventUtils');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var google = require('googleapis');
var fs = require('fs');
var path = require("path");
var utilsObject = require('./utils/utils.js');
var errorConstants = require('./errorConstants');


// TODO Polish the calendars endpoint, create missing tests, define messages and handle access and refresh tokens

var ROOMS = [
    amsNYC = {
        calendarId: "mobiquityinc.com_2d3232333833353433323338@resource.calendar.google.com",
        name: "AMS-NYC"
    },
    amsFrisco = {
        calendarId: "mobiquityinc.com_2d3237333336353639353331@resource.calendar.google.com",
        name: "AMS-Frisco"
    }
];

// Needs the client_secret.json provided by google in the same folder as app.js
fs.readFile(path.resolve(__dirname) + '/../config/client_secret.json', function processClientSecrets(err, content) {

    if (err) {
        console.log('Error loading client secret file: ' + err);
        console.log(path.resolve(__dirname) + '/client_secret.json');
        return;
    }
    var credentials = JSON.parse(content);
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    _oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
});


module.exports = {


    generateAuthUrl: function (public_key, callback) {
        var authUrl = _oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            state: public_key
        });

        callback(authUrl);
    },

    isAdmin: function (email, callback) {
        var isEmailValid = utilsObject.validateEmail(email);
        if (isEmailValid) {
            var admins = ['aperez@mobiquityinc.com', 'slentsov@mobiquityinc.com'];
            admins.indexOf(email) > -1 ? callback({"isAdmin": true}) : callback({"isAdmin": false});
        } else {
            callback(errorConstants.ERROR_INVALID_EMAIL_FORMAT);
        }


    },

    exchangeCode: function (req, callback) {
        try {
            _oauth2Client.getToken(req.query.code, function (err, token) {
                if (err) {
                    callback(errorConstants.ERROR_INVALID_GRANT, null);
                }else {
                    persist.updateUser(req.query['state'], token.access_token, token.refresh_token, token.token_type, token.expiry_date, function (err, user) {
                        callback(null, user);
                    });
                }
            });
        }catch(err){
            callback(errorConstants.ERROR_INVALID_GRANT, null);

        }
    },
    getCalendars: function(req, callback) {


        var calendar = google.calendar('v3');
        var roomSchedules = [];
        var promiseCounter = 0;
        persist.getCredentials(req, function(credentials_info){
            _oauth2Client.credentials = credentials_info;
            ROOMS.forEach( room => {
                var googleApiUsePromise = new Promise((resolve, reject) => {
                    calendar.events.list({
                    auth: _oauth2Client,
                    calendarId: room.calendarId,
                    timeMin: (new Date()).toISOString(),
                    //timeMax: new Date(new Date().setHours(23,59,59,999)).toISOString(),
                    maxResults: 100, //max is 250
                    timeZone: 'UTC',
                    singleEvents: true,
                    orderBy: 'startTime'
                }, function (err, response) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        callback(errorConstants.ERROR_UNKOWN_ERROR, null);
                    }
                    var roomSchedule = {
                        name: response.summary,
                        schedules: [] // TODO: probably it is better to name it "events"
                    };
                    // roomSchedule = getFilteredResults(response.items);
                    utilsObject.getFilteredResults(response.items, req.query, function(resultArray){
                        console.log('CALLING RESOLVE');
                        roomSchedule.schedules = resultArray;
                        console.log(roomSchedule);
                        resolve(roomSchedule);

                    });

                });
        });

            googleApiUsePromise.then(result => {
                promiseCounter++;
            if(result.schedules.length >= 1){
                roomSchedules.push(result);
            }
            if (promiseCounter === ROOMS.length) {
                callback(null, {"rooms": roomSchedules});
            }
        },
            error => callback(errorConstants.ERROR_UNKOWN_ERROR, null));
        });

        });


    }
}