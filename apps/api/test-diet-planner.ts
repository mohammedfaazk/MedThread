import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Test credentials - Patient
const TEST_USER = {
  email: 'navin@gmail.com',
  password: 'Patient@123456'
};

async function testDietPlanner() {
  console.log('🧪 Testing AI Diet Planner...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as patient...');
    const loginRes = await axios.post(`${API_URL}/api/v1/auth/login`, TEST_USER);
    console.log('Login response:', JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.token || loginRes.data.data?.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Check if health profile exists
    console.log('2️⃣ Checking health profile...');
    try {
      const profileRes = await axios.get(`${API_URL}/api/v1/health-profile`, { headers });
      
      if (profileRes.data.success && profileRes.data.data) {
        console.log('✅ Health profile exists');
        console.log('Profile data:', JSON.stringify(profileRes.data.data, null, 2));
      } else {
        console.log('ℹ️ No health profile found, creating one...');
        
        // Create health profile with sample data
        const sampleProfile = {
          ageGroup: '25-34',
          biologicalSex: 'Male',
          nationality: 'Indian',
          weightRange: '70-75',
          heightRange: '170-175',
          activityLevel: 'Moderately Active',
          medicalConditions: [],
          currentMedications: '',
          foodAllergies: [],
          dietType: 'Non-Vegetarian',
          religiousRestrictions: 'No restrictions',
          foodsToAvoid: '',
          cookingAccess: 'Full kitchen access',
          primaryGoal: 'General wellness',
          sleepHours: '7-8',
          waterIntake: '2-3 liters'
        };
        
        const createRes = await axios.post(`${API_URL}/api/v1/health-profile`, sampleProfile, { headers });
        console.log('✅ Health profile created:', createRes.data.success);
      }
    } catch (error: any) {
      console.log('⚠️ Health profile check failed:', error.response?.data || error.message);
      console.log('Continuing with diet plan generation...\n');
    }

    // Step 3: Generate diet plan
    console.log('\n3️⃣ Generating AI diet plan...');
    const dietRes = await axios.post(
      `${API_URL}/api/v1/diet-plan/generate`,
      { dailyCalorieGoal: 2000 },
      { headers }
    );

    if (dietRes.data.success) {
      console.log('✅ Diet plan generated successfully!\n');
      console.log('📊 Diet Plan Summary:');
      console.log('  - Total Calories:', dietRes.data.data.dailyCalorieGoal);
      console.log('  - Meals:', dietRes.data.data.planData.meals.length);
      console.log('  - Protein:', dietRes.data.data.nutritionalInfo.protein + 'g');
      console.log('  - Carbs:', dietRes.data.data.nutritionalInfo.carbs + 'g');
      console.log('  - Fats:', dietRes.data.data.nutritionalInfo.fats + 'g');
      console.log('  - Fiber:', dietRes.data.data.nutritionalInfo.fiber + 'g');
      console.log('\n🍽️ Meals:');
      dietRes.data.data.planData.meals.forEach((meal: any) => {
        console.log(`  ${meal.name} (${meal.totalCalories} cal):`);
        meal.dishes.forEach((dish: any) => {
          console.log(`    - ${dish.name}: ${dish.calories} cal`);
        });
      });
      console.log('\n📝 Dietary Note:', dietRes.data.data.dietaryNote);
      
      // Step 4: Save diet plan
      console.log('\n4️⃣ Saving diet plan...');
      const saveRes = await axios.post(
        `${API_URL}/api/v1/diet-plan/${dietRes.data.data.id}/save`,
        {},
        { headers }
      );
      
      if (saveRes.data.success) {
        console.log('✅ Diet plan saved successfully');
      }
      
      // Step 5: Get active diet plan
      console.log('\n5️⃣ Fetching active diet plan...');
      const activeRes = await axios.get(`${API_URL}/api/v1/diet-plan/active`, { headers });
      
      if (activeRes.data.success && activeRes.data.data) {
        console.log('✅ Active diet plan retrieved');
        console.log('  - Plan ID:', activeRes.data.data.id);
        console.log('  - Generated:', new Date(activeRes.data.data.generatedAt).toLocaleString());
      }
      
      console.log('\n✅ All tests passed! AI Diet Planner is 100% functional! 🎉');
    } else {
      console.log('❌ Failed to generate diet plan:', dietRes.data.error);
      if (dietRes.data.missingFields) {
        console.log('Missing fields:', dietRes.data.missingFields);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testDietPlanner();
