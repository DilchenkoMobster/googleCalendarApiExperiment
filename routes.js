var express = require('express');
var router = express.Router();
var oauthClient = require('./app.js');
var persist = require('./persist');

var auth = function(req, res, next) {
    if (req.query && req.headers.authorization != null)
        persist.userExists(req.headers.authorization, function(){
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
    oauthClient.getCalendars(req.headers.authorization, req.query, function(rooms){
        res.status(200).json(rooms);
    });
});

router.get('/rooms/:roomId', auth, function (req, res) {
    oauthClient.getCalendar(req.headers.authorization, req.params, req.query, function(room){
        res.status(200).json(room);
    });
});


module.exports = router;
