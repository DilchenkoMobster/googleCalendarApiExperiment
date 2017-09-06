

var startServer = function () {
    router.get('/', function (req, res) {
        authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });

        res.render('index', {google_auth_url: authUrl})


    });

    router.get('/callback_authorized', function (req, res) {
        oauth2Client.getToken(req.query.code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            listEvents(oauth2Client, res);
        });

    });

    app.use(bodyParser.json());
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
    app.use(router);

    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
}

module.exports =  {
    startServer: startServer
};