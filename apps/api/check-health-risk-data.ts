/**
 * Check Health Risk Data in Database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHealthRiskData() {
  console.log('🔍 Checking Health Risk Data...\n');

  try {
    // Get all users with health profiles
    const profiles = await prisma.patientHealthProfile.findMany({
      select: {
        id: true,
        userId: true,
        secondaryHealthConcerns: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    console.log(`Found ${profiles.length} health profiles\n`);

    for (const profile of profiles) {
      console.log(`\n👤 User: ${profile.user.username} (${profile.user.email})`);
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   User ID: ${profile.userId}`);
      
      if (profile.secondaryHealthConcerns) {
        const concerns = profile.secondaryHealthConcerns as any;
        
        if (Array.isArray(concerns)) {
          console.log(`   ✅ Has ${concerns.length} risk predictions`);
          
          concerns.forEach((prediction: any, index: number) => {
            console.log(`\n   Prediction ${index + 1}:`);
            console.log(`   - Disease: ${prediction.disease}`);
            console.log(`   - Risk Level: ${prediction.riskLevel}`);
            console.log(`   - Risk Score: ${prediction.riskScore || prediction.riskPercentage}%`);
            console.log(`   - Timeframe: ${prediction.timeframe}`);
          });
        } else {
          console.log(`   ⚠️  secondaryHealthConcerns is not an array:`, typeof concerns);
        }
      } else {
        console.log(`   ❌ No risk predictions found`);
      }
    }

    // Check if there are any predictions at all
    const profilesWithPredictions = profiles.filter(p => {
      const concerns = p.secondaryHealthConcerns as any;
      return Array.isArray(concerns) && concerns.length > 0;
    });

    console.log(`\n\n📊 Summary:`);
    console.log(`- Total profiles: ${profiles.length}`);
    console.log(`- Profiles with predictions: ${profilesWithPredictions.length}`);
    console.log(`- Profiles without predictions: ${profiles.length - profilesWithPredictions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHealthRiskData();
