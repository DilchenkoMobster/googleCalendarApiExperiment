var express = require('express');
var router = express.Router();
var oauthClient = require('./app.js');
var persist = require('./persist');

var auth = function(req, res, next) {
    if (req.query && req.query.auth_code != null)
        persist.userExists(req.query.auth_code, function(){
            next();
        }, function(error){
            console.log(error);
            return res.sendStatus(404);
        });
    //return next();
    else
        return res.sendStatus(401);
};


router.get('/', function (req, res) {
    oauthClient.generateAuthUrl(function(authUrl){
        res.render('index', {google_auth_url: authUrl});

    });
});

router.get('/callback_authorized', function (req, res) {
    oauthClient.exchangeCode(req.query.code, function(token){
        res.status(200).json({'token': token});
    });
});

router.get('/rooms', auth, function (req, res) {
    oauthClient.getCalendars(req.query.auth_code, function(rooms){
        res.status(200).json({'rooms': rooms});
    });
});


module.exports = router;
