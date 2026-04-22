/**
 * Test Health Risk Assessment Data Persistence
 * This script verifies that health risk data is being saved and retrieved correctly
 */

import { prisma } from '@medthread/database';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testHealthRiskPersistence() {
  console.log('🧪 Testing Health Risk Assessment Data Persistence\n');

  try {
    // Step 1: Login as a test user
    console.log('1️⃣ Logging in as test user...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'navin@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Logged in as user: ${userId}\n`);

    // Step 2: Check if user has existing health profile
    console.log('2️⃣ Checking existing health profile...');
    const existingProfile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      console.log('✅ Found existing health profile');
      console.log('   Clinical Data:', JSON.stringify(existingProfile.secondaryHealthConcerns, null, 2));
      
      const clinicalData = existingProfile.secondaryHealthConcerns as any;
      if (clinicalData?.predictions) {
        console.log(`   Existing Predictions: ${clinicalData.predictions.length}`);
        clinicalData.predictions.forEach((p: any) => {
          console.log(`   - ${p.disease}: ${p.riskScore}% (${p.riskLevel})`);
        });
      }
    } else {
      console.log('⚠️  No existing health profile found');
    }
    console.log('');

    // Step 3: Submit a health assessment
    console.log('3️⃣ Submitting health assessment...');
    const assessmentData = {
      userId,
      age: 45,
      gender: 'Male',
      height: 175,
      weight: 85,
      waistCircumference: 95,
      bloodPressureSystolic: 135,
      bloodPressureDiastolic: 85,
      bloodSugar: 105,
      cholesterol: 220,
      hdlCholesterol: 45,
      ldlCholesterol: 140,
      triglycerides: 180,
      smokingStatus: 'Former',
      alcoholConsumption: 'Moderate',
      activityLevel: 'Light',
      familyHistory: ['Diabetes', 'Heart Disease'],
      currentConditions: [],
      medications: [],
      gestationalDiabetes: false,
      hypertensionMedication: false
    };

    const assessResponse = await axios.post(
      `${API_URL}/api/health-risk/assess`,
      assessmentData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Assessment submitted successfully');
    console.log(`   Predictions generated: ${assessResponse.data.predictions.length}`);
    assessResponse.data.predictions.forEach((p: any) => {
      console.log(`   - ${p.riskType}: ${p.riskScore}% (${p.timeframe})`);
    });
    console.log('');

    // Step 4: Verify data was saved to database
    console.log('4️⃣ Verifying data persistence in database...');
    const updatedProfile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });

    if (!updatedProfile) {
      console.error('❌ Profile not found after assessment!');
      return;
    }

    const clinicalData = updatedProfile.secondaryHealthConcerns as any;
    
    console.log('✅ Profile found in database');
    console.log(`   Age: ${clinicalData.age}`);
    console.log(`   BMI: ${clinicalData.bmi?.toFixed(1)}`);
    console.log(`   Blood Pressure: ${clinicalData.bloodPressure?.systolic}/${clinicalData.bloodPressure?.diastolic}`);
    console.log(`   Blood Sugar: ${clinicalData.bloodSugar}`);
    console.log(`   Cholesterol: ${clinicalData.cholesterol}`);
    
    if (clinicalData.predictions && clinicalData.predictions.length > 0) {
      console.log(`\n   ✅ Predictions saved: ${clinicalData.predictions.length}`);
      clinicalData.predictions.forEach((p: any) => {
        console.log(`   - ${p.disease}: ${p.riskScore}% (${p.riskLevel})`);
        console.log(`     Valid until: ${new Date(p.validUntil).toLocaleDateString()}`);
      });
    } else {
      console.error('   ❌ No predictions found in database!');
    }
    console.log('');

    // Step 5: Retrieve predictions via API
    console.log('5️⃣ Retrieving predictions via API...');
    const predictionsResponse = await axios.get(
      `${API_URL}/api/health-risk/predictions/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Predictions retrieved via API');
    console.log(`   Count: ${predictionsResponse.data.predictions.length}`);
    predictionsResponse.data.predictions.forEach((p: any) => {
      console.log(`   - ${p.disease}: ${p.riskPercentage}% (${p.riskLevel})`);
    });
    console.log('');

    // Step 6: Simulate server restart by checking if data persists
    console.log('6️⃣ Simulating server restart - checking data persistence...');
    const afterRestartProfile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });

    if (!afterRestartProfile) {
      console.error('❌ Profile lost after restart simulation!');
      return;
    }

    const afterRestartData = afterRestartProfile.secondaryHealthConcerns as any;
    if (afterRestartData?.predictions && afterRestartData.predictions.length > 0) {
      console.log('✅ Data persisted successfully!');
      console.log(`   Predictions still available: ${afterRestartData.predictions.length}`);
    } else {
      console.error('❌ Predictions lost after restart!');
    }
    console.log('');

    // Summary
    console.log('📊 PERSISTENCE TEST SUMMARY:');
    console.log('================================');
    console.log(`✅ Assessment submission: Working`);
    console.log(`✅ Database storage: ${clinicalData?.predictions?.length > 0 ? 'Working' : 'FAILED'}`);
    console.log(`✅ API retrieval: ${predictionsResponse.data.predictions.length > 0 ? 'Working' : 'FAILED'}`);
    console.log(`✅ Data persistence: ${afterRestartData?.predictions?.length > 0 ? 'Working' : 'FAILED'}`);
    console.log('');

    if (clinicalData?.predictions?.length > 0 && 
        predictionsResponse.data.predictions.length > 0 && 
        afterRestartData?.predictions?.length > 0) {
      console.log('🎉 ALL TESTS PASSED! Data is persisting correctly.');
    } else {
      console.log('⚠️  SOME TESTS FAILED! Check the logs above.');
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

testHealthRiskPersistence();
