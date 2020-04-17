import axios from 'axios';

export const history = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/sleepLogs?sort=-sleepStart'
    });

    console.log(res);
  } catch (err) {
    console.log(err.response.data);
  }
};
