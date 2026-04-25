import { prisma } from '@medthread/database';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testHealthRiskSave() {
  console.log('🧪 Testing Health Risk Assessment Data Persistence\n');

  try {
    // Step 1: Login as a patient
    console.log('1️⃣ Logging in as patient (Ariana)...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'ariana@gmail.com',
      password: 'ariana123'
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Logged in successfully. User ID: ${userId}\n`);

    // Step 2: Check existing data before submission
    console.log('2️⃣ Checking existing health assessment data...');
    const existingProfile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });
    console.log('Existing profile:', existingProfile ? 'Found' : 'Not found');
    if (existingProfile) {
      console.log('Last updated:', existingProfile.lastUpdatedAt);
      console.log('Clinical data:', existingProfile.secondaryHealthConcerns);
    }
    console.log('');

    // Step 3: Submit health assessment
    console.log('3️⃣ Submitting health assessment...');
    const assessmentData = {
      userId,
      age: 28,
      gender: 'Male',
      height: 175,
      weight: 75,
      waistCircumference: 85,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      bloodSugar: 95,
      cholesterol: 180,
      hdlCholesterol: 50,
      ldlCholesterol: 110,
      triglycerides: 150,
      smokingStatus: 'Never',
      alcoholConsumption: 'Moderate',
      activityLevel: 'Moderate',
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
    console.log('Response:', assessResponse.data.message);
    console.log('Predictions count:', assessResponse.data.predictions?.length || 0);
    console.log('');

    // Step 4: Check database immediately after submission
    console.log('4️⃣ Checking database immediately after submission...');
    const updatedProfile = await prisma.patientHealthProfile.findUnique({
      where: { userId }
    });

    if (updatedProfile) {
      console.log('✅ Profile found in database!');
      console.log('Last updated:', updatedProfile.lastUpdatedAt);
      console.log('Age group:', updatedProfile.ageGroup);
      console.log('Biological sex:', updatedProfile.biologicalSex);
      console.log('Smoking status:', updatedProfile.smokingStatus);
      console.log('Activity level:', updatedProfile.activityLevel);
      console.log('Clinical data stored:', updatedProfile.secondaryHealthConcerns ? 'Yes' : 'No');
      if (updatedProfile.secondaryHealthConcerns) {
        console.log('Clinical data:', JSON.stringify(updatedProfile.secondaryHealthConcerns, null, 2));
      }
    } else {
      console.log('❌ Profile NOT found in database!');
    }
    console.log('');

    // Step 5: Retrieve via API
    console.log('5️⃣ Retrieving assessment via API...');
    const getResponse = await axios.get(
      `${API_URL}/api/health-risk/assessment/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (getResponse.data.assessment) {
      console.log('✅ Assessment retrieved via API!');
      console.log('Assessment data:', JSON.stringify(getResponse.data.assessment, null, 2));
    } else {
      console.log('❌ No assessment data returned from API');
    }
    console.log('');

    // Step 6: Check risk predictions
    console.log('6️⃣ Checking risk predictions...');
    const predictions = await prisma.healthRiskPrediction.findMany({
      where: { userId },
      orderBy: { predictedAt: 'desc' },
      take: 5
    });

    console.log(`Found ${predictions.length} risk predictions`);
    predictions.forEach((pred, idx) => {
      console.log(`\nPrediction ${idx + 1}:`);
      console.log(`  Risk Type: ${pred.riskType}`);
      console.log(`  Risk Score: ${pred.riskScore}%`);
      console.log(`  Timeframe: ${pred.timeframe}`);
      console.log(`  Predicted at: ${pred.predictedAt}`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Health profile: ${updatedProfile ? 'SAVED ✅' : 'NOT SAVED ❌'}`);
    console.log(`- Risk predictions: ${predictions.length} saved`);
    console.log(`- API retrieval: ${getResponse.data.assessment ? 'WORKING ✅' : 'NOT WORKING ❌'}`);

  } catch (error: any) {
    console.error('\n❌ Error during test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testHealthRiskSave();
