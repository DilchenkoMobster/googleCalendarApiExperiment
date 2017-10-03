var createScheduleItem = function (event) {
    return {
        summary: event.summary,
        start_time: event.start.dateTime,
        end_time: event.end.dateTime,
        owner: event.creator.email,
        atendees: event.attendees
    };
}

module.exports = {
    createScheduleItem: createScheduleItem
};