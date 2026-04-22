/**
 * Live Debug Script for Health Risk Assessment
 * Run this while testing in the browser to see what's happening
 */

import { prisma } from '@medthread/database';

async function debugHealthRisk() {
  console.log('🔍 DEBUGGING HEALTH RISK ASSESSMENT\n');

  try {
    // 1. Check if PatientHealthProfile table exists and has data
    console.log('1️⃣ Checking PatientHealthProfile table...');
    const profiles = await prisma.patientHealthProfile.findMany({
      take: 5,
      select: {
        userId: true,
        ageGroup: true,
        biologicalSex: true,
        secondaryHealthConcerns: true,
        lastUpdatedAt: true
      }
    });

    console.log(`   Found ${profiles.length} health profiles`);
    
    profiles.forEach((profile, index) => {
      console.log(`\n   Profile ${index + 1}:`);
      console.log(`   - User ID: ${profile.userId}`);
      console.log(`   - Age Group: ${profile.ageGroup}`);
      console.log(`   - Sex: ${profile.biologicalSex}`);
      console.log(`   - Last Updated: ${profile.lastUpdatedAt}`);
      
      const clinicalData = profile.secondaryHealthConcerns as any;
      if (clinicalData) {
        console.log(`   - Has Clinical Data: YES`);
        if (clinicalData.predictions) {
          console.log(`   - Predictions: ${clinicalData.predictions.length}`);
          clinicalData.predictions.forEach((p: any) => {
            console.log(`     * ${p.disease}: ${p.riskScore}% (${p.riskLevel})`);
          });
        } else {
          console.log(`   - Predictions: NONE`);
        }
      } else {
        console.log(`   - Has Clinical Data: NO`);
      }
    });

    // 2. Check a specific user (navin)
    console.log('\n\n2️⃣ Checking Navin\'s profile specifically...');
    const navinUser = await prisma.user.findUnique({
      where: { email: 'navin@example.com' },
      select: { id: true, name: true, email: true }
    });

    if (navinUser) {
      console.log(`   ✅ Found user: ${navinUser.name} (${navinUser.id})`);
      
      const navinProfile = await prisma.patientHealthProfile.findUnique({
        where: { userId: navinUser.id }
      });

      if (navinProfile) {
        console.log(`   ✅ Has health profile`);
        const clinicalData = navinProfile.secondaryHealthConcerns as any;
        
        if (clinicalData) {
          console.log(`\n   Clinical Data:`);
          console.log(`   - Age: ${clinicalData.age}`);
          console.log(`   - BMI: ${clinicalData.bmi?.toFixed(1)}`);
          console.log(`   - Blood Pressure: ${clinicalData.bloodPressure?.systolic}/${clinicalData.bloodPressure?.diastolic}`);
          console.log(`   - Blood Sugar: ${clinicalData.bloodSugar}`);
          
          if (clinicalData.predictions && clinicalData.predictions.length > 0) {
            console.log(`\n   ✅ Predictions (${clinicalData.predictions.length}):`);
            clinicalData.predictions.forEach((p: any) => {
              console.log(`\n   ${p.disease}:`);
              console.log(`   - Risk Score: ${p.riskScore}%`);
              console.log(`   - Risk Level: ${p.riskLevel}`);
              console.log(`   - Timeframe: ${p.timeframe}`);
              console.log(`   - Predicted At: ${new Date(p.predictedAt).toLocaleString()}`);
              console.log(`   - Valid Until: ${new Date(p.validUntil).toLocaleString()}`);
              console.log(`   - Factors: ${p.factors?.length || 0}`);
              console.log(`   - Prevention Plan: ${p.preventionPlan?.length || 0} items`);
            });
          } else {
            console.log(`\n   ❌ NO PREDICTIONS FOUND`);
          }
        } else {
          console.log(`   ❌ No clinical data in secondaryHealthConcerns`);
        }
      } else {
        console.log(`   ❌ No health profile found`);
      }
    } else {
      console.log(`   ❌ User not found`);
    }

    // 3. Check if health-risk routes are registered
    console.log('\n\n3️⃣ Testing API endpoints...');
    console.log('   Run these curl commands to test:');
    console.log('');
    console.log('   # Get predictions (replace TOKEN and USER_ID):');
    console.log('   curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/health-risk/predictions/USER_ID');
    console.log('');
    console.log('   # Submit assessment:');
    console.log('   curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \\');
    console.log('        -d \'{"userId":"USER_ID","age":45,"gender":"Male","height":175,"weight":85}\' \\');
    console.log('        http://localhost:3001/api/health-risk/assess');

    // 4. Summary
    console.log('\n\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total health profiles: ${profiles.length}`);
    console.log(`Profiles with predictions: ${profiles.filter(p => {
      const data = p.secondaryHealthConcerns as any;
      return data?.predictions?.length > 0;
    }).length}`);
    
    if (navinUser) {
      const navinProfile = await prisma.patientHealthProfile.findUnique({
        where: { userId: navinUser.id }
      });
      const navinData = navinProfile?.secondaryHealthConcerns as any;
      console.log(`\nNavin's status:`);
      console.log(`- Has profile: ${!!navinProfile}`);
      console.log(`- Has clinical data: ${!!navinData}`);
      console.log(`- Has predictions: ${!!(navinData?.predictions?.length > 0)}`);
      console.log(`- Prediction count: ${navinData?.predictions?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugHealthRisk();
