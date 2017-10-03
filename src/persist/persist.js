
var mongoose    = require('mongoose');
var User   = require('./entities/user');
var config = require('../../config/config'); // get our config file


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
    userExists: function(email, cb){

        User.findOne({ 'email':  email}, function (err, user) {
            if (err) cb(new Error('Error in the query'));
            if(user != null) cb(null, user);
            else cb(null, null);
        });
    },
    findOneByPublicKey: function(public_key, cb){

        User.findOne({ 'public_key':  public_key}, function (err, user) {
            console.log(user);
            if (err) cb(new Error('Error in the query'));
            if(user != null) cb(null, user);
            else cb(null, null);
        });
    },
    getCredentials: function(auth_header, callbackSuccess){
        var tokenized_auth = auth_header.split(' ');
        var auth_code = tokenized_auth[tokenized_auth.length - 1];
        User.findOne({ 'auth_code':  auth_code}, function (err, user) {
            var credentials = {'access_token': user.access_token, 'refresh_token': user.refresh_token,
            'token_type': user.token_type, 'expiry_date': user.expiry_date};
            callbackSuccess(credentials);
        });
    }
}
