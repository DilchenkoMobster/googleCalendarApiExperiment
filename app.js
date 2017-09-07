var googleAuth = require('google-auth-library');
var auth = new googleAuth();
var persist = require('./persist');
var eventUtils = require('./eventUtils');
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Hardcoded the client id, secret and redirect_url
_oauth2Client = new auth.OAuth2(‘client_id','client_secret', 'http://localhost:3000/callback_authorized');
var google = require('googleapis');


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
            persist.storeUser(token.access_token, token.refresh_token, token.token_type, token.expiry_date, code, function(){
                callback(code);
            },
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


    }

}