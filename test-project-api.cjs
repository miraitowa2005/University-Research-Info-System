// Test script for project API endpoints
const axios = require('axios');

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Admin credentials
const adminCredentials = {
  username: 'admin',
  password: 'admin123'
};

async function testProjectAPI() {
  try {
    console.log('Testing University Research Info System Project API...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, adminCredentials);
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful!');
    console.log('   Token:', token.slice(0, 20) + '...');
    
    // Create axios instance with auth token
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Get all project notices
    console.log('\n2. Getting all project notices...');
    const noticesResponse = await apiClient.get('/projects/notices');
    console.log('   ✅ Notices retrieved:', noticesResponse.data.length);
    
    if (noticesResponse.data.length > 0) {
      const firstNotice = noticesResponse.data[0];
      console.log('   First notice:', firstNotice.title);
      
      // Step 3: Get phases for the first notice
      console.log(`\n3. Getting phases for notice ${firstNotice.id}...`);
      const phasesResponse = await apiClient.get(`/projects/notices/${firstNotice.id}/phases`);
      console.log('   ✅ Phases retrieved:', phasesResponse.data.length);
      
      if (phasesResponse.data.length > 0) {
        const firstPhase = phasesResponse.data[0];
        console.log('   First phase:', firstPhase.name);
        
        // Step 4: Get submissions for the first phase (admin view)
        console.log(`\n4. Getting submissions for phase ${firstPhase.id}...`);
        const submissionsResponse = await apiClient.get(`/projects/phases/${firstPhase.id}/submissions`);
        console.log('   ✅ Submissions retrieved:', submissionsResponse.data.length);
        
        // Step 5: Get latest submissions (admin real-time updates)
        console.log('\n5. Getting latest submissions...');
        const latestResponse = await apiClient.get('/projects/submissions/latest');
        console.log('   ✅ Latest submissions retrieved:', latestResponse.data.length);
        
        // Step 6: Test teacher submissions endpoint (simulate teacher)
        console.log('\n6. Testing teacher submissions endpoint...');
        // For this test, we'll just check if the endpoint exists
        const testTeacherId = 2; // Assuming there's a teacher with ID 2
        const teacherResponse = await apiClient.get('/projects/my-submissions', {
          data: { user_id: testTeacherId } // Using data since it's a GET with body
        });
        console.log('   ✅ Teacher submissions retrieved:', teacherResponse.data.length);
        
        // Step 7: Test phase submissions endpoint with different phase
        if (phasesResponse.data.length > 1) {
          const secondPhase = phasesResponse.data[1];
          console.log(`\n7. Getting submissions for second phase ${secondPhase.id}...`);
          const secondPhaseResponse = await apiClient.get(`/projects/phases/${secondPhase.id}/submissions`);
          console.log('   ✅ Submissions retrieved:', secondPhaseResponse.data.length);
        }
      }
    } else {
      console.log('   ⚠️  No notices found. Creating test data...');
      // Create test notice if none exists
      const testNotice = await apiClient.post('/projects/notices', {
        title: '测试项目通知',
        content: '这是一个测试项目通知',
        publish_by: 1
      });
      console.log('   ✅ Test notice created:', testNotice.data.title);
      
      // Create test phase
      const testPhase = await apiClient.post('/projects/phases', {
        notice_id: testNotice.data.id,
        name: '测试阶段',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        description: '这是一个测试阶段'
      });
      console.log('   ✅ Test phase created:', testPhase.data.name);
    }
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\nThe project API endpoints are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the tests
testProjectAPI();