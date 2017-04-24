//for mongoDB interaction routes
var Day = require('./day');
var request = require('request');
var interestingStocks = [];

function process(temp)
{
	temp = temp.map(Number);
	return {
		open: temp[0],
		low: temp[1],
		high: temp[2],
		close: temp[0]+temp[3],
		volume: temp[4]
	}
}

function newDay(ticker, data, today)
{
	var day = new Day();
	day.ticker = ticker;
	day.date = today;
	//
	day.open = data.open;
	day.high = data.high;
    day.low = data.low;
	day.close = data.close;
	day.volume = data.volume;
	return day;
}

function todayIsTheSameAs(YESTERDAY, dataToday)
{
	var skip = {
		"_id":true,
		"ticker":true,
		"date":true
	};
	var same = true;
	if(!YESTERDAY)
	{
		return false;
	}
	for(var prop in dataToday)
	{
		if(!skip[prop])
		{
			if(dataToday[prop] != YESTERDAY[prop])
			{
				same = false;
				break;
			}
		}
	}
	return same;
}

function evaluateDay(YESTERDAY, DAY){
    var pattern = "";

	interestingStocks.push(YESTERDAY.ticker);
/*
    if(pattern == "shooting star")
    {
        sendMail(SYMBOL, DAY.date);
    }
*/
    //need to send only at the end of day
}

function getAndUpdate(SYMBOL, STOCK, TODAY){
		//collect stock info

		/*
		s	=ticker
		f:
			n: Name
			a: Ask
			b: Bid
			b2: Ask (Realtime)
			b3: Bid (Realtime)
			p: Previous Close
			o: Open
			c1: Change
			c: Change & Percent Change
			c6: Change (Realtime)
			k2: Change Percent (Realtime)
			p2: Change in Percent
			c8: After Hours Change (Realtime)
			g: Day’s Low
			h: Day’s High
			k1: Last Trade (Realtime) With Time
			l: Last Trade (With Time)
			l1: Last Trade (Price Only)
			k3: Last Trade Size
			v: Volume
			a2: Average Volume
			w1: Day’s Value Change
			w4: Day’s Value Change (Realtime)
			m: Day’s Range
			m2: Day’s Range (Realtime)
		*/
	var YESTERDAY = STOCK.yesterday;
	if(YESTERDAY.date == TODAY)
	{
		"YESTERDAY's date ("+YESTERDAY.date+") is equal to today ("+TODAY+"), so we don't need to poll for data."; 
		return;
	}

	//get new data
	var url = "http://finance.yahoo.com/d/quotes.csv?s="+SYMBOL+"&f=oghc1v";
    request.get(url, function (error, result) {
        var value = result.body;
		var temp = value.split(",");
		if(temp[0]!=="N/A"){
			var dayData = process(temp);
			//if the data is exactly the same as yesterday's data, it's probably a market off day, discard. and return
			if(todayIsTheSameAs(YESTERDAY,dayData))
			{
				//do nothing
			}
			else
			{
				//it's a new day...
				var DAY = newDay(SYMBOL, dayData, TODAY);

				//check if the day is a clear pattern
				evaluateDay(YESTERDAY, DAY);

				//save the DAY
				DAY.save(function(err){
					if(err)
						throw err;
						
					console.log('saved ' + DAY.date + " for " + DAY.ticker);
					//push the daily data to stock
					STOCK.data.push(DAY);
					STOCK.yesterday = DAY;

					//save the STOCK
					STOCK.save(function(err){
						if(err)
							throw err;
						console.log('saved ' + STOCK.ticker);
					});
				});
			}
		}
    });
};

exports = module.exports = {
	update: getAndUpdate,
	arrStocks: interestingStocks
};