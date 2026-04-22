/**
 * Inspect Health Concerns Structure
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectHealthConcerns() {
  console.log('🔍 Inspecting Health Concerns Structure...\n');

  try {
    const profiles = await prisma.patientHealthProfile.findMany({
      select: {
        userId: true,
        secondaryHealthConcerns: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    for (const profile of profiles) {
      console.log(`\n👤 User: ${profile.user.username}`);
      console.log(`   User ID: ${profile.userId}`);
      console.log(`   secondaryHealthConcerns type: ${typeof profile.secondaryHealthConcerns}`);
      console.log(`   secondaryHealthConcerns value:`);
      console.log(JSON.stringify(profile.secondaryHealthConcerns, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectHealthConcerns();
