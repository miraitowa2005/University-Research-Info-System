const axios = require('axios');

const authUrl = 'http://localhost:5000/api/auth';
const baseUrl = 'http://localhost:5000/api/projects';

// Test all endpoints with authentication
async function testEndpoints() {
  console.log('Testing API endpoints...');
  
  try {
    // Step 1: Login to get token
    console.log('\n1. Logging in as admin...');
    const loginResponse = await axios.post(`${authUrl}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('No token received');
    }
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful!');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Role:', loginResponse.data.user.role);
    
    // Create axios instance with authorization header
    const api = axios.create({
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Test 2: Get all notices
    console.log('\n2. Testing GET /notices');
    const noticesResponse = await api.get(`${baseUrl}/notices`);
    console.log('✓ Success:', noticesResponse.status);
    console.log('   Notices found:', noticesResponse.data.length);
    
    // Test 3: Get phases for first notice
    if (noticesResponse.data.length > 0) {
      const noticeId = noticesResponse.data[0].id;
      console.log(`\n3. Testing GET /notices/${noticeId}/phases`);
      const phasesResponse = await api.get(`${baseUrl}/notices/${noticeId}/phases`);
      console.log('✓ Success:', phasesResponse.status);
      console.log('   Phases found:', phasesResponse.data.length);
      
      // Test 4: Get submissions for first phase
      if (phasesResponse.data.length > 0) {
        const phaseId = phasesResponse.data[0].id;
        console.log(`\n4. Testing GET /phases/${phaseId}/submissions`);
        const phaseSubmissionsResponse = await api.get(`${baseUrl}/phases/${phaseId}/submissions`);
        console.log('✓ Success:', phaseSubmissionsResponse.status);
        console.log('   Submissions found:', phaseSubmissionsResponse.data.length);
      }
    }
    
    // Test 5: Get latest submissions
    console.log('\n5. Testing GET /submissions/latest');
    const latestSubmissionsResponse = await api.get(`${baseUrl}/submissions/latest`);
    console.log('✓ Success:', latestSubmissionsResponse.status);
    console.log('   Latest submissions:', latestSubmissionsResponse.data.length);
    
    // Test 6: Get my submissions (with dummy user_id)
    console.log('\n6. Testing GET /my-submissions?user_id=2');
    const mySubmissionsResponse = await api.get(`${baseUrl}/my-submissions?user_id=2`);
    console.log('✓ Success:', mySubmissionsResponse.status);
    console.log('   My submissions:', mySubmissionsResponse.data.length);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   StatusText:', error.response.statusText);
      console.error('   Error data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received:', error.request);
    }
  }
}

testEndpoints();