import '@babel/polyfill';
import {
  login,
  logout,
  signup,
  sendPasswordResetLink,
  resetPassword,
} from './login';
import {
  createASleeplog,
  deleteASleeplog,
  updateASleeplog,
  getSleeplogs,
  setTempSleeplog,
  getTempSleeplog,
} from './sleeplog';
import {
  revealTrackable,
  createATrackable,
  updateATrackable,
  deleteATrackable,
} from './trackable';
import { getUser } from './user';
import { loadChart } from './dashboard';
import { settingsFormData, updatePassword, updateUserData } from './settings';
import Today from './Today';

// DOM ELEMENTS
const spinner = document.querySelector('.spinner-wrapper');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const newSleeplogForm = document.getElementById('new-sleeplog-form');
const updateSleeplogForm = document.getElementById('update-sleeplog-form');
const newTrackableBtn = document.getElementById('new-trackable');
const newTrackableForm = document.getElementById('new-trackable-form');
const updateTrackableForm = document.getElementById('update-trackable-form');
const updateSettingsForm = document.getElementById('update-settings-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const dashboard = document.querySelector('.dashboard');
const backBtn = document.getElementById('back-btn');

// Initalize loader
window.addEventListener('load', () => {
  if (spinner) spinner.classList.add('spinner--loaded');
  window.setTimeout(() => {
    spinner.parentElement.removeChild(spinner);
  }, 800);
});

// Load charts for the dashboard page
if (dashboard) loadChart();

// Global deselect for radio buttons
const radioBtns = [...document.querySelectorAll('input')];
radioBtns.forEach((btn) =>
  btn.addEventListener('click', (e) => {
    if (e.target.getAttribute('type') !== 'radio') return;
    const btn = e.target;
    if (btn.getAttribute('checked')) {
      btn.checked = false;
      btn.removeAttribute('checked');
    } else {
      const btnName = btn.getAttribute('name');
      radioBtns.forEach((el) => {
        if (el.getAttribute('name') === btnName) el.removeAttribute('checked');
      });
      btn.setAttribute('checked', 'checked');
    }
  })
);

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

//

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    sendPasswordResetLink(email);
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('new-password').value;
    const passwordConfirm = document.getElementById('new-password-confirm')
      .value;
    const token = resetPasswordForm.getAttribute('data-token');

    resetPassword(password, passwordConfirm, token);
  });
}

//

if (newSleeplogForm) {
  const today = new Today();
  document.querySelector(
    '.sleeplog-date__day'
  ).innerText = today.date.toLocaleString('en-US', { weekday: 'long' });
  document.querySelector(
    '.sleeplog-date__date'
  ).innerText = today.date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  document.getElementById('sleep-date').value = today.sleepStartDate;
  document.getElementById('sleep-time').value = today.sleepStartTime;
  document.getElementById('wakeup-date').value = today.sleepEndDate;
  document.getElementById('wakeup-time').value = today.sleepEndTime;

  // pre-fill form if one was already started
  const previousData = getTempSleeplog();

  if (previousData) fillSleeplogFormData(previousData);

  newSleeplogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = sleeplogFormData();
    localStorage.removeItem('tempSleeplog');
    createASleeplog(formData);
  });

  backBtn.addEventListener('click', (e) => {
    localStorage.removeItem('tempSleeplog');
  });
}

if (updateSleeplogForm) {
  updateSleeplogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = sleeplogFormData();
    updateASleeplog(e, formData);
  });
}

if (newTrackableBtn) {
  newTrackableBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const formData = sleeplogFormData();
    setTempSleeplog(formData);
    window.setTimeout(() => {
      location.assign('/new-trackable');
    }, 1000);
  });
}

const sleeplogDeleteBtn = document.getElementById('sleeplog-delete');
if (sleeplogDeleteBtn)
  sleeplogDeleteBtn.addEventListener('click', deleteASleeplog);

if (newTrackableForm) {
  newTrackableForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = trackableFormData();
    createATrackable(formData);
  });
}

if (updateTrackableForm) {
  updateTrackableForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = trackableFormData();
    updateATrackable(e, formData);
  });
}

const trackableDeleteBtn = document.getElementById('trackable-delete');
if (trackableDeleteBtn)
  trackableDeleteBtn.addEventListener('click', deleteATrackable);

