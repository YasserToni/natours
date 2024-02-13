const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowerCase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
    // validator: [validator.isStrongPassword, 'Please Provide a strong password'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm you password'],
    //This only work on save
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
  verificationToken: {
    type: String,
    select: false,
  },
  verificationTokenExpires: {
    type: Date,
    select: false,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  userAttemps: {
    type: Number,
    default: 0,
  },
  userAttempsDuration: Date,
});

userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimesTamp) {
  if (this.passwordChangedAt) {
    const changedTimesTamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimesTamp < changedTimesTamp;
  }
  // means password not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken);
  return verificationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
