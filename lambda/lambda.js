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
    },
    amsEurope = {
        calendarId: "mobiquityinc.com_2d3139333131343038333936@resource.calendar.google.com",
        name: "AMS-Europe"
    },
    amsUsa = {
        calendarId: "mobiquityinc.com_2d3638343238303138363933@resource.calendar.google.com",
        name: "AMS-USA"
    },
    amsAhmedabad = {
        calendarId: "mobiquityinc.com_2d3537343130373739323836@resource.calendar.google.com",
        name: "AMS-Ahmedabad"
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
                timeMin: new Date().toISOString(),
                timeMax: new Date(new Date().setHours(23,59,59,999)).toISOString(),
                maxResults: 100,
                timeZone: 'UTC',
                singleEvents: true,
                orderBy: 'startTime'
            }, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    var roomInfo = {
                        name: response.summary,
                        events: []
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
                        console.log(roomsInfos);
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

