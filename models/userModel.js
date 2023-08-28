const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');


//name ,email,photo,password,pwConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    unique: [true],
    required: [true, 'A user must have a email'],
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: { type: String },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    minLength: [8, 'Password must contain minimum 8 character'],
    required: [true, 'A user must have a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    // only work on create and save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active:{
    type:Boolean,
    default:true,
    select:false
  }
});

//only run if password is modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); //hash = encrypt | bcrypt = hashing algorithm
  //hash password with cost 12
  this.password = await bcrypt.hash(this.password, 12); //12 = cost parameter, it best to use 12
  //, the higher this cost,the more

  //delete pwConfirm Field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  //will run right before a new doc is actually saved
  if (!this.isModified('password')|| this.isNew) return next();

  this.passwordChangedAt = Date.now() -1000
  next()
});

//query middleware
userSchema.pre(/^find/,function(next){ //this point to current query
  this.find({active:{$ne:false}}) //ne = not equal
  next()
  })

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  //instance method
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // 10 = base number
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //300 < 200, JWTTimrestamp means iat(issues at)
  }
  //false means not change
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const user = mongoose.model('User', userSchema);

module.exports = user;
