import axios from 'axios';
import { getId } from './utils';
import { showAlert } from './alerts';

export const createASleeplog = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/sleepLogs',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your sleeplog has been added!');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteASleeplog = async (event) => {
  try {
    const id = getId(event, 'data-sleeplog-id');

    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:8000/api/v1/sleepLogs/${id}`,
    });

    showAlert('success', 'Your sleeplog has been deleted!');
    window.setTimeout(() => {
      location.assign('/my-history');
    }, 1000);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateASleeplog = async (event, formData) => {
  const id = getId(event, 'data-sleeplog-id');

  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/sleepLogs/${id}`,
      data: formData,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your sleeplog has been updated!');
      window.setTimeout(() => {
        location.assign('/my-history');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const sleepDate = document.getElementById('sleep-date');
if (sleepDate) {
  sleepDate.addEventListener('change', () => {
    const sleeplogDay = document.querySelector('.sleeplog-date__day');
    const sleeplogDate = document.querySelector('.sleeplog-date__date');

    const sleepDate_date = new Date(sleepDate.value);
    sleeplogDay.innerText = sleepDate_date.toLocaleString('en-US', {
      weekday: 'long',
    });
    sleeplogDate.innerText = sleepDate_date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  });
}

export const setTempSleeplog = (data) => {
  if (getTempSleeplog()) localStorage.removeItem('tempSleeplog');

  const tempLog = {
    isTempLog: true,
    log: data,
  };
  localStorage.setItem('tempSleeplog', JSON.stringify(tempLog));
};

export const getTempSleeplog = () => {
  return JSON.parse(localStorage.getItem('tempSleeplog'));
};
