const mongoose = require('mongoose');

const trackableSchema = new mongoose.Schema(
  {
    name: String,
    timeframe: {
      type: String,
      enum: {
        values: ['Before Bed', 'Anytime Today'],
        message: 'Values must be "Before Bed" or "Anytime Today"'
      }
    },
    hoursBeforeBed: Number,
    quantifier: String,
    quantifierUnits: String,
    description: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'You must be logged in to create a trackable.']
    },
    public: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Trackable = mongoose.model('Trackable', trackableSchema);

module.exports = Trackable;
