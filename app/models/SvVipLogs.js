var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var SvVipLogsSchema = new Schema({
  username: {
		type: String,
		required: [true, 'Please fill the username.'],
		trim: true
	},
  svOrVip: {
		type: String,
		required: [true, 'Please fill the badge type.'],
		enum: ['sv', 'vip']
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
    },
  removed: {
      type: Boolean,
      required: true,
      default: false 
    }
}, {timestamps: true});
 
module.exports = mongoose.model('SvVipLogs', SvVipLogsSchema);