const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'Test@1234',
  role: 'vendor',
  businessName: 'Test Business',
  location: 'Mumbai',
  phone: '+919876543210'
};

async function testAuth() {
  console.log('🧪 Testing Authentication API\n');

  try {
    // Test 1: Signup
    console.log('1️⃣ Testing Signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ Signup successful!');
    console.log('   User:', signupResponse.data.user.email);
    console.log('   Token:', signupResponse.data.token.substring(0, 20) + '...\n');

    const token = signupResponse.data.token;

    // Test 2: Get Current User
    console.log('2️⃣ Testing Get Current User...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get current user successful!');
    console.log('   Email:', meResponse.data.user.email);
    console.log('   Role:', meResponse.data.user.role);
    console.log('   Business:', meResponse.data.user.businessName, '\n');

    // Test 3: Login
    console.log('3️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...\n');

    // Test 4: Update Profile
    console.log('4️⃣ Testing Update Profile...');
    const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, {
      businessName: 'Updated Business Name',
      location: 'Delhi'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile update successful!');
    console.log('   Business:', updateResponse.data.user.businessName);
    console.log('   Location:', updateResponse.data.user.location, '\n');

    // Test 5: Change Password
    console.log('5️⃣ Testing Change Password...');
    const newPassword = 'NewTest@1234';
    await axios.put(`${BASE_URL}/auth/change-password`, {
      currentPassword: testUser.password,
      newPassword: newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Password change successful!\n');

    // Test 6: Login with new password
    console.log('6️⃣ Testing Login with New Password...');
    const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: newPassword
    });
    console.log('✅ Login with new password successful!\n');

    // Test 7: Test invalid login
    console.log('7️⃣ Testing Invalid Login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Invalid login correctly rejected');
      console.log('   Error:', error.response?.data?.error, '\n');
    }

    // Test 8: Test unauthorized access
    console.log('8️⃣ Testing Unauthorized Access...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Unauthorized access correctly rejected');
      console.log('   Error:', error.response?.data?.error, '\n');
    }

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAuth();
