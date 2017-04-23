// load the things we need
var mongoose = require('mongoose');

//id and date are the same
var daySchema = mongoose.Schema({
	date : String,
	ticker : String,
	close : Number,
	volume: Number,
	open: Number,
	high: Number,
    low: Number
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Day', daySchema);