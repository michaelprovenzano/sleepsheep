import axios from 'axios';

export const history = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/sleepLogs?sort=-sleepStart',
    });
  } catch (err) {
    console.log(err.response.data);
  }
};
