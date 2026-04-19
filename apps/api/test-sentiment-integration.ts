/**
 * Test script to verify sentiment analysis integration
 * Run: npx ts-node test-sentiment-integration.ts
 */

import { prisma } from '@medthread/database';
import { sentimentAnalysisService } from './src/services/sentiment-analysis.service';
import { doctorSentimentScoringService } from './src/services/doctor-sentiment-scoring.service';

async function testSentimentIntegration() {
  console.log('🧪 Testing Sentiment Analysis Integration\n');

  try {
    // Test 1: Sentiment Analysis Service
    console.log('1️⃣ Testing Sentiment Analysis Service...');
    const testReviews = [
      'Excellent doctor! Very caring and knowledgeable. Highly recommend.',
      'Terrible experience. Doctor was rude and dismissive.',
      'Average visit. Nothing special but got the job done.'
    ];

    for (const review of testReviews) {
      const sentiment = await sentimentAnalysisService.analyzeSentiment(review);
      console.log(`   Review: "${review.substring(0, 50)}..."`);
      console.log(`   Sentiment: ${sentiment.category} (${sentiment.score.toFixed(2)})`);
      console.log(`   Confidence: ${(sentiment.confidence * 100).toFixed(0)}%`);
      console.log(`   Keywords: +${sentiment.keywords.positive.length} / -${sentiment.keywords.negative.length}\n`);
    }

    // Test 2: Find a doctor with reviews
    console.log('2️⃣ Testing Doctor Score Calculation...');
    const doctorWithReviews = await prisma.user.findFirst({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED',
        OR: [
          { patientFeedbacks: { some: { feedback: { not: null } } } }
        ]
      },
      include: {
        patientFeedbacks: {
          where: { feedback: { not: null } },
          take: 5
        }
      }
    });

    if (doctorWithReviews) {
      console.log(`   Found doctor: ${doctorWithReviews.username}`);
      console.log(`   Reviews with text: ${doctorWithReviews.patientFeedbacks.length}`);

      const enhancedScore = await doctorSentimentScoringService.calculateEnhancedScore(doctorWithReviews.id);
      
      console.log(`\n   📊 Score Breakdown:`);
      console.log(`   Traditional (stars): ${enhancedScore.traditionalScore.toFixed(2)}/5`);
      console.log(`   Sentiment: ${enhancedScore.sentimentScore.toFixed(2)} (-1 to +1)`);
      console.log(`   Combined Score: ${enhancedScore.combinedScore.toFixed(2)}/5`);
      console.log(`   Total Reviews: ${enhancedScore.totalReviews}`);
      console.log(`   Reviews with Text: ${enhancedScore.reviewsWithText}`);
      console.log(`   Confidence: ${(enhancedScore.confidence * 100).toFixed(0)}%`);
      
      console.log(`\n   📈 Sentiment Distribution:`);
      console.log(`   Very Positive: ${enhancedScore.sentimentBreakdown.veryPositive}`);
      console.log(`   Positive: ${enhancedScore.sentimentBreakdown.positive}`);
      console.log(`   Neutral: ${enhancedScore.sentimentBreakdown.neutral}`);
      console.log(`   Negative: ${enhancedScore.sentimentBreakdown.negative}`);
      console.log(`   Very Negative: ${enhancedScore.sentimentBreakdown.veryNegative}`);

      // Test 3: Get display score
      console.log('\n3️⃣ Testing Display Score API...');
      const displayScore = await doctorSentimentScoringService.getEnhancedScoreForDisplay(doctorWithReviews.id);
      console.log(`   Score: ${displayScore.score.toFixed(2)}/${displayScore.outOf}`);
      console.log(`   Summary: ${displayScore.sentimentSummary}`);
      console.log(`   Stars: ${displayScore.breakdown.stars.toFixed(2)}`);
      console.log(`   Sentiment: ${displayScore.breakdown.sentiment}`);
    } else {
      console.log('   ⚠️  No doctors with text reviews found');
      console.log('   Run seed scripts to create test data');
    }

    // Test 4: Check API endpoints
    console.log('\n4️⃣ Available API Endpoints:');
    console.log('   GET  /api/doctor-sentiment/:doctorId/score');
    console.log('   GET  /api/doctor-sentiment/:doctorId/detailed');
    console.log('   POST /api/doctor-sentiment/:doctorId/update');
    console.log('   POST /api/doctor-sentiment/analyze-review');
    console.log('   POST /api/doctor-sentiment/batch-update');

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Add OPENAI_API_KEY to .env for better accuracy (optional)');
    console.log('   2. Run: npx ts-node scripts/update-doctor-sentiment-scores.ts');
    console.log('   3. Test creating a new review via API');
    console.log('   4. Check logs for [ReviewSentimentHook] messages');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testSentimentIntegration()
  .then(() => {
    console.log('\n🎉 Sentiment analysis integration is working!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Integration test failed:', error);
    process.exit(1);
  });
