var express = require('express');
var path = require('path');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var bluebirdPromise = require('bluebird');
var moment = require('moment');
var schedule = require('node-schedule');
var collector = require('./routes/collector/collector.js');
var nodemailer = require('nodemailer');
var auth = require('./auth.js');
var everyWeekday5pm = new schedule.RecurrenceRule();
everyWeekday5pm.dayOfWeek = [new schedule.Range(1, 5)]; //monday thru friday.
everyWeekday5pm.hour = 17;	//5pm
everyWeekday5pm.minute = 0;
var everyThursday8pm = {hour: 20, minute: 0, dayOfWeek: 4};

// DB configuration ===============================================================
var Stock = require('./routes/collector/stock');
var newStock = require('./routes/collector/newStock');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

var app = express();
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(bodyParser.json());    // parse application/json

var j = schedule.scheduleJob(everyWeekday5pm, updateStocks);
var j2 = schedule.scheduleJob(everyThursday8pm, function(){
	var today = getToday();
	console.log("sending weekly mail for "+today);
	if(collector.arrStocks.length > 0)
	{
		sendMail(today);
	}
	collector.arrStocks = [];
});

//load routes
require('./routes/routes.js')(app);

//mailer configuration
var transporter = nodemailer.createTransport({
service: 'Gmail',
auth: {
	type: 'OAuth2',
	user: auth.source_email,
	clientId: auth.client_id,
	clientSecret: auth.client_secret,
	refreshToken: auth.refresh_token
}
});


function getToday(){
	return moment(new Date()).format("YYYY/MM/DD");
}

function updateStocks(){
	var ticker = req.body.ticker.toUpperCase();
	//check mongoDB
	Stock.find({}).populate('yesterday').exec(function(err, stocks){
		if(err)
		{
			console.log(err);
		}
		if(stocks.length > 0)
		{
			for(var i = stocks.length-1; i>=0; i--)
			{
				//space it out to not kill Yahoo
				setTimeout(function(){
					var stock = stocks[i];
					console.log("updating "+stock.ticker);
					collector.update(stock.ticker, stock, getToday());
				},i*2000*Math.random());
			}
		}
	});
}

function sendMail(date){
    var mailOptions = {
        to: auth.target_email,
        from: 'do-not-reply@stockpiler.com',
        subject: 'StockPiler Evaluations for '+date,
        text: 'This is an email from your stockpiler app.\n\n' +
            'For today ['+ date +']. The app has found the following interesting movesets amongst the stocks it tracks:\n\n' +
            collector.arrStocks.toString()
    };
    transporter.sendMail(mailOptions, function(err) {
        if(err)
			console.log(err);
    });
}


// TEMP TEST: HARD CODE SOME STOCKS, TEST-GET SOME DATA;
var starterStocks = ["AMZN", "CMG", "PCLN", "TSLA", "GOOG", "MSFT"];
starterStocks.forEach(function(ticker,idx){
	setTimeout(function(){
		Stock.findOne({ticker: ticker}).populate('yesterday').exec(function(err, stock){
			if(err)
			{
				throw err;
			}
			if(!stock)
			{
				stock = newStock(ticker);
				console.log("adding  "+stock.ticker);
			}
			else
			{
				console.log("already found starter stock "+stock.ticker);
			}
			collector.update(stock.ticker, stock, getToday());
		});
	},idx*2000*Math.random());
})

setTimeout(function(){
	sendMail(getToday());
	console.log("starter email is sent! we are good to go");
},20000);

//let Heroku/other host set port, else default 3000, and then listen
var port     = process.env.PORT || 3000;
app.listen(port);
console.log('The magic happens on port ' + port);