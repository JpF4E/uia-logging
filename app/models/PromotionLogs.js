var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var PromotionLogsSchema = new Schema({
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

//function permSize(val) {
//	return val.length == 10;
//}
 
//UserSchema.methods.comparePassword = function (passw, cb) {
//	bcrypt.compare(passw, this.password, function (err, isMatch) {
//		if (err) {
//			return cb(err);
//		}
//		cb(null, isMatch);
//	});
//};
 
module.exports = mongoose.model('PromotionLogs', PromotionLogsSchema);