/**
 * Test Predictions Service Directly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPredictionsService() {
  console.log('🧪 Testing Predictions Service...\n');

  try {
    // Test with navin's user ID
    const userId = 'cmmt5kn0e0002ztoyh2g3afz6';
    
    console.log(`1️⃣ Fetching predictions for user: ${userId}`);
    
    const profile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });

    if (!profile || !profile.secondaryHealthConcerns) {
      console.log('❌ No profile or health concerns found');
      return;
    }

    const clinicalData = profile.secondaryHealthConcerns as any;
    const predictions = clinicalData.predictions || [];

    // Filter out expired predictions and normalize field names
    const now = new Date();
    const normalizedPredictions = predictions
      .filter((p: any) => new Date(p.validUntil) >= now)
      .map((p: any) => ({
        ...p,
        disease: p.disease || p.riskType,
        riskPercentage: p.riskPercentage || p.riskScore,
        preventionTips: p.preventionTips || p.preventionPlan,
        basedOn: p.basedOn || p.factors
      }))
      .sort((a: any, b: any) => b.riskScore - a.riskScore);

    console.log(`\n✅ Found ${normalizedPredictions.length} predictions\n`);
    
    normalizedPredictions.forEach((pred: any, index: number) => {
      console.log(`Prediction ${index + 1}:`);
      console.log(`  - Disease: ${pred.disease}`);
      console.log(`  - Risk Level: ${pred.riskLevel}`);
      console.log(`  - Risk Score: ${pred.riskScore}%`);
      console.log(`  - Risk Percentage: ${pred.riskPercentage}%`);
      console.log(`  - Timeframe: ${pred.timeframe}`);
      console.log(`  - Prevention Tips: ${pred.preventionTips ? pred.preventionTips.length : 0} tips`);
      console.log(`  - Based On: ${pred.basedOn ? pred.basedOn.length : 0} factors`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testPredictionsService();
