import { prisma } from '@medthread/database';

async function updateUserRole() {
  const email = 'meghamaryvinu@licet.ac.in';
  
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // First, find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        doctorVerificationStatus: true,
      }
    });

    if (!user) {
      console.error(`User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('\nCurrent user data:');
    console.log(JSON.stringify(user, null, 2));

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'PATIENT',
        doctorVerificationStatus: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        doctorVerificationStatus: true,
      }
    });

    console.log('\nUpdated user data:');
    console.log(JSON.stringify(updatedUser, null, 2));
    console.log('\n✅ User role updated successfully!');
    
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
