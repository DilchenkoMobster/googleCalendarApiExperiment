var CustomStrategy = require('passport-custom');
var errorConstants = require('../errorConstants.js');
var tokenUtils = require('../utils/tokenUtils.js');
var persist = require('../persist/persist');
module.exports = function(passport){


    passport.use('signature_needed', new CustomStrategy(
        function(req, done) {
            var pub_key = req.headers['public_key'];
            var timestamp = req.headers['timestamp'];
            var signature = req.headers['signature'];

            persist.findOneByPublicKey(pub_key, function(err,user){

                if(err && !user){
                    done(null, false, errorConstants.ERROR_UNKOWN_ERROR);
                }else if(!err && !user){
                    done(null, false, errorConstants.ERROR_USER_NOT_FOUND);
                }else{
                    var priv_key = user.private_key;
                    tokenUtils.compareSignatures(priv_key, pub_key, req, function(err){
                        if(err){
                            done(null, false, errorConstants.ERROR_INVALID_SIGNATURE);
                        }else{
                            done(null,user);
                        }
                    })

                }
            })
        }));
    return passport;
};