var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//var screenshotsRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)$/

// set up a mongoose model
var TransferLogsSchema = new Schema({
  username: {
		type: String,
		required: [true, 'Please fill the username.'],
    trim: true
	},
  agency: {
    type: String,
    required: [true, 'Please fill the agency.'],
    trim: true
  },
  oldRank: {
    type: String,
    required: [true, 'Please fill the old rank.'],
    trim: true
  },
  offeredRank: {
      type: String,
      required: [true, 'Please fill the offered rank.'],
      trim: true
    },
  fullTransferOrNearMiss: {
      type: String,
      required: [true, 'Please fill the type of transfer.'],
      enum: ['fullTransfer', 'nearMiss']
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
 
module.exports = mongoose.model('TransferLogs', TransferLogsSchema);