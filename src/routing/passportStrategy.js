var CustomStrategy = require('passport-custom');
var errorConstants = require('../errorConstants.js');
var persist = require('../persist/persist');
module.exports = function (passport) {
    passport.use('access_token_signature', new CustomStrategy(
        function (req, done) {
            var access_token = req.headers['access_token'];
            persist.findOneByAccessToken(access_token, function (err, user) {
                if (err && !user) {
                    done(null, false, errorConstants.ERROR_UNKOWN_ERROR);
                } else if (!err && !user) {
                    done(null, false, errorConstants.ERROR_INVALID_TOKEN);
                } else if (!err && user) {
                    done(null, user);
                }
            })

        }));
    return passport;
};