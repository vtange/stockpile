var express = require('express');
var path = require('path');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var bluebirdPromise = require('bluebird');
var moment = require('moment');
var schedule = require('node-schedule');
var update = require('./routes/collector/collector.js');
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 5)]; //monday thru friday. //NEED WAY OF SKIPPING NO MARKET DAYS
rule.hour = 17;	//5pm
rule.minute = 0;

// DB configuration ===============================================================
var Stock = require('./routes/collector/stock');
var newStock = require('./routes/collector/newStock');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

var app = express();
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    // parse application/json

var j = schedule.scheduleJob(rule, updateStocks);

//load routes
require('./routes/routes.js')(app);

function getToday(){
	return moment(new Date()).format("YYYY/MM/DD");
}

function updateStocks(){
	var ticker = req.body.ticker.toUpperCase();
	//check mongoDB
	Stock.find({},function(err, stocks){
		if(stocks.length > 0)
		{
			for(var i = stocks.length-1; i>=0; i--)
			{
				//space it out to not kill Yahoo
				window.setTimeout(function(){
					var stock = stocks[i];
					console.log("updating "+stock.ticker);
					update(stock.ticker, stock, getToday());
				},i*2000*Math.random());
			}
		}
	});
}

// TEMP: HARD CODE SOME STOCKS, TEST-GET SOME DATA;
var starterStocks = ["AMZN", "CMG", "PCLN", "TSLA", "GOOG", "MSFT"];
starterStocks.forEach(function(ticker){
	var stock = newStock(ticker);
	console.log("adding  "+stock.ticker);
	update(stock.ticker, stock, getToday());
})

//let Heroku/other host set port, else default 3000, and then listen
var port     = process.env.PORT || 3000;
app.listen(port);
console.log('The magic happens on port ' + port);