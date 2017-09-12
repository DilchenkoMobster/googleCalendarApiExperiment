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

function filterOnlyRelatedRooms(roomsInfos, attendeeEmail) {
    roomsInfos.forEach(roomInfo =>
        roomInfo.events = roomInfo.events.filter(event => event.attendees.some(attendee => attendee.email === attendeeEmail)));
    return roomsInfos.filter(roomInfo => roomInfo.events.length !== 0);
}

exports.handler = function(event, context, callback) {

    console.log("Calendar lambda started");

    var clientSecret = process.env.CLIENT_SECRET;
    var clientId = process.env.CLIENT_ID;
    var auth = new googleAuth();


    var oauth2Client = new auth.OAuth2(clientId, clientSecret);

    oauth2Client.setCredentials({
        access_token: event.accessToken,
        refresh_token: event.refreshToken
    });

    var calendar = google.calendar('v3');
    var roomsInfos = [];
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
                    var roomInfo = {
                        name: response.summary,
                        events: [] // TODO: probably it is better to name it "events"
                    };
                    response.items.forEach(event => roomInfo.events.push({
                        summary: event.summary,
                        start_time: event.start.dateTime,
                        end_time: event.end.dateTime,
                        owner: event.creator.email,
                        attendees: event.attendees
                    }));
                    resolve(roomInfo);
                }
            });
        });
        googleApiUsePromise.then(
            result => {
                roomsInfos.push(result);
                if (roomsInfos.length === ROOMS.length) {
                    if (event.email) {
                        var attendeeRelatedRoomsInfos = filterOnlyRelatedRooms(roomsInfos, event.email);
                        callback(null, attendeeRelatedRoomsInfos);
                    } else {
                        callback(null, roomsInfos);
                    }
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

