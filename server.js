// modules =================================================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/db'); // get db config file
var User        = require('./app/models/User'); // get the mongoose model
var TrainingLogs        = require('./app/models/TrainingLogs'); // get the mongoose model
var PromotionLogs        = require('./app/models/PromotionLogs'); // get the mongoose model
var WarningLogs			= require('./app/models/WarningLogs');
var StrikeLogs			= require('./app/models/StrikeLogs');
var DemotionLogs			= require('./app/models/DemotionLogs');
var FiredLogs			= require('./app/models/FiredLogs');
var TransferLogs			= require('./app/models/TransferLogs');
var RankSellingLogs			= require('./app/models/RankSellingLogs');
var LoaLogs			= require('./app/models/LoaLogs');
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
var methodOverride = require('method-override');

// configuration ===========================================
	
// config files
var port = process.env.PORT || 8080; // set our port
mongoose.connect(config.database); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(morgan('dev'));
app.use(passport.initialize());

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://uia-portal.scalingo.io');

    next();
}

app.use(allowCrossDomain);

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app, User, passport, jwt, config, TrainingLogs, PromotionLogs, WarningLogs, DemotionLogs, StrikeLogs, FiredLogs, TransferLogs, RankSellingLogs, LoaLogs); // pass our application into our routes

// start app ===============================================
app.listen(port);	
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app