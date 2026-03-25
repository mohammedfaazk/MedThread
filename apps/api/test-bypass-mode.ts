import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('\n🔍 CHECKING BYPASS MODE CONFIGURATION');
console.log('═'.repeat(80));

const bypassEnabled = process.env.BYPASS_CHAT_PASSWORD === 'true';

console.log('\nEnvironment Variables:');
console.log('─'.repeat(80));
console.log(`BYPASS_CHAT_PASSWORD: "${process.env.BYPASS_CHAT_PASSWORD}"`);
console.log(`NODE_ENV: "${process.env.NODE_ENV}"`);

console.log('\nBypass Status:');
console.log('─'.repeat(80));

if (bypassEnabled) {
  console.log('✅ BYPASS MODE ENABLED');
  console.log('   Password verification will be skipped');
  console.log('   Doctors can access chat without entering password');
  console.log('');
  console.log('⚠️  WARNING: This should only be used in development!');
} else {
  console.log('❌ BYPASS MODE DISABLED');
  console.log('   Password verification is required');
  console.log('   Doctors must enter their password to access chat');
  console.log('');
  console.log('💡 To enable bypass mode:');
  console.log('   1. Edit apps/api/.env');
  console.log('   2. Set: BYPASS_CHAT_PASSWORD="true"');
  console.log('   3. Restart the API server');
}

console.log('\n═'.repeat(80));
