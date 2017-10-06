
var oauthClient = require('../googleClient.js');
var persist = require('../persist/persist');
var localAPI = require('../localAPI.js');

module.exports = function(app, express, passport) {
    var router = express.Router();

    router.post('/createUser', function (req, res) {
        localAPI.createUser(req, function (err, user) {
            if (!err) {
                res.status(200).json({"public_key": user.public_key, "private_key": user.private_key});
            } else {
                res.status(200).json(err);
            }
        });

    });

    router.post('/protected', function (req, res, next) {
        console.log(JSON.stringify(req.body));
        passport.authenticate('signature_needed', {"session": false}, function (err, user, info) {
            if (info) {
                res.status(200).json(info);
            } else {
                res.status(200).json({"messageCode": "2000", "errorMessage": "OK"});

            }
        })(req, res, next);

    });

    router.get('/generateUrl', function (req, res, next) {
        passport.authenticate('signature_needed', {"session": false}, function (err, user, info) {
            if (!info) {
                oauthClient.generateAuthUrl(req.headers['public_key'], function(authUrl){
                    res.status(200).json({"google_auth_url": authUrl});

                });
            } else {
                res.status(200).json(info);

            }

        })(req, res, next);
    });

    router.get('/isAdmin', function (req, res, next) {
        passport.authenticate('signature_needed', {"session": false}, function (err, user, info) {
            if (!info) {
                oauthClient.isAdmin(req.query.email, function (isAdmin) {
                    res.status(200).json(isAdmin);
                });
            } else {
                res.status(200).json(info);

            }


        })(req, res, next);
    });

    router.get('/callback_authorized', function (req, res) {
        oauthClient.exchangeCode(req, function(err, user){
            if(err){
                res.status(200).json(err);
            }else{
                // Returning user for DEV purposes
                res.status(200).json(user);
            }
        });


    });

    router.get('/rooms', function (req, res, next) {
        passport.authenticate('signature_needed', {"session": false}, function (err, user, info) {
            if (!info) {
                oauthClient.getCalendars(req, function (error, rooms) {
                    if(error){
                        res.status(200).json(error);

                    }else{
                        res.status(200).json(rooms);

                    }
                });
            }else{

                res.status(200).json(info);

            }
        })(req, res, next);

    });

    return router;
};

//
// var auth = function(req, res, next) {
//     if (req.query && req.headers.authorization != null)
//         persist.userExists(req.headers.authorization, function(){
//             next();
//         }, function(error){
//             console.log(error);
//             return res.sendStatus(404);
//         });
//     //return next();
//     else
//         return res.sendStatus(401);
// };
//
//
// router.get('/', function (req, res) {
//     oauthClient.generateAuthUrl(function(authUrl){
//         res.render('index', {google_auth_url: authUrl});
//
//     });
// });
//
// router.get('/isAdmin', function (req, res) {
//     oauthClient.isAdmin(req.query.email, function(isAdmin){
//         res.status(200).json(isAdmin);
//     });
//
// router.get('/callback_authorized', function (req, res) {
//     oauthClient.exchangeCode(req.query.code, function(token){
//         res.status(200).json({'token': token});
//     });
// });
//
// router.get('/rooms', auth, function (req, res) {
//     oauthClient.getCalendars(req.headers.authorization, req.query, function(rooms){
//         res.status(200).json(rooms);
//     });
// });
//
// router.get('/rooms/:roomId', auth, function (req, res) {
//     oauthClient.getCalendar(req.headers.authorization, req.params, req.query, function(room){
//         res.status(200).json(room);
//     });
// });
//

// });