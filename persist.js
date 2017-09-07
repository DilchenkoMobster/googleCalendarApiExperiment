
var mongoose    = require('mongoose');
var User   = require('./user');
var config = require('./config'); // get our config file


mongoose.connect(config.database); // connect to database


module.exports = {
    storeUser: function(access, refresh, type, until, auth, callbackSuccess){
        user = new User({
            auth_code: auth,
            access_token: access,
            refresh_token: refresh,
            token_type: type,
            expiry_date: until
        });
        console.log(user);

        user.save();
        callbackSuccess();
    },
    userExists: function(auth_code, callbackSuccess, callbackFailure){
        User.findOne({ 'auth_code':  auth_code}, function (err, user) {
            if (err) callbackFailure('Error in the query');
            if(user != null) callbackSuccess(user);
            else callbackFailure('Not found');
        });
    },
    getCredentials: function(auth_code, callbackSuccess){
        User.findOne({ 'auth_code':  auth_code}, function (err, user) {
            var credentials = {'access_token': user.access_token, 'refresh_token': user.refresh_token,
            'token_type': user.token_type, 'expiry_date': user.expiry_date};
            callbackSuccess(credentials);
        });
    }
}
