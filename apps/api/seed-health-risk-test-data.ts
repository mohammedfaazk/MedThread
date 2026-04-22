/**
 * Seed Health Risk Test Data
 * This creates test predictions so you can see the feature working immediately
 */

import { prisma } from '@medthread/database';

async function seedHealthRiskData() {
  console.log('🌱 Seeding Health Risk Test Data\n');

  try {
    // Find Navin user
    const user = await prisma.user.findUnique({
      where: { email: 'navin@gmail.com' }
    });

    if (!user) {
      console.error('❌ User navin@gmail.com not found');
      console.log('   Create the user first or change the email in this script');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.id})`);

    // Create or update health profile with test data
    const testClinicalData = {
      age: 45,
      gender: 'Male',
      height: 175,
      weight: 85,
      bmi: 27.8,
      waistCircumference: 95,
      bloodPressure: {
        systolic: 135,
        diastolic: 85
      },
      bloodSugar: 105,
      cholesterol: 220,
      hdlCholesterol: 45,
      ldlCholesterol: 140,
      triglycerides: 180,
      assessmentDate: new Date().toISOString(),
      predictions: [
        {
          disease: 'Type 2 Diabetes',
          riskScore: 17,
          riskPercentage: 17,
          riskLevel: 'MODERATE',
          timeframe: '10_YEAR_RISK',
          factors: [
            { factor: 'Age 45 (45-54 years)', impact: 2, modifiable: false },
            { factor: 'BMI 27.8 (Overweight)', impact: 1, modifiable: true },
            { factor: 'Waist circumference 95cm (94-102cm for men)', impact: 3, modifiable: true },
            { factor: 'Elevated fasting glucose 105 mg/dL (prediabetes)', impact: 5, modifiable: true },
            { factor: 'Family history of Type 2 Diabetes', impact: 5, modifiable: false }
          ],
          preventionPlan: [
            {
              action: 'Weight loss: Lose 5-7% of body weight (proven to reduce diabetes risk by 58%)',
              priority: 'HIGH',
              expectedImpact: 'Reduces risk by 58%'
            },
            {
              action: 'Physical activity: 150 minutes/week of moderate exercise',
              priority: 'HIGH',
              expectedImpact: 'Reduces risk by 40-50%'
            },
            {
              action: 'Dietary changes: Low glycemic index diet, reduce refined carbs',
              priority: 'HIGH',
              expectedImpact: 'Improves glucose control'
            }
          ],
          confidence: 0.85,
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          disease: 'Cardiovascular Disease',
          riskScore: 12,
          riskPercentage: 12,
          riskLevel: 'MODERATE',
          timeframe: '10_YEAR_RISK',
          factors: [
            { factor: 'Age 45 (Male)', impact: 3, modifiable: false },
            { factor: 'Total cholesterol 220 mg/dL', impact: 7, modifiable: true },
            { factor: 'HDL cholesterol 45 mg/dL', impact: 1, modifiable: true },
            { factor: 'Blood pressure 135/85 mmHg', impact: 2, modifiable: true }
          ],
          preventionPlan: [
            {
              action: 'Blood pressure control: Target <130/80 mmHg through DASH diet and exercise',
              priority: 'HIGH',
              expectedImpact: 'Each 10 mmHg reduction lowers CVD risk by 20%'
            },
            {
              action: 'Cholesterol management: Consider statin therapy if LDL >190',
              priority: 'HIGH',
              expectedImpact: 'Reduces CVD events by 25-30%'
            },
            {
              action: 'Mediterranean diet: Emphasize olive oil, nuts, fish, vegetables',
              priority: 'MEDIUM',
              expectedImpact: 'Reduces CVD events by 30%'
            }
          ],
          confidence: 0.82,
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          disease: 'Hypertension',
          riskScore: 35,
          riskPercentage: 35,
          riskLevel: 'HIGH',
          timeframe: '6_MONTHS',
          factors: [
            { factor: 'Prehypertension (135/85)', impact: 30, modifiable: true },
            { factor: 'Overweight (BMI 27.8)', impact: 20, modifiable: true },
            { factor: 'Age 45', impact: 15, modifiable: false }
          ],
          preventionPlan: [
            {
              action: 'Reduce sodium intake to <2300mg per day',
              priority: 'HIGH',
              expectedImpact: 'Lowers BP by 5-6 mmHg'
            },
            {
              action: 'DASH diet (fruits, vegetables, whole grains)',
              priority: 'HIGH',
              expectedImpact: 'Lowers BP by 8-14 mmHg'
            },
            {
              action: 'Regular aerobic exercise (30 min, 5 days/week)',
              priority: 'HIGH',
              expectedImpact: 'Lowers BP by 5-8 mmHg'
            }
          ],
          confidence: 0.75,
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          disease: 'Stroke',
          riskScore: 8,
          riskPercentage: 8,
          riskLevel: 'LOW',
          timeframe: '10_YEAR_RISK',
          factors: [
            { factor: 'Systolic BP 135 mmHg', impact: 3, modifiable: true },
            { factor: 'Age 45', impact: 0, modifiable: false }
          ],
          preventionPlan: [
            {
              action: 'Aggressive BP control: Target <120/80 mmHg',
              priority: 'HIGH',
              expectedImpact: 'Reduces stroke risk by 30-40%'
            },
            {
              action: 'Lifestyle: Mediterranean diet, regular exercise',
              priority: 'MEDIUM',
              expectedImpact: 'Reduces stroke risk by 20-30%'
            }
          ],
          confidence: 0.80,
          predictedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };

    // Upsert the health profile
    const profile = await prisma.patientHealthProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ageGroup: '36-45',
        biologicalSex: 'Male',
        smokingStatus: 'Never',
        alcoholConsumption: 'Moderate',
        activityLevel: 'Light',
        preExistingConditions: ['Diabetes', 'Heart Disease'],
        currentMedications: [],
        secondaryHealthConcerns: testClinicalData,
        completedAt: new Date(),
        lastUpdatedAt: new Date()
      },
      update: {
        ageGroup: '36-45',
        biologicalSex: 'Male',
        smokingStatus: 'Never',
        alcoholConsumption: 'Moderate',
        activityLevel: 'Light',
        preExistingConditions: ['Diabetes', 'Heart Disease'],
        secondaryHealthConcerns: testClinicalData,
        lastUpdatedAt: new Date()
      }
    });

    console.log('\n✅ Health profile created/updated successfully!');
    console.log(`   User ID: ${profile.userId}`);
    console.log(`   Age Group: ${profile.ageGroup}`);
    console.log(`   Predictions: ${testClinicalData.predictions.length}`);
    
    console.log('\n📊 Predictions seeded:');
    testClinicalData.predictions.forEach(p => {
      console.log(`   - ${p.disease}: ${p.riskScore}% (${p.riskLevel})`);
    });

    console.log('\n🎉 SUCCESS! Now you can:');
    console.log('   1. Login as navin@gmail.com');
    console.log('   2. Go to Health Risk Assessment page');
    console.log('   3. See your risk predictions with graphs!');
    console.log('');
    console.log('   The data will persist even after server restart.');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedHealthRiskData();
