const axios = require('axios');

// Test script to check tasks API directly
async function testTasksAPI() {
  try {
    console.log('Testing Tasks API...');
    
    // First, let's try to get tasks without authentication to see what happens
    console.log('\n1. Testing GET /api/tasks without auth:');
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('Expected error (no auth):', error.response?.status, error.response?.data?.message);
    }
    
    // Test if the server is responding
    console.log('\n2. Testing server health:');
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      console.log('Health check:', response.data);
    } catch (error) {
      console.log('Health check failed:', error.message);
    }
    
    // Test if auth endpoint exists
    console.log('\n3. Testing auth endpoint:');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@test.com',
        password: 'test123'
      });
      console.log('Auth response:', response.data);
    } catch (error) {
      console.log('Auth error (expected):', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTasksAPI();
