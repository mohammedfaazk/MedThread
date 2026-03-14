const { execSync } = require('child_process');
const path = require('path');

console.log('📊 Starting Doctor Analytics Enrichment...');
console.log('This script will add comprehensive analytics and performance metrics to seeded doctors');
console.log('');

try {
  // Change to database directory
  const dbPath = path.join(__dirname, '../packages/database');
  process.chdir(dbPath);
  
  console.log('📦 Ensuring dependencies are installed...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🚀 Running analytics enrichment...');
  execSync('npx tsx prisma/enrich-doctor-analytics.ts', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Analytics enrichment completed!');
  console.log('');
  console.log('📍 What was enriched:');
  console.log('   • Portfolio scores and satisfaction ratings');
  console.log('   • Comment-to-message conversion tracking');
  console.log('   • Profile-to-appointment conversion metrics');
  console.log('   • Patient outcome breakdowns (Cured/Not Yet/Consult New Doctor)');
  console.log('   • Engagement metrics (posts, comments, upvotes, followers)');
  console.log('   • Community activity classifications');
  console.log('   • Per-comment conversion analytics');
  console.log('   • Doctor ratings and reviews');
  console.log('   • User and post analytics data');
  console.log('');
  console.log('🎯 Performance Variance Created:');
  console.log('   • HIGH: Dr. Sarah Chen (Cardiology), Dr. James Thompson (Neurology)');
  console.log('   • MODERATE: Dr. Michael Rodriguez (Pediatrics), Dr. Emily Watson (Dermatology)');
  console.log('   • LOW: Dr. Lisa Patel (Orthopedics)');
  console.log('');
  console.log('📊 Test the enriched analytics at:');
  console.log('   • Admin Dashboard: http://localhost:3000/admin/analytics');
  console.log('   • Doctor Profiles: http://localhost:3000/u/[doctor_username]');
  console.log('   • Community Pages: http://localhost:3000/m/[specialty]');
  console.log('');
  console.log('🔍 All enriched data is traceable to seeded users only');
  
} catch (error) {
  console.error('❌ Analytics enrichment failed:', error.message);
  process.exit(1);
}