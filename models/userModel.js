const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Trackable = require('./trackableModel');
const SleepLog = require('./sleepLogModel');

const trackablesCorrelationSchema = new mongoose.Schema({
  trackable: {
    type: mongoose.Schema.ObjectId,
    ref: 'Trackable',
  },
  totalSleepLogs: Number,
  avgSleepQuality: Number,
  avgTimeToFallAsleep: Number,
  avgSleepDuration: Number,
  possibleCorrelation: {
    type: String,
    enum: ['positive', 'negative', 'none', 'na'],
  },
});

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: [true, 'Please provide your email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password.'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        // This only works on CREATE AND SAVE!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same.',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    photo: String,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    sleepData: {
      totalSleepLogs: Number,
      avgSleepQuality: Number,
      avgSleepDuration: Number,
      avgTimeToFallAsleep: Number,
      trackablesCorrelation: [trackablesCorrelationSchema],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  // If password hasn't been modified move on to next middleware
  if (!this.isModified('password')) return next();

  // Handle password encryption
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// Virtuals
// userSchema.virtual('sleepLogs', {
//   ref: 'SleepLog',
//   foreignField: 'user',
//   localField: '_id'
// });

// Pre-saves
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
});

// Static Methods
userSchema.methods.calcStats = async function () {
  const SleepLog = require('./sleepLogModel');

  const generalStats = await SleepLog.aggregate([
    {
      $match: { user: this._id },
    },
    {
      $group: {
        _id: '$user',
        totalSleepLogs: { $sum: 1 },
        avgSleepQuality: { $avg: '$sleepQuality' },
        avgTimeToFallAsleep: { $avg: '$timeToFallAsleep' },
        avgSleepDuration: { $avg: '$sleepDuration' },
      },
    },
  ]);

  const trackableStats = await SleepLog.aggregate([
    {
      $match: { user: this._id },
    },
    {
      $unwind: '$trackables',
    },
    {
      $group: {
        _id: '$trackables.trackable',
        totalSleepLogs: { $sum: 1 },
        avgSleepQuality: { $avg: '$sleepQuality' },
        avgTimeToFallAsleep: { $avg: '$timeToFallAsleep' },
        avgSleepDuration: { $avg: '$sleepDuration' },
      },
    },
  ]);

  let sleepData;
  if (generalStats[0]) {
    sleepData = {
      totalSleepLogs: generalStats[0].totalSleepLogs,
      avgSleepQuality: generalStats[0].avgSleepQuality,
      avgTimeToFallAsleep: generalStats[0].avgTimeToFallAsleep,
      avgSleepDuration: generalStats[0].avgSleepDuration,
    };
  } else {
    sleepData = {
      totalSleepLogs: 0,
      avgSleepQuality: 0,
      avgTimeToFallAsleep: 0,
      avgSleepDuration: 0,
    };
  }

  if (trackableStats[0]) {
    trackableStats.forEach((stat) => {
      const globStats = generalStats[0];
      if (stat.totalSleepLogs < 3) {
        stat.possibleCorrelation = 'na';
      } else if (stat.avgSleepQuality < globStats.avgSleepQuality - 0.5) {
        stat.possibleCorrelation = 'negative';
      } else if (stat.avgSleepQuality > globStats.avgSleepQuality + 0.5) {
        stat.possibleCorrelation = 'positive';
      } else {
        stat.possibleCorrelation = 'none';
      }
    });
    sleepData.trackablesCorrelation = trackableStats;
  }

  await User.findByIdAndUpdate(this._id, {
    sleepData,
  });
};

// Instanced Methods
userSchema.methods.isValidPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Create a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypt and add the reset token to the user database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the expiration of the reset token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
