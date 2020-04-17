const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

// Check if user is logged in
router.use(authController.isLoggedIn);

router.get('/', viewController.getIndex);
router.get('/login', viewController.getLogin);
router.get('/signup', viewController.getSignup);
router.get('/forgot-password', viewController.getForgotPassword);
router.get('/reset-password/:token', viewController.getResetPassword);
router.get('/dashboard', viewController.getDashboard);
router.get('/my-history', viewController.getMyHistory);
router.get('/my-trackables', viewController.getMyTrackables);
router.get('/new-trackable', viewController.getNewTrackable);
router.get('/edit-trackable/:id', viewController.getEditTrackable);
router.get('/sleeplogs/:slug', viewController.getASleeplog);
router.get('/new-sleeplog', viewController.newSleeplog);
router.get('/settings', viewController.getSettings);

module.exports = router;