const trackables = [...document.querySelectorAll('.trackable')];
trackables.forEach((el) => el.addEventListener('click', revealTrackable));

if (updateSettingsForm) {
  updateSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = settingsFormData();
    if (
      formData.currPass !== '' &&
      formData.newPass !== '' &&
      formData.newPassConfirm !== ''
    ) {
      updatePassword(formData);
    }
    updateUserData(formData);
  });
}

function sleeplogFormData() {
  const sleepStartDate = document.getElementById('sleep-date').value;
  const sleepStartTime = document.getElementById('sleep-time').value;
  const sleepEndDate = document.getElementById('wakeup-date').value;
  const sleepEndTime = document.getElementById('wakeup-time').value;
  const notes = document.getElementById('notes').value;
  const sleepStart = new Date(`${sleepStartDate} ${sleepStartTime}`);
  const sleepEnd = new Date(`${sleepEndDate} ${sleepEndTime}`);

  let timeToFallAsleep;
  const timeToFallAsleepBtns = [
    ...document.getElementsByName('fast-asleep-log'),
  ];
  timeToFallAsleepBtns.forEach((el) => {
    if (el.checked) timeToFallAsleep = el.value;
  });

  let sleepQuality;
  const sleepQualityBtns = [...document.getElementsByName('wakeup-log')];
  sleepQualityBtns.forEach((el) => {
    if (el.checked) sleepQuality = el.value;
  });

  let trackables = [];
  const allTrackables = [...document.getElementsByName('trackable')];
  allTrackables.forEach((el) => {
    if (el.checked) {
      const trackableId = el.getAttribute('data-id');
      const trackableObj = {
        trackable: trackableId,
      };
      const trackableQuantityEl = document.getElementById(
        `trackable_${trackableId}__quantity`
      );
      if (trackableQuantityEl)
        trackableObj.quantity = trackableQuantityEl.value;

      trackables.push(trackableObj);
    }
  });

  return {
    sleepStart,
    sleepEnd,
    sleepQuality,
    timeToFallAsleep,
    trackables,
    notes,
  };
}

function fillSleeplogFormData(data) {
  if (data.isTempLog) {
    const sleepStart = new Date(data.log.sleepStart);
    const sleepEnd = new Date(data.log.sleepEnd);

    document.getElementById('sleep-date').value = formatDate(sleepStart);
    document.getElementById('sleep-time').value = formatTime(sleepStart);
    document.getElementById('wakeup-date').value = formatDate(sleepEnd);
    document.getElementById('wakeup-time').value = formatTime(sleepEnd);

    const insomniaRatings = document.getElementsByName('fast-asleep-log');
    insomniaRatings[data.log.timeToFallAsleep - 1].setAttribute(
      'checked',
      'checked'
    );
    const sleepQualityRatings = document.getElementsByName('wakeup-log');
    sleepQualityRatings[data.log.sleepQuality - 1].setAttribute(
      'checked',
      'checked'
    );

    const trackables = document.getElementsByName('trackable');
    trackables.forEach((el, i) => {
      for (let thisTrackable of data.log.trackables) {
        if (thisTrackable.trackable === el.getAttribute('data-id'))
          el.checked = true;
      }
    });

    document.getElementById('notes').value = data.log.notes;
  }
}

function trackableFormData() {
  const formData = {};
  formData.name = document.getElementById('trackable__name').value;

  [...document.getElementsByName('trackable-timeframe')].forEach((el) => {
    if (el.checked) formData.timeframe = el.value;
  });

  if (formData.timeframe === 'Before Bed') {
    formData.hoursBeforeBed = document.getElementById('trackable__hours').value;
  } else {
    formData.hoursBeforeBed = null;
  }

  formData.quantifier = null;
  [...document.getElementsByName('trackable-quantifier')].forEach((el) => {
    if (el.checked) formData.quantifier = el.value;
  });

  if (formData.quantifier) {
    formData.quantifierUnits = document.getElementById(
      'trackable__quantifierUnits'
    ).value;
  } else {
    formData.quantifierUnits = null;
  }

  formData.description = document.getElementById(
    'trackable__description'
  ).value;

  return formData;
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatTime(date) {
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
