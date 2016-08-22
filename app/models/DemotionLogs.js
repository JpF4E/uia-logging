var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//var screenshotsRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/

// set up a mongoose model
var DemotionLogsSchema = new Schema({
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
  reason: {
  		type: String,
  		required: [true, 'Please fill the reason.'],
      validate: [minSize, 'Reason must have at least 20 characters.'],
      trim: true
    },
  screenshots: {
      type: String,
      required: [true, 'Please fill the screenshots.'],
      //match: [screenshotsRegEx, 'Required one screenshot URL per line.']
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

function minSize(val) {
	return val.length >= 20;
}
 
//UserSchema.methods.comparePassword = function (passw, cb) {
//	bcrypt.compare(passw, this.password, function (err, isMatch) {
//		if (err) {
//			return cb(err);
//		}
//		cb(null, isMatch);
//	});
//};
 
module.exports = mongoose.model('DemotionLogs', DemotionLogsSchema);