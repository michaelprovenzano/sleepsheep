import axios from 'axios';
import { showAlert } from './alerts';

export const updatePassword = async data => {
  const passwordData = {
    currentPassword: data.currPass,
    password: data.newPass,
    passwordConfirm: data.newPassConfirm
  };
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/update-password/',
      data: passwordData
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your password has been updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};

export const updateUserData = async data => {
  const userData = {
    name: data.name,
    email: data.email
  };

  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/update-me/',
      data: userData
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your profile has been updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const settingsFormData = () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const currPass = document.getElementById('current-password').value;
  const newPass = document.getElementById('new-password').value;
  const newPassConfirm = document.getElementById('new-password-confirm').value;
  return {
    name,
    email,
    currPass,
    newPass,
    newPassConfirm
  };
};
