const axios = require('axios');

const authUrl = 'http://localhost:5000/api/auth/login';

async function testLogin() {
  console.log('Testing login endpoint...');
  
  try {
    const response = await axios.post(authUrl, {
      username: 'admin',
      password: 'admin123'
    }, {
      timeout: 5000, // 5 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request details:', error.request);
    } else {
      console.error('Error during request setup:', error.message);
    }
  }
}

testLogin();