
var filterStrings = ['email'];

module.exports = {

    getFilteredResults: function (results, reqParams, callback) {

        var resultArray = [];
        var itemsProcessed = 0;
        if (!hasQueryParameters(reqParams)) {
            results.forEach(function (item) {
                console.log('Entered');

                itemsProcessed++
                resultArray.push(eventUtils.createScheduleItem(item));
                if (itemsProcessed === results.length && resultArray.length > 0) {
                    callback(resultArray);
                }
            });


        } else {

            results.forEach(function (item) {
                itemsProcessed++

                var isIncluded = false;
                if (filterStrings in reqParams) {
                    item.attendees.some(function (attendee) {
                        if (reqParams.email == attendee.email) {
                            isIncluded = true;
                            return true;
                        }
                    });
                    if (isIncluded) {
                        resultArray.push(eventUtils.createScheduleItem(item));
                    }
                    if (itemsProcessed === results.length) {
                        callback(resultArray);
                    }
                }

            });

        }

    },
    hasQueryParameters: function (reqParams) {
        if (reqParams != null) {
            var hasQuery = false;
            filterStrings.some(function (filter) {
                if (filter in reqParams) {
                    console.log('Has attribute');
                    hasQuery = true;
                    return hasQuery;
                }
            });
            return hasQuery;
        }
    },
    validateEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}