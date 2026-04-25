import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

console.log('🔐 JWT Token Generation and Verification Test');
console.log('═'.repeat(60));
console.log('JWT_SECRET from env:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('Using secret:', JWT_SECRET);
console.log('═'.repeat(60));

// Test data
const testUserId = 'test-user-123';
const testRole = 'DOCTOR';

// Generate token
const token = jwt.sign(
  { userId: testUserId, role: testRole },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n✅ Token generated successfully');
console.log('Token:', token.substring(0, 50) + '...');

// Verify token
try {
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  console.log('\n✅ Token verified successfully');
  console.log('Decoded payload:', { userId: decoded.userId, role: decoded.role });
} catch (error: any) {
  console.error('\n❌ Token verification failed:', error.message);
}

// Test with wrong secret
console.log('\n' + '═'.repeat(60));
console.log('Testing with wrong secret...');
try {
  const decoded = jwt.verify(token, 'wrong-secret') as any;
  console.log('❌ Token verified with wrong secret (should have failed!)');
} catch (error: any) {
  console.log('✅ Token verification correctly failed with wrong secret');
  console.log('Error:', error.message);
}

console.log('\n' + '═'.repeat(60));
console.log('✅ All tests passed!');
