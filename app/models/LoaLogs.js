var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//var screenshotsRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/

// set up a mongoose model
var LoaLogsSchema = new Schema({
  username: {
		type: String,
		required: [true, 'Please fill the username.'],
    trim: true
	},
  startDate: {
		type: Date,
		required: [true, 'Please fill the start date.']
	},
  endDate: {
    type: Date,
    required: [true, 'Please fill the end date.']
  },
  reason: {
  		type: String,
  		required: [true, 'Please fill the reason.'],
      validate: [minSize, 'Reason must have at least 20 characters.'],
      trim: true
    },
  approvedBy: {
      type: String,
      required: [true, 'Please fill the approved by field.'],
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
 
module.exports = mongoose.model('LoaLogs', LoaLogsSchema);