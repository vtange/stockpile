// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var stockSchema = mongoose.Schema({
	ticker: String,
	yesterday: { type: String, ref: 'Day' },
	data: [{ type: String, ref: 'Day' }]
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', stockSchema);
