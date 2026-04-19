/**
 * Script to update all doctor scores with sentiment analysis
 * Run this to recalculate scores for existing doctors
 */

import { prisma } from '@medthread/database';
import { doctorSentimentScoringService } from '../src/services/doctor-sentiment-scoring.service';

async function updateAllDoctorScores() {
  console.log('🎯 Starting doctor sentiment score update...\n');

  try {
    // Get all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      },
      select: {
        id: true,
        username: true,
        fullName: true
      }
    });

    console.log(`📊 Found ${doctors.length} verified doctors\n`);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const progress = `[${i + 1}/${doctors.length}]`;

      try {
        console.log(`${progress} Processing ${doctor.fullName || doctor.username}...`);
        
        const enhanced = await doctorSentimentScoringService.calculateEnhancedScore(doctor.id);
        await doctorSentimentScoringService.updateDoctorPerformanceWithSentiment(doctor.id);

        console.log(`  ✅ Updated - Score: ${enhanced.combinedScore.toFixed(2)}/5`);
        console.log(`     Traditional: ${enhanced.traditionalScore.toFixed(2)}, Sentiment: ${enhanced.sentimentScore.toFixed(2)}`);
        console.log(`     Reviews: ${enhanced.totalReviews} (${enhanced.reviewsWithText} with text)\n`);

        updated++;
      } catch (error) {
        failed++;
        const errorMsg = `${doctor.username}: ${error}`;
        errors.push(errorMsg);
        console.error(`  ❌ Failed: ${error}\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Update Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✨ Done!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateAllDoctorScores();
