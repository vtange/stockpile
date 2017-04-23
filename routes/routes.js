// routes.js
var Day = require('./collector/day');

module.exports = function(app) {

    app.get('/', function(req, res) {
		Day.find({},function(err, days){
			res.send(JSON.stringify(days));
		});		
    });
}