const SleepLog = require('../models/sleepLogModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./../utils/handlerFactory');

exports.setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllLogs = factory.getAll(SleepLog);
exports.getAllUserLogs = factory.getAll(SleepLog, 'user');

exports.createLog = catchAsync(async (req, res, next) => {
  // Check for duplicate sleep time
  const dupSleepLog = await SleepLog.find({
    sleepStart: { $lt: req.body.sleepEnd },
    sleepEnd: { $gt: req.body.sleepStart },
    user: req.user._id,
  });

  if (dupSleepLog.length > 0) {
    return next(
      new AppError('There is a sleep log that overlaps this time!', 400)
    );
  }

  const sleepLog = await SleepLog.create(req.body);

  res.status(200).json({
    status: 'success',
    sleepLog,
  });
});

exports.updateLog = catchAsync(async (req, res, next) => {
  const sleepLog = await SleepLog.findById(req.params.id);

  for (let key in req.body) {
    sleepLog[key] = req.body[key];
  }

  await sleepLog.save({ validateBeforeSave: true });

  if (!sleepLog) {
    return next(
      new AppError(`No tour found with an ID of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    sleepLog,
  });
});

exports.deleteLog = catchAsync(async (req, res, next) => {
  const sleepLog = await SleepLog.findByIdAndDelete(req.params.id);
  await res.locals.user.calcStats();

  if (!sleepLog) {
    return next(
      new AppError(`No tour found with an ID of ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getLog = catchAsync(async (req, res, next) => {
  const sleepLog = await SleepLog.find({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!sleepLog) {
    return next(
      new AppError(`No tour found with an ID of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    sleepLog,
  });
});
