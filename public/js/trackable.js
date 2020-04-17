import axios from 'axios';
import { getId } from './utils';
import { showAlert } from './alerts';

export const revealTrackable = (event) => {
  const checkbox = event.target.closest('INPUT[type="checkbox"]');
  const trackable = event.target.closest('.trackable');
  const trackableQuantity = trackable.querySelector('.trackable__line-2');

  if (checkbox && checkbox.checked) {
    trackable.classList.add('trackable-checked');
    if (trackableQuantity) trackableQuantity.classList.remove('hide');
  } else if (checkbox && !checkbox.checked) {
    trackable.classList.remove('trackable-checked');
    if (trackableQuantity) trackableQuantity.classList.add('hide');
  }
};

export const createATrackable = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/trackables',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your new trackable has been added!');

      if (localStorage.getItem('tempSleeplog')) {
        window.setTimeout(() => {
          location.assign('/new-sleeplog');
        }, 1000);
      } else {
        window.setTimeout(() => {
          location.assign('/my-trackables');
        }, 1000);
      }
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteATrackable = async (event) => {
  const id = getId(event, 'data-trackable-id');

  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:8000/api/v1/trackables/${id}`,
    });

    showAlert('success', 'Your trackable has been deleted!');
    window.setTimeout(() => {
      location.assign('/my-trackables');
    }, 1000);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateATrackable = async (event, formData) => {
  const id = getId(event, 'data-trackable-id');
  console.log(formData.quantifier);

  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:8000/api/v1/trackables/${id}`,
      data: formData,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your trackable has been updated!');
      window.setTimeout(() => {
        location.assign('/my-trackables');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const getMyTrackables = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/trackables',
    });
  } catch (err) {}
};

// EDIT TRACKABLE SCREEN

// Hide hours field on click
const btnTime = document.querySelector('.button-toggle');
const trackableHoursField = document.getElementById('trackable__hours');

if (btnTime) {
  btnTime.addEventListener('click', () => {
    const allBtns = [...btnTime.querySelectorAll('input')];
    for (let thisBtn of allBtns) {
      if (thisBtn.getAttribute('value') === 'Before Bed' && thisBtn.checked) {
        trackableHoursField.classList.remove('hide');
        return;
      }
    }
    trackableHoursField.classList.add('hide');
  });
}

// Hide quantifier field on click
const btnTags = document.querySelector('.btn-tags__container');
const trackableUnitsField = document.getElementById(
  'trackable__quantifierUnits'
);
if (btnTags) {
  btnTags.addEventListener('click', () => {
    const allBtns = [...btnTags.querySelectorAll('input')];
    for (let thisBtn of allBtns) {
      if (thisBtn.checked) {
        trackableUnitsField.classList.remove('hide');
        return;
      }
    }
    trackableUnitsField.classList.add('hide');
  });
}
