const mongoose = require('mongoose');
const User = require('./userModel');
const Trackable = require('./trackableModel');
const slugify = require('slugify');

const sleepLogSchema = new mongoose.Schema(
  {
    sleepStart: {
      type: Date,
      required: [true, 'A sleep log must have a start time.'],
    },
    sleepEnd: {
      type: Date,
      required: [true, 'A sleep log must have an end time.'],
    },
    sleepDuration: Number,
    sleepQuality: {
      type: Number,
      required: [true, 'A sleep log must have a quality rating.'],
    },
    timeToFallAsleep: {
      type: Number,
      required: [
        true,
        'A sleep log must have the time it takes to fall asleep.',
      ],
    },
    trackables: [
      {
        trackable: {
          type: mongoose.Schema.ObjectId,
          ref: 'Trackable',
        },
        quantity: Number,
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'You must be logged in to create a sleep log.'],
    },
    slug: String,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
sleepLogSchema.virtual('sleepQualityString').get(function () {
  const sleepQuality = ['Exhausted', 'Tired', 'Okay', 'Rested', 'Very Rested'];
  return sleepQuality[this.sleepQuality - 1];
});

// Static Methods
sleepLogSchema.statics.calcStats = async function (userId) {
  const generalStats = await this.aggregate([
    {
      $match: { user: userId },
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

  const trackableStats = await this.aggregate([
    {
      $match: { user: userId },
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

  const sleepData = {
    totalSleepLogs: generalStats[0].totalSleepLogs,
    avgSleepQuality: generalStats[0].avgSleepQuality,
    avgTimeToFallAsleep: generalStats[0].avgTimeToFallAsleep,
    avgSleepDuration: generalStats[0].avgSleepDuration,
  };

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

  await User.findByIdAndUpdate(userId, {
    sleepData,
  });
};

sleepLogSchema.pre(/^find/, function (next) {
  this.populate('trackables.trackable');

  next();
});

sleepLogSchema.pre('save', function () {
  this.slug = slugify(
    this.sleepStart.toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  );
  this.sleepDuration = (this.sleepEnd - this.sleepStart) / 3600000;
  next();
});

sleepLogSchema.post('save', async function () {
  const User = require('./userModel');
  const user = await User.findById(this.user);

  await user.calcStats();
  // this.constructor.calcStats(this.user);
});

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);

module.exports = SleepLog;
