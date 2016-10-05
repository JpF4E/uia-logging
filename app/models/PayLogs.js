var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var PayLogsSchema = new Schema({
  paidPeople: [{
    username: {type: String,trim: true,required: [true, 'Please fill the paid members member.']},
    pay: {type: Number,trim: true,required: [true, 'Please fill the paid members coins.'],min: [0, 'The pay must be 0 or a positive number.']},
    notes: {type: String,trim: true}
  }],
  payTime: {
    type: String,
    required: [true, 'Please fill the pay time.'],
    trim: true
  },
  payDay: {
    type: String,
    required: [true, 'Please fill the pay day.'],
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
 
module.exports = mongoose.model('PayLogs', PayLogsSchema);