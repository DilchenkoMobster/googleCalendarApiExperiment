var oauthClient = require('../app.js');

module.exports = function (app, express, passport) {
    var router = express.Router();

    router.post('/protected', function (req, res, next) {
        passport.authenticate('access_token_signature', {"session": false}, function (err, user, info) {
            if (info) {
                res.status(200).json(info);
            } else {
                res.status(200).json({"messageCode": "2000", "errorMessage": "OK"});

            }
        })(req, res, next);

    });

    router.get('/generateUrl', function (req, res, next) {
        oauthClient.generateAuthUrl(function (url) {
            res.redirect(url);
        });
    });

    router.get('/callback_authorized', function (req, res) {
        oauthClient.exchangeCode(req.query.code, function (err, token) {
            if (err) {
                res.status(200).json(err);
            } else {
                res.status(200).json({'access_token': token});
            }
        });
    });

    router.get('/rooms', function (req, res, next) {
        passport.authenticate('access_token_signature', {"session": false}, function (err, user, info) {
            if (user) {
                oauthClient.getCalendars(user, req.query, function (rooms) {
                    res.status(200).json({"rooms": rooms});
                });
            } else {
                res.status(200).json(info);
            }

        })(req, res, next);
    });


    return router;
};