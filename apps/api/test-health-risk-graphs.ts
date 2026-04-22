/**
 * Test Health Risk Graphs - Verify data is accessible via API
 */

import { prisma } from '@medthread/database';

async function testHealthRiskGraphs() {
  console.log('\n🧪 Testing Health Risk Assessment Graphs\n');

  try {
    // Find Navin user
    const user = await prisma.user.findUnique({
      where: { email: 'navin@gmail.com' },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.username} (${user.email})`);
    console.log(`   User ID: ${user.id}\n`);

    // Get health profile with predictions
    const profile = await prisma.patientHealthProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      console.error('❌ No health profile found');
      return;
    }

    console.log('✅ Health profile found');
    console.log(`   Age Group: ${profile.ageGroup}`);
    console.log(`   Biological Sex: ${profile.biologicalSex}`);
    console.log(`   Last Updated: ${profile.lastUpdatedAt}\n`);

    // Check predictions
    const secondaryData = profile.secondaryHealthConcerns as any;
    
    if (!secondaryData || !secondaryData.predictions) {
      console.error('❌ No predictions found in secondaryHealthConcerns');
      return;
    }

    const predictions = secondaryData.predictions;
    console.log(`✅ Found ${predictions.length} predictions:\n`);

    predictions.forEach((pred: any, index: number) => {
      console.log(`${index + 1}. ${pred.disease}`);
      console.log(`   Risk Score: ${pred.riskScore}%`);
      console.log(`   Risk Level: ${pred.riskLevel}`);
      console.log(`   Timeframe: ${pred.timeframe}`);
      console.log(`   Factors: ${pred.factors?.length || 0}`);
      console.log(`   Prevention Plan: ${pred.preventionPlan?.length || 0} actions`);
      console.log(`   Confidence: ${(pred.confidence * 100).toFixed(0)}%\n`);
    });

    console.log('📊 Graph Data Summary:');
    console.log(`   - Overall Risk: ${Math.round(predictions.reduce((acc: number, p: any) => acc + p.riskScore, 0) / predictions.length)}%`);
    console.log(`   - High Risk: ${predictions.filter((p: any) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}`);
    console.log(`   - Moderate Risk: ${predictions.filter((p: any) => p.riskLevel === 'MODERATE').length}`);
    console.log(`   - Low Risk: ${predictions.filter((p: any) => p.riskLevel === 'LOW').length}\n`);

    console.log('🎉 SUCCESS! Data is ready for graphs.');
    console.log('\n📍 Next Steps:');
    console.log('   1. Open browser: http://localhost:3000/health-risk');
    console.log('   2. Login as: navin@gmail.com');
    console.log('   3. View the graphs and risk dashboard');
    console.log('   4. Click on any risk card for detailed information\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHealthRiskGraphs();
