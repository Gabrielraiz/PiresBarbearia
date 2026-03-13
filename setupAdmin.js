const axios = require('axios');

const setupAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/setup-admin', {
      email: 'piresqk@gmail.com',
      password: 'Yuri2209',
      name: 'Admin PiresQK',
      phone: '(49) 99918-3044'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

setupAdmin();
