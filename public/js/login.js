import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Welcome back${
          res.data.data.user.name ? `, ${res.data.data.user.name}` : ''
        }!`
      );
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Thanks for using Sleepily! You're now logging out.`
      );
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlert(
      'error',
      `Oh no!${
        res.data.data.user.name ? `, ${res.data.data.user.name}` : ''
      }! ${err.response.data.message}`
    );
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('Welcome to Sleepily!');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1500);
    }
  } catch (err) {
    showAlert(
      'error',
      `Oh no!${
        res.data.data.user.name ? `, ${res.data.data.user.name}` : ''
      }! ${err.response.data.message}`
    );
  }
};

export const sendPasswordResetLink = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgot-password',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'A password reset link has been set to your email!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPassword = async (newPassword, newPasswordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/reset-password/${token}`,
      data: {
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your password was changed successfully!');
      window.setTimeout(() => {
        location.assign('/dashboard');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
