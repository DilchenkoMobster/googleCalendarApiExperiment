var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var port = 3000;
var passportStrategy = require('./routing/passportStrategy')(passport);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.use(passportStrategy.initialize());
app.use(passportStrategy.session());
var router = require('./routing/routes')(app, express, passportStrategy);


app.use(router);
app.listen(port);
