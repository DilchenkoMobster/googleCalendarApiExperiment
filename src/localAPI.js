var persist = require('./persist/persist');
var tokenUtils = require("./utils/tokenUtils.js");
var utilsObject = require('./utils/utils.js');
var errorConstants = require('./errorConstants');
var User = require('./persist/entities/user.js');
var mongoose    = require('mongoose');
var config = require('../config/config'); // get our config file

mongoose.connect(config.database); // connect to database

module.exports = {
    createUser: function (req, cb) {
        var email = req.body.email;
        var isValidEmail = utilsObject.validateEmail(email);
        if(isValidEmail){
            persist.userExists(email, function(err, lookupUser){
                if(!err && lookupUser){
                    cb(errorConstants.ERROR_USER_ALREADY_EXISTS);
                }
                else if(err && !lookupUser){
                    cb(err);
                }
                else if(!err && !lookupUser){
                    var user = new User();
                    user.email = email;
                    user.public_key = tokenUtils.generatePublicKey();
                    user.private_key = tokenUtils.generatePrivateKey();
                    user.save();
                    cb(null, user);
                }
            });
        }else{
            cb(errorConstants.ERROR_INVALID_EMAIL_FORMAT);
        }

    }
}