var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var TrainingLogsSchema = new Schema({
  username: {
		type: String,
		required: [true, 'Please fill the username.'],
		trim: true
	},
  recSecTrainOrHR: {
		type: String,
		required: [true, 'Please fill the training type.'],
		enum: ['rec', 'sec', 'train', 'hr']
	},
  passOrFail: {
  		type: String,
  		required: [true, 'Please fill the pass or fail option.'],
  		enum: ['pass', 'fail']
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
 
module.exports = mongoose.model('TrainingLogs', TrainingLogsSchema);