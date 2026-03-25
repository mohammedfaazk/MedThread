import { prisma } from '@medthread/database';

async function testSupportGroups() {
  try {
    console.log('Testing Support Groups...\n');

    // Test 1: Check if SupportGroup model exists
    console.log('1. Checking if SupportGroup model exists...');
    const groupCount = await prisma.supportGroup.count();
    console.log(`✓ SupportGroup model exists. Current count: ${groupCount}\n`);

    // Test 2: Try to create a test group
    console.log('2. Creating a test support group...');
    const testGroup = await prisma.supportGroup.create({
      data: {
        name: 'Test Diabetes Support',
        condition: 'Diabetes',
        description: 'A test group for diabetes patients',
        isPrivate: false,
        moderators: ['test-user-id'],
        members: [{
          userId: 'test-user-id',
          joinedAt: new Date().toISOString(),
          isAnonymous: false
        }],
        memberCount: 1,
        rules: [],
        createdBy: 'test-user-id'
      }
    });
    console.log(`✓ Test group created: ${testGroup.id}`);
    console.log(`  Name: ${testGroup.name}`);
    console.log(`  Private: ${testGroup.isPrivate}`);
    console.log(`  Members: ${testGroup.memberCount}\n`);

    // Test 3: Fetch all groups
    console.log('3. Fetching all groups...');
    const allGroups = await prisma.supportGroup.findMany();
    console.log(`✓ Found ${allGroups.length} groups\n`);

    // Test 4: Test private group
    console.log('4. Creating a private group...');
    const privateGroup = await prisma.supportGroup.create({
      data: {
        name: 'Private Cancer Support',
        condition: 'Cancer',
        description: 'A private group for cancer patients',
        isPrivate: true,
        moderators: ['test-user-id'],
        members: [{
          userId: 'test-user-id',
          joinedAt: new Date().toISOString(),
          isAnonymous: false
        }],
        memberCount: 1,
        rules: ['Be respectful', 'No medical advice'],
        createdBy: 'test-user-id'
      }
    });
    console.log(`✓ Private group created: ${privateGroup.id}`);
    console.log(`  Name: ${privateGroup.name}`);
    console.log(`  Private: ${privateGroup.isPrivate}`);
    console.log(`  Rules: ${JSON.stringify(privateGroup.rules)}\n`);

    // Clean up test data
    console.log('5. Cleaning up test data...');
    await prisma.supportGroup.deleteMany({
      where: {
        name: {
          in: ['Test Diabetes Support', 'Private Cancer Support']
        }
      }
    });
    console.log('✓ Test data cleaned up\n');

    console.log('✅ All tests passed! Support Groups are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSupportGroups();
