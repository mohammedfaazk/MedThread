const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Starting Doctor Profiles Seeding...');
console.log('This script will add realistic doctor profiles to the database (non-destructive)');
console.log('');

try {
  // Change to database directory
  const dbPath = path.join(__dirname, '../packages/database');
  process.chdir(dbPath);
  
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🚀 Running doctor seeding...');
  execSync('npx tsx seed-doctors.ts', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Doctor seeding completed!');
  console.log('');
  console.log('📍 What was created:');
  console.log('   • 5 realistic doctor profiles with verified status');
  console.log('   • Specialty communities (cardiology, pediatrics, dermatology, neurology, orthopedics)');
  console.log('   • Sample posts and comments in each specialty');
  console.log('   • Patient interactions and conversations');
  console.log('   • Appointment records with various statuses');
  console.log('   • Patient feedback with cure/outcome tracking');
  console.log('   • Comment-to-message conversion events');
  console.log('   • Doctor performance analytics data');
  console.log('   • Community activity metrics');
  console.log('');
  console.log('🔍 All seeded records are marked with [Seeded] prefix for easy identification');
  console.log('🎯 You can now test the enhanced analytics features with realistic data!');
  console.log('');
  console.log('📊 Access the analytics at:');
  console.log('   • Admin Dashboard: http://localhost:3000/admin/analytics');
  console.log('   • Doctor Profiles: http://localhost:3000/u/[doctor_username]');
  console.log('   • Community Pages: http://localhost:3000/m/[specialty]');
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}