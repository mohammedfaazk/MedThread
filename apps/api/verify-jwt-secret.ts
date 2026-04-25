import dotenv from 'dotenv';
import { config } from './src/config';

dotenv.config();

console.log('🔐 JWT Secret Verification');
console.log('═'.repeat(60));

console.log('Environment Variables:');
console.log('  JWT_SECRET from .env:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('  JWT_SECRET value:', process.env.JWT_SECRET);
console.log('  JWT_SECRET length:', process.env.JWT_SECRET?.length);

console.log('\nConfig Object:');
console.log('  config.jwtSecret:', config.jwtSecret);
console.log('  config.jwtSecret length:', config.jwtSecret.length);

console.log('\nComparison:');
console.log('  Are they the same?', process.env.JWT_SECRET === config.jwtSecret);

console.log('\n' + '═'.repeat(60));

if (process.env.JWT_SECRET === config.jwtSecret) {
  console.log('✅ JWT secrets match!');
} else {
  console.log('❌ JWT secrets DO NOT match!');
  console.log('  This will cause token verification to fail!');
}
