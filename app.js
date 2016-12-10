
var path = require('path');
var Loader = require('loader');
var express = require('express');
var session = require('express-session');
var errorHandler = require('errorhandler');
var config = require('./config').config;
var passport = require('passport');
require('./models');
var routes = require('./routes');
var auth = require('./middlewares/auth');
var MongoStore = require('connect-mongo')(session);
var _ = require('lodash');
var csurf = require('csurf');
var compress = require('compression');
var bodyParser = require('body-parser');
var staticDir = path.join(__dirname, 'public');
var assets = {};
if (config.mini_assets) {
    try {
        assets = require('./assets.json');
    } catch (e) {
        console.log('You must execute `make build` before start app when mini_assets is true.');
        throw e;
    }
}

// host: http://127.0.0.1
var urlinfo = require('url').parse(config.host);
config.hostname = urlinfo.hostname || config.host;

var app = express();

// configuration in all env
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
//app.locals._layoutFile = 'frontlayout.html';

app.use(require('response-time')());
/*app.use(bodyParser.json({limit: '50mb'}));*/
app.use(bodyParser.urlencoded({
    extended: true,limit: '500000mb'
}));
app.use(require('method-override')());
app.use(require('cookie-parser')(config.session_secret));
app.use(compress());
app.use(session({
    secret: config.session_secret,
    key: 'sid',
    store: new MongoStore({
        url:config.is_dev?config.dev_db:config.db
    }),
    resave: true,
    saveUninitialized: true
}));
app.use('/public', express.static(staticDir));
app.use(require('./controllers/sign').auth_user);
app.use(require('./controllers/type').setType);

app.use(passport.initialize());


app.use(express.json()).use(express.urlencoded())
// custom middleware

//app.use(auth.blockUser());
app.use(Loader.less(__dirname));

app.use(errorHandler({ dumpExceptions: true, showStack: true }));
if (!config.debug) {
    app.set('view cache', true);
}
 app.set('view cache', false);
//app.set('view cache', false);
///这个一定到时见要改的
// set static, dynamic helpers
_.extend(app.locals, {
    config: config,
    Loader: Loader,
    assets: assets
});

_.extend(app.locals, require('./common/render_helpers'));
app.use(function (req, res, next) {
    res.locals.csrf = req.csrfToken ? req.csrfToken() : '';
    next();
});


routes(app);

app.listen(config.port, function () {
    console.log("NodeClub listening on port %d in %s mode", config.port, app.settings.env);
    console.log("God bless love....");
    console.log("You can debug your app with http://" + config.hostname + ':' + config.port);
});

module.exports = app;
