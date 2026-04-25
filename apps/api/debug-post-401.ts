import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

console.log('🔍 Debugging POST 401 Error');
console.log('═'.repeat(60));
console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('Using secret:', JWT_SECRET);
console.log('═'.repeat(60));

// Create a test token
const testToken = jwt.sign(
  { userId: 'test-user-123', role: 'DOCTOR' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n✅ Test token generated');
console.log('Token:', testToken.substring(0, 50) + '...');

// Try to create a post with the token
async function testPostCreation() {
  try {
    console.log('\n📤 Attempting to create post...');
    console.log('URL:', `${API_URL}/api/v1/posts`);
    console.log('Headers:', {
      'Authorization': `Bearer ${testToken.substring(0, 50)}...`,
      'Content-Type': 'application/json'
    });

    const response = await axios.post(
      `${API_URL}/api/v1/posts`,
      {
        title: 'Test Post',
        content: 'This is a test post',
        communityId: 'test-community',
        type: 'TEXT'
      },
      {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Post created successfully!');
    console.log('Response:', response.data);
  } catch (error: any) {
    console.log('\n❌ Error creating post');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testPostCreation();
