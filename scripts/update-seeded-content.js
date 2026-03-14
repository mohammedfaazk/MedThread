const { execSync } = require('child_process');
const path = require('path');

console.log('💬 Starting Seeded Content Update...');
console.log('This script will replace all [Seeded] content with realistic, varied text');
console.log('');

try {
  // Change to database directory
  const dbPath = path.join(__dirname, '../packages/database');
  process.chdir(dbPath);
  
  console.log('📦 Ensuring dependencies are installed...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🚀 Running content update...');
  execSync('npx tsx prisma/update-comments.ts', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Content update completed!');
  console.log('');
  console.log('📍 What was updated:');
  console.log('   • All comments now have realistic, varied content');
  console.log('   • Comments are contextually appropriate (patient vs doctor responses)');
  console.log('   • Post titles cleaned (no more [Seeded] prefix)');
  console.log('   • User bios updated with subtle 🌱 identification marker');
  console.log('   • Doctor ratings have realistic patient feedback');
  console.log('');
  console.log('🎯 Content Quality:');
  console.log('   • Specialty-specific comments (cardiology, pediatrics, etc.)');
  console.log('   • Role-appropriate responses (patients vs doctors)');
  console.log('   • Natural, conversational tone throughout');
  console.log('   • No artificial [Seeded] markers visible to users');
  console.log('');
  console.log('🔍 Identification:');
  console.log('   • Seeded users still identifiable by 🌱 emoji in bio');
  console.log('   • All other content appears completely natural');
  console.log('');
  console.log('📊 Test the updated content at:');
  console.log('   • Doctor Profiles: http://localhost:3000/u/[doctor_username]');
  console.log('   • Community Pages: http://localhost:3000/m/[specialty]');
  console.log('   • Admin Dashboard: http://localhost:3000/admin/analytics');
  
} catch (error) {
  console.error('❌ Content update failed:', error.message);
  process.exit(1);
}