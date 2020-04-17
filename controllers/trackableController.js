const Trackable = require('../models/trackableModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./../utils/handlerFactory');

exports.setUserID = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createTrackable = factory.createOne(Trackable);
exports.updateTrackable = factory.updateOne(Trackable, 'user');
exports.deleteTrackable = factory.deleteOne(Trackable, 'user');
exports.getTrackable = factory.getOne(Trackable);
exports.getAllTrackables = factory.getAll(Trackable);
