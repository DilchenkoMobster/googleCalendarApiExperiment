
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
    updateUser: function(public_key, access_token, refresh_token, auth_type, expire_date, cb){

        // TODO. Very unlikely to have duplicated pub_keys but possible.
        User.findOne({ 'public_key':  public_key}, function (err, user) {
            if (err) cb(new Error('Error in the query'));
            if(user != null){
                user.set({ g_access_token: access_token });
                user.set({ g_refresh_token: refresh_token });
                user.set({ g_token_type: auth_type });
                user.set({ g_expiry_date: expire_date });
                user.save();
                cb(null,user);

            }
            else cb(new Error('User not found'), null);
        });




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
    getCredentials: function(req, callbackSuccess){
        User.findOne({ 'public_key':  req.headers['public_key']}, function (err, user) {
            var credentials = {'access_token': user.g_access_token, 'refresh_token': user.g_refresh_token,
            'token_type': user.g_token_type, 'expiry_date': user.g_expiry_date};
            callbackSuccess(credentials);
        });
    }
}
