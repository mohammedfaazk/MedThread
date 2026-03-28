/**
 * Test Doctor Posting Answer in Q&A Forum
 */

import { prisma } from '@medthread/database';

async function main() {
  console.log('🧪 Testing Doctor Answer Posting...\n');

  // Get a doctor
  const doctor = await prisma.user.findFirst({
    where: { 
      role: 'DOCTOR',
      email: { contains: '@medthread-mock.com' }
    }
  });

  if (!doctor) {
    console.log('❌ No doctor found');
    return;
  }

  console.log(`✅ Found doctor: ${doctor.username} (${doctor.email})`);

  // Get a question
  const question = await prisma.forumQuestion.findFirst({
    where: {
      status: 'OPEN'
    }
  });

  if (!question) {
    console.log('❌ No open question found');
    return;
  }

  console.log(`✅ Found question: ${question.title}`);

  // Login as doctor to get token
  const bcrypt = await import('bcryptjs');
  const jwt = (await import('jsonwebtoken')).default;

  const token = jwt.sign(
    { 
      userId: doctor.id, 
      role: doctor.role,
      email: doctor.email 
    },
    'change-this-to-a-secure-random-string-in-production',
    { expiresIn: '7d' }
  );

  console.log(`✅ Generated token for doctor`);

  // Test posting answer via API
  const baseURL = 'http://localhost:3001/api/v1';
  
  try {
    const response = await fetch(`${baseURL}/qa-forum/questions/${question.id}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: 'This is a test answer from a doctor to verify the feature is working correctly.'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS! Doctor can post answers');
      console.log(`   Answer ID: ${data.data.id}`);
      console.log(`   Content: ${data.data.content.substring(0, 50)}...`);
    } else {
      console.log('\n❌ FAILED! Error posting answer');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data);
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
