const express = require('express');
const router = express.Router();
const sleepLogController = require('../controllers/sleepLogController');
const authController = require('../controllers/authController');
const userController = require('./../controllers/userController');

// Protects all routes below this middleware call
router.use(authController.protect);

router
  .route('/')
  .get(sleepLogController.getAllUserLogs)
  .post(sleepLogController.setUserID, sleepLogController.createLog);

router.route('/all-logs').get(
  // authController.restrictTo('admin'),
  sleepLogController.getAllLogs
);

router
  .route('/:id')
  .delete(sleepLogController.deleteLog)
  .patch(sleepLogController.updateLog)
  .get(sleepLogController.getLog);

module.exports = router;
