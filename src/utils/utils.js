var filterStrings = ['email'];
var eventUtils = require('./eventUtils.js');
module.exports = {

    getFilteredResults: function (results, reqParams, callback) {

        var resultArray = [];
        var itemsProcessed = 0;
        if (!this.hasQueryParameters(reqParams)) {
            results.forEach(function (item) {
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
                }
            });
            callback(resultArray);

        }
    },
    hasQueryParameters: function (reqParams) {
        if (reqParams != null) {
            var hasQuery = false;
            filterStrings.some(function (filter) {
                if (filter in reqParams) {
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
    },
    isValidEmail: function (email) {
        if (this.validateEmail(email)) {
            if (email.split('@')[1] == 'mobiquityinc.com') {
                return true;
            }
            return false;
        }
        return false;
    }
}