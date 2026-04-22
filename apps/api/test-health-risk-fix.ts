/**
 * Test Health Risk Assessment Fix
 * Tests the complete flow: save assessment → predict risks → retrieve predictions
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Test user credentials (use existing user from your system)
const TEST_USER = {
  email: 'admin@medthread.com',
  password: 'admin123'
};

async function testHealthRiskAssessment() {
  console.log('🧪 Testing Health Risk Assessment Fix...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Logged in as: ${loginResponse.data.user.username} (${userId})\n`);

    // Step 2: Submit health assessment
    console.log('2️⃣ Submitting health assessment...');
    const assessmentData = {
      userId,
      age: '58',
      gender: 'MALE',
      height: '175',
      weight: '95',
      waistCircumference: '105',
      bloodPressureSystolic: '145',
      bloodPressureDiastolic: '92',
      bloodSugar: '115',
      cholesterol: '240',
      hdlCholesterol: '38',
      ldlCholesterol: '160',
      triglycerides: '200',
      smokingStatus: 'FORMER',
      alcoholConsumption: 'MODERATE',
      activityLevel: 'SEDENTARY',
      familyHistory: ['diabetes', 'heart_disease'],
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

    console.log('✅ Assessment submitted successfully!');
    console.log(`📊 Predictions received: ${assessResponse.data.predictions.length}\n`);

    // Display predictions
    if (assessResponse.data.predictions && assessResponse.data.predictions.length > 0) {
      console.log('🎯 RISK PREDICTIONS:\n');
      assessResponse.data.predictions.forEach((pred: any) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Disease: ${pred.disease}`);
        console.log(`Risk Level: ${pred.riskLevel} (${pred.riskPercentage}%)`);
        console.log(`Risk Score: ${pred.riskScore}`);
        console.log(`Timeframe: ${pred.timeframe}`);
        console.log(`Algorithm: ${pred.algorithm}`);
        console.log(`Confidence: ${pred.confidence}%`);
        console.log(`\nTop Risk Factors:`);
        pred.factors.slice(0, 3).forEach((factor: any, idx: number) => {
          console.log(`  ${idx + 1}. ${factor.factor} (Impact: ${factor.impact})`);
        });
        console.log(`\nTop Prevention Steps:`);
        pred.preventionPlan.slice(0, 3).forEach((step: any, idx: number) => {
          console.log(`  ${idx + 1}. ${step.action}`);
          console.log(`     → ${step.expectedBenefit}`);
        });
        console.log('');
      });
    }

    // Step 3: Retrieve saved predictions
    console.log('3️⃣ Retrieving saved predictions...');
    const predictionsResponse = await axios.get(
      `${API_URL}/api/health-risk/predictions/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log(`✅ Retrieved ${predictionsResponse.data.predictions.length} saved predictions\n`);

    // Step 4: Get assessment data
    console.log('4️⃣ Retrieving assessment data...');
    const assessmentResponse = await axios.get(
      `${API_URL}/api/health-risk/assessment/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Assessment data retrieved successfully');
    console.log(`   Age Group: ${assessmentResponse.data.assessment.ageGroup}`);
    console.log(`   Biological Sex: ${assessmentResponse.data.assessment.biologicalSex}`);
    console.log(`   Smoking Status: ${assessmentResponse.data.assessment.smokingStatus}`);
    console.log(`   Activity Level: ${assessmentResponse.data.assessment.activityLevel}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL TESTS PASSED! Health Risk Assessment is working correctly!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ TEST FAILED!');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testHealthRiskAssessment();
