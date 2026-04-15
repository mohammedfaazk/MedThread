import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function getUserPincodes() {
  try {
    console.log('🔍 Fetching user pincodes...\n');

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: 'dr.watson' },
          { username: 'logintestdoctor1773995919045' }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        pincode: true,
        city: true,
        state: true,
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found with those usernames');
      return;
    }

    console.log('✅ Found users:\n');
    users.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Pincode: ${user.pincode || 'Not set'}`);
      console.log(`City: ${user.city || 'Not set'}`);
      console.log(`State: ${user.state || 'Not set'}`);
      console.log('---\n');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserPincodes();
