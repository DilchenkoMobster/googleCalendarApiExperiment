var mongoose = require('mongoose');
var User = require('./entities/user');
var config = require('../../config/config'); // get our config file
var logger = require('../utils/logger').logger;


mongoose.connect(config.database); // connect to database

module.exports = {
    storeUser: function (email, access_token, g_access_token, g_refresh_token, type, until, callback) {
        var user = new User({
            email: email,
            access_token: access_token,
            g_access_token: g_access_token,
            g_refresh_token: g_refresh_token,
            g_token_type: type,
            g_expiry_date: until
        });
        user.save();
        logger.log('info', 'Stored user %s', email);

        callback(user);
    },
    userExists: function (email, cb) {

        User.findOne({'email': email}, function (err, user) {
            if (err) cb(new Error('Error in the query'));
            if (user != null) cb(null, user);
            else cb(null, null);
        });
    },
    findOneByAccessToken: function (access_token, cb) {
        User.findOne({'access_token': access_token}, function (err, user) {
            if (err) cb(new Error('Error in the query'));
            if (user != null) cb(null, user);
            else cb(null, null);
        });
    }
};
