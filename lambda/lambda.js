var google = require('googleapis');
var googleAuth = require('google-auth-library');

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

exports.handler = function(event, context, callback) {

    console.log("Calendar lambda started");

    var clientSecret = process.env.CLIENT_SECRET;
    var clientId = process.env.CLIENT_ID;
    var auth = new googleAuth();


    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    oauth2Client.setCredentials({
        access_token: event.accessToken,
        refresh_token: event.refreshToken
    });

    var calendar = google.calendar('v3');
    var roomSchedules = [];
    ROOMS.forEach(room => {
        var googleApiUsePromise = new Promise((resolve, reject) => {
            calendar.events.list({
                auth: oauth2Client,
                calendarId: room.calendarId,
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                timeZone: 'UTC',
                singleEvents: true,
                orderBy: 'startTime'
            }, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    var roomSchedule = {
                        name: response.summary,
                        schedules: [] // TODO: probably it is better to name it "events"
                    };
                    response.items.forEach(event => roomSchedule.schedules.push({
                        summary: event.summary,
                        start_time: event.start.dateTime,
                        end_time: event.end.dateTime,
                        owner: event.creator.email,
                        attendees: event.attendees
                    }));
                    resolve(roomSchedule);
                }
            });
        });
        googleApiUsePromise.then(
            result => {
                roomSchedules.push(result);
                if (roomSchedules.length === ROOMS.length) {
                    console.log(roomSchedules);
                    var attendeeRelatedRoomSchedules =
                        roomSchedules.filter(roomSchedule => roomSchedule.attendees.some(attendee => attendee.email === event.email));
                    console.log(attendeeRelatedRoomSchedules);
                    callback(null, attendeeRelatedRoomSchedules);
                }
            },
            error => {
                console.log("Something went wrong during google calendar api invocation");
                callback({
                    status: 403,
                    message: "Error during google calendar API invocation.\n" + error
                }, null);
            });
    });
}

