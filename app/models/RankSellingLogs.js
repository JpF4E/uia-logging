var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//var screenshotsRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/

// set up a mongoose model
var RankSellingLogsSchema = new Schema({
  username: {
		type: String,
		required: [true, 'Please fill the username.'],
    trim: true
	},
  prevRank: {
    type: String,
    required: [true, 'Please fill the previous rank.'],
    trim: true
  },
  newRank: {
      type: String,
      required: [true, 'Please fill the new rank.'],
      trim: true
    },
  price: {
    type: Number,
    min: [0, 'The price must be 0 or a positive number.'],
    required: [true, 'Please fill the price.'],
    trim: true
  },
  notes: {
  		type: String,
      trim: true
    },
  logger: {
      type: String,
    required: [true, 'Please fill the logger.']
    },
  loggerRank: {
      type: String,
    required: [true, 'Please fill the logger\'s rank.']
    }
}, {timestamps: true});

//function minSize(val) {
//	return val.length >= 20;
//}
 
//UserSchema.methods.comparePassword = function (passw, cb) {
//	bcrypt.compare(passw, this.password, function (err, isMatch) {
//		if (err) {
//			return cb(err);
//		}
//		cb(null, isMatch);
//	});
//};
 
module.exports = mongoose.model('RankSellingLogs', RankSellingLogsSchema);