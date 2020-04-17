const express = require('express');
const router = express.Router();
const trackableController = require('../controllers/trackableController');
const authController = require('../controllers/authController');

// Protects all routes below this middleware call
router.use(authController.protect);

router
  .route('/')
  .get(trackableController.getAllTrackables)
  .post(trackableController.setUserID, trackableController.createTrackable);

router
  .route('/:id')
  .delete(trackableController.deleteTrackable)
  .patch(trackableController.updateTrackable)
  .get(trackableController.getTrackable);

module.exports = router;
