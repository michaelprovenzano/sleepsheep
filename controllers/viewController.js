const Trackable = require('../models/trackableModel');
const SleepLog = require('../models/sleepLogModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class Today {
  constructor() {
    this.curTime = Date.now();
    this.date = new Date(Date.now());
    this.sleepStartDate = this.formatDate(this.curTime - 8 * 1000 * 60 * 60);
    this.sleepEndDate = this.formatDate(this.curTime);
    this.sleepStartTime = this.formatTime(this.curTime - 8 * 1000 * 60 * 60);
    this.sleepEndTime = this.formatTime(this.curTime);
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  formatTime(date) {
    var d = new Date(date);

    let hours = d.getHours();
    while (hours.toString().length < 2) {
      hours = '0' + hours;
    }

    let minutes = d.getMinutes();
    while (minutes.toString().length < 2) {
      minutes = '0' + minutes;
    }

    return `${hours}:${minutes}`;
  }
}

exports.getIndex = (req, res) => {
  res.status(200).render('index', {
    title: 'A sleep tracking app',
  });
};

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
    backlink: 'javascript:javascript:history.go(-1)',
  });
};

exports.getSignup = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup',
    backlink: 'javascript:javascript:history.go(-1)',
  });
};

exports.getForgotPassword = (req, res) => {
  res.status(200).render('forgot-password', {
    title: 'Forgot Password',
    backlink: 'javascript:javascript:history.go(-1)',
  });
};

exports.getResetPassword = (req, res) => {
  res.status(200).render('reset-password', {
    title: 'Reset Password',
    token: req.params.token,
    backlink: 'javascript:javascript:history.go(-1)',
  });
};

exports.getDashboard = catchAsync(async (req, res) => {
  if (res.locals.user)
    var trackables = await Trackable.find({ user: res.locals.user._id });

  res.status(200).render('dashboard', {
    title: 'Dashboard',
    user: res.locals.user,
    trackables,
  });
});

exports.getMyHistory = catchAsync(async (req, res) => {
  const allSleepLogs = await SleepLog.find({ user: res.locals.user._id }).sort(
    '-sleepStart'
  );

  var sleeplogs = [];

  let curWeek = {};
  const today = new Date(Date.now());

  for (let i = 0; i < allSleepLogs.length; i++) {
    const log = allSleepLogs[i];
    let curr = new Date(log.sleepStart);

    const lastDate = new Date(curr);
    const first = lastDate.getTime() - lastDate.getDay() * 1000 * 60 * 60 * 24; // First day is the day of the month - the day of the week

    const last = first + 6 * 1000 * 60 * 60 * 24; // last day is the first day + 6

    var firstday = new Date(first);
    firstday.setHours(0, 0, 0, 0);
    var lastday = new Date(last);
    lastday.setHours(0, 0, 0, 0);

    if (i === 0 || log.sleepStart < curWeek.firstday) {
      let thisWeek = false;
      if (firstday <= today && lastday > today) thisWeek = true;

      sleeplogs.push({
        firstday: new Date(firstday),
        lastday: new Date(lastday),
        thisWeek,
        logs: [],
      });
      curWeek.firstday = new Date(firstday);
    }

    sleeplogs[sleeplogs.length - 1].logs.push(log);
  }

  res.status(200).render('my-history', {
    title: 'My History',
    nav: 'back',
    backlink: '/dashboard',
    sleeplogs,
  });
});

exports.getMyTrackables = catchAsync(async (req, res) => {
  const trackables = await Trackable.find({ user: res.locals.user._id });

  res.status(200).render('my-trackables', {
    title: 'My Trackables',
    nav: 'back',
    backlink: '/dashboard',
    trackables,
  });
});

exports.getNewTrackable = (req, res) => {
  res.status(200).render('new-trackable', {
    title: 'New Trackable',
    nav: 'back',
    backlink: '/dashboard',
  });
};

exports.getEditTrackable = catchAsync(async (req, res, next) => {
  const trackable = await Trackable.findById(req.params.id);

  if (!trackable) {
    return next(new AppError('There is no trackable with that ID', 404));
  }

  res.status(200).render('edit-trackable', {
    title: 'Edit Trackable',
    nav: 'back',
    backlink: 'javascript:javascript:history.go(-1)',
    trackable,
  });
});

exports.getSettings = (req, res) => {
  res.status(200).render('settings', {
    title: 'Settings',
    nav: 'back',
    backlink: '/dashboard',
    user: res.locals.user,
  });
};

exports.getASleeplog = catchAsync(async (req, res, next) => {
  const sleeplog = await SleepLog.findOne({
    user: res.locals.user._id,
    slug: req.params.slug,
  });

  if (!sleeplog) {
    return next(
      new AppError('There is no sleeplog starting at that time!', 404)
    );
  }

  const trackables = await Trackable.find({ user: res.locals.user._id });

  sleeplog.sleepStartDate = formatDate(sleeplog.sleepStart);
  sleeplog.sleepEndDate = formatDate(sleeplog.sleepEnd);
  sleeplog.sleepStartTime = formatTime(sleeplog.sleepStart);
  sleeplog.sleepEndTime = formatTime(sleeplog.sleepEnd);

  res.status(200).render('sleeplog', {
    title: 'Sleep Log',
    nav: 'back',
    backlink: '/my-history',
    sleeplog,
    trackables,
  });
});

exports.newSleeplog = catchAsync(async (req, res) => {
  const trackables = await Trackable.find({ user: res.locals.user.id });

  res.status(200).render('newSleeplog', {
    title: 'New Sleep Log',
    nav: 'back',
    backlink: 'javascript:javascript:history.go(-1)',
    trackables,
    Today,
  });
});
