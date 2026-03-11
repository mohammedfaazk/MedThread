import jwt from 'jsonwebtoken';
import { config } from './src/config';

console.log('🔍 JWT Debug Information:');
console.log('Environment JWT_SECRET:', process.env.JWT_SECRET);
console.log('Config JWT Secret:', config.jwtSecret);
console.log('Auth middleware secret:', process.env.JWT_SECRET || 'secret');

// Test token generation and verification
const testUserId = 'test-user-123';
const testRole = 'PATIENT';

// Generate token using config secret
const tokenWithConfig = jwt.sign({ userId: testUserId, role: testRole }, config.jwtSecret);
console.log('\nToken with config secret:', tokenWithConfig);

// Generate token using auth middleware secret
const tokenWithAuthSecret = jwt.sign({ userId: testUserId, role: testRole }, process.env.JWT_SECRET || 'secret');
console.log('Token with auth middleware secret:', tokenWithAuthSecret);

// Test verification
try {
  const decoded1 = jwt.verify(tokenWithConfig, config.jwtSecret);
  console.log('\n✅ Config token verified with config secret:', decoded1);
} catch (error) {
  console.log('\n❌ Config token failed with config secret:', error);
}

try {
  const decoded2 = jwt.verify(tokenWithConfig, process.env.JWT_SECRET || 'secret');
  console.log('✅ Config token verified with auth middleware secret:', decoded2);
} catch (error) {
  console.log('❌ Config token failed with auth middleware secret:', error);
}

try {
  const decoded3 = jwt.verify(tokenWithAuthSecret, process.env.JWT_SECRET || 'secret');
  console.log('✅ Auth token verified with auth middleware secret:', decoded3);
} catch (error) {
  console.log('❌ Auth token failed with auth middleware secret:', error);
}

try {
  const decoded4 = jwt.verify(tokenWithAuthSecret, config.jwtSecret);
  console.log('✅ Auth token verified with config secret:', decoded4);
} catch (error) {
  console.log('❌ Auth token failed with config secret:', error);
}