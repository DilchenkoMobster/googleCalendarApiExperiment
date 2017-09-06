var createScheduleItem = function (event) {
    return {
        summary: event.summary,
        start_time: event.start.dateTime,
        end_time: event.end.dateTime,
        owner: event.creator.email,
        atendees: event.atendees
    };
}

module.exports = {
    createScheduleItem: createScheduleItem
};