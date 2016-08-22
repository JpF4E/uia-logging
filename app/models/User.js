var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
 
// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/
 
var promoTagRegEx = /^[a-zA-Z0-9]{0,4}$/;
var emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

var Role = {
	type: String,
	enum: ['training-logs',
		'promotion-logs',
		'warning-logs',
		'demotion-logs',
		'strike-logs',
		'fired-logs',
		'transfer-logs',
		'rank-selling-logs',
		'loa-logs']
}

// set up a mongoose model
var UserSchema = new Schema({
  name: {
		type: String,
		unique: true,
		sparse: true,
		required: [true, 'Please fill your Habbo username.'],
		trim: true
	},
  password: {
		type: String,
		required: [true, 'Please fill a password.']
	},
  valid: {
  		type: Boolean,
  		default: false
    },
  type: {
  		type: String,
  		default: 'Regular',
  		enum: ['Regular', 'Admin', 'Owner']
    },
  promoTag: {
  		type: String,
  		unique: true,
		sparse: true,
  		match: [promoTagRegEx, 'Please fill a valid promotion tag (4 digits/letters at max).'],
		trim: true
    },
  rank: {
  		type: String,
		trim: true
    },
  email: {
  		type: String,
  		unique: true,
		sparse: true,
  		required: [true, 'Please fill an email address.'],
  		match: [emailRegEx, 'Please fill a valid email address.'],
		trim: true
    },
  allowedRoles: [{
  		role: Role,
  		perm: [{type: Boolean}]
    }],
  tokenTimestamp: {
  		type: Date,
  		default: Date.now
    },
  firstLogin: {
  		type: Boolean,
  		default: true
  }
}, {timestamps: true});

function permSize(val) {
	return val.length == 10;
}

UserSchema.pre('save', function (next) {
	var user = this;
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err);
			}
			bcrypt.hash(user.password, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			});
		});
	} else {
		return next();
	}
});
 
UserSchema.methods.comparePassword = function (passw, cb) {
	bcrypt.compare(passw, this.password, function (err, isMatch) {
		if (err) {
			return cb(err);
		}
		cb(null, isMatch);
	});
};
 
module.exports = mongoose.model('User', UserSchema);