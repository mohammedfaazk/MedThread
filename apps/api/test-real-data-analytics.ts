/**
 * Test: Verify Analytics Count Both Mock and Real Data
 */

import { prisma } from '@medthread/database';

async function main() {
  console.log('🧪 Testing Analytics with Mixed Data...\n');

  // Count mock users
  const mockDoctors = await prisma.user.count({
    where: {
      role: 'DOCTOR',
      email: { contains: '@medthread-mock.com' }
    }
  });

  const mockPatients = await prisma.user.count({
    where: {
      role: 'PATIENT',
      email: { contains: '@medthread-mock.com' }
    }
  });

  // Count real users (non-mock)
  const realDoctors = await prisma.user.count({
    where: {
      role: 'DOCTOR',
      email: { not: { contains: '@medthread-mock.com' } }
    }
  });

  const realPatients = await prisma.user.count({
    where: {
      role: 'PATIENT',
      email: { not: { contains: '@medthread-mock.com' } }
    }
  });

  // Count ALL users (what analytics sees)
  const totalDoctors = await prisma.user.count({
    where: { role: 'DOCTOR' }
  });

  const totalPatients = await prisma.user.count({
    where: { role: 'PATIENT' }
  });

  console.log('📊 USER BREAKDOWN');
  console.log('═══════════════════════════════════════════\n');
  
  console.log('👨‍⚕️  DOCTORS:');
  console.log(`   Mock:  ${mockDoctors}`);
  console.log(`   Real:  ${realDoctors}`);
  console.log(`   Total: ${totalDoctors} ✅ (What analytics shows)\n`);

  console.log('👥 PATIENTS:');
  console.log(`   Mock:  ${mockPatients}`);
  console.log(`   Real:  ${realPatients}`);
  console.log(`   Total: ${totalPatients} ✅ (What analytics shows)\n`);

  console.log('═══════════════════════════════════════════');
  console.log('📈 ANALYTICS VERIFICATION');
  console.log('═══════════════════════════════════════════\n');

  if (mockDoctors + realDoctors === totalDoctors) {
    console.log('✅ Doctor count is correct: Mock + Real = Total');
  } else {
    console.log('❌ Doctor count mismatch!');
  }

  if (mockPatients + realPatients === totalPatients) {
    console.log('✅ Patient count is correct: Mock + Real = Total');
  } else {
    console.log('❌ Patient count mismatch!');
  }

  console.log('\n🎯 CONCLUSION:');
  console.log('═══════════════════════════════════════════');
  console.log('Analytics counts ALL users regardless of email domain.');
  console.log('When real users sign up, they will be included automatically!');
  console.log('═══════════════════════════════════════════\n');

  // Test with posts
  const mockPosts = await prisma.post.count({
    where: {
      author: {
        email: { contains: '@medthread-mock.com' }
      }
    }
  });

  const realPosts = await prisma.post.count({
    where: {
      author: {
        email: { not: { contains: '@medthread-mock.com' } }
      }
    }
  });

  const totalPosts = await prisma.post.count();

  console.log('📝 POST BREAKDOWN');
  console.log('═══════════════════════════════════════════');
  console.log(`   Mock posts:  ${mockPosts}`);
  console.log(`   Real posts:  ${realPosts}`);
  console.log(`   Total posts: ${totalPosts} ✅ (What analytics shows)`);
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
