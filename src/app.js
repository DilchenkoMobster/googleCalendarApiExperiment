var googleAuth = require('google-auth-library');
var logger = require('./utils/logger').logger;
var persist = require('./persist/persist');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email'];
var google = require('googleapis');
var plus = google.plus('v1');
var tokenUtils = require('./utils/tokenUtils.js');
var fs = require('fs');
var path = require("path");
var utilsObject = require('./utils/utils.js');
var errorConstants = require('./errorConstants');

// Needs the client_secret.json provided by google in the same folder as app.js
fs.readFile(path.resolve(__dirname) + '/../config/client_secret.json', function processClientSecrets(err, content) {

    if (err) {
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

module.exports = {
    generateAuthUrl: function (callback) {
        var authUrl = _oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        logger.log('info', 'The url is %s', authUrl);
        callback(authUrl);
    },

    isAdmin: function (email, callback) {
        var isEmailValid = utilsObject.validateEmail(email);
        if (isEmailValid) {
            var admins = ['aperez@mobiquityinc.com', 'slentsov@mobiquityinc.com'];
            admins.indexOf(email) > -1 ? callback({"isAdmin": true}) : callback({"isAdmin": false});
        } else {
            logger.log('error', 'The email %s is invalid', email);
            callback(errorConstants.ERROR_INVALID_EMAIL_FORMAT);
        }
    },

    exchangeCode: function (code, callback) {
        _oauth2Client.getToken(code, function (err, token) {
            if (err) {
                logger.log('info', 'Error while retrieving the token for code %s', code);
                callback(errorConstants.ERROR_UNKOWN_ERROR, null);
                return;
            }
            _oauth2Client.credentials = token;
            plus.people.get({userId: 'me', auth: _oauth2Client}, function (err, response) {
                var email = response.emails[0].value;
                if (utilsObject.isValidEmail(email)) {
                    persist.userExists(email, function (err, user) {
                        if (!err && !user) {
                            persist.storeUser(email, tokenUtils.generateAccessToken(), token.access_token, token.refresh_token, token.token_type, token.expiry_date,
                                function (user) {
                                    callback(null, user.access_token);
                                });

                        } else if (user) {
                            logger.log('info', 'The user %s tried to register again', user.email);
                            callback(errorConstants.ERROR_USER_ALREADY_EXISTS, user);
                        }
                    });
                } else {
                    logger.log('info', 'Unauthorized (non mobiquity) user %s tried to login in the application', email);
                    callback(errorConstants.ERROR_NOT_A_MOBIQUITY_EMAIL, null);
                }
            });
        });
    },

    // @formatter:off
    getCalendars: function(user, reqQuery, callback) {
        var calendar = google.calendar('v3');
        var roomSchedules = [];
        var promiseCounter = 0;
            var credentials = {
                'access_token': user.g_access_token, 'refresh_token': user.g_refresh_token,
                'token_type': user.g_token_type, 'expiry_date': user.g_expiry_date
            };
            _oauth2Client.credentials = credentials;
        logger.log('info', 'Retrieving rooms for user %s', user.email);

            ROOMS.forEach( room => {
                var googleApiUsePromise = new Promise((resolve, reject) => {
                    calendar.events.list({
                    auth: _oauth2Client,
                    calendarId: room.calendarId,
                    timeMin: (new Date()).toISOString(),
                    timeMax: new Date(new Date().setHours(23,59,59,999)).toISOString(),
                    maxResults: 20, //max is 250
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
                    utilsObject.getFilteredResults(response.items, reqQuery,function(resultArray){
                        console.log('CALLING RESOLVE');
                        roomSchedule.schedules = resultArray;
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
                callback(roomSchedules);
            }
        },
            error => console.log("Something went wrong during google calendar api invocation"));
        });

    }

    // @formatter:on


}
