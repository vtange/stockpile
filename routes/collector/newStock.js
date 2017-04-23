//for mongoDB interaction routes
var Stock = require('./stock');

function newStock(ticker)
{
	var stock = new Stock();
				//if no stock, all data goes to today and not yesterday
	stock.ticker = ticker;
	return stock;
}

exports = module.exports = newStock;