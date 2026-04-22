/**
 * Complete Analytics Setup & Test
 * 
 * This script will:
 * 1. Seed symptom data into the database
 * 2. Test all analytics API endpoints
 * 3. Verify the analytics page will work
 * 
 * Run: npx tsx apps/api/complete-analytics-setup.ts
 */

import { PrismaClient } from '@medthread/database';
import axios from 'axios';

// Use a single Prisma instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const API_URL = 'http://localhost:3001';

const symptoms = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
  'Body Ache', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath',
  'Runny Nose', 'Sneezing', 'Loss of Taste', 'Loss of Smell', 'Muscle Pain'
];

const regions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Thane'
];

async function seedSymptomData() {
  console.log('\n📊 Step 1: Seeding Symptom Data...');
  
  try {
    // Get users
    const users = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 100
    });

    if (users.length === 0) {
      console.log('⚠️  No users found. Creating sample users...');
      
      // Create 10 sample users
      for (let i = 1; i <= 10; i++) {
        await prisma.user.create({
          data: {
            username: `patient${i}`,
            email: `patient${i}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'PATIENT'
          }
        });
      }
      
      const newUsers = await prisma.user.findMany({
        where: { role: 'PATIENT' }
      });
      users.push(...newUsers);
    }

    console.log(`✅ Found ${users.length} users`);

    // Create symptom reports for the last 30 days
    const reports = [];
    const now = new Date();

    for (let day = 0; day < 30; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Create 30-80 reports per day (more recent days have more reports)
      const reportsPerDay = Math.floor(Math.random() * 50) + 30 + (30 - day);

      for (let i = 0; i < reportsPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
        const city = regions[Math.floor(Math.random() * regions.length)];
        const severity = ['MILD', 'MODERATE', 'SEVERE'][Math.floor(Math.random() * 3)];

        reports.push({
          userId: user.id,
          symptoms: [{ name: symptom, severity }], // symptoms is JSON array
          severity,
          city,
          state: 'Maharashtra', // Default state
          country: 'India',
          reportedAt: date,
          metadata: {
            source: 'web',
            userAgent: 'Mozilla/5.0',
            day: day
          }
        });
      }
    }

    console.log(`📝 Creating ${reports.length} symptom reports...`);
    
    // Delete old reports first
    await prisma.symptomReport.deleteMany({});
    
    // Insert new reports in batches
    const batchSize = 500;
    for (let i = 0; i < reports.length; i += batchSize) {
      const batch = reports.slice(i, i + batchSize);
      await prisma.symptomReport.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`   Inserted ${Math.min(i + batchSize, reports.length)}/${reports.length} reports`);
    }

    console.log('✅ Symptom data seeded successfully!');
    
    // Now seed geographic health data
    await seedGeographicHealthData();
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    return false;
  }
}

async function seedGeographicHealthData() {
  console.log('\n📍 Seeding Geographic Health Data...');
  
  try {
    // Delete old geographic data
    await prisma.geographicHealthData.deleteMany({});
    
    // Aggregate symptom reports by city
    const reports = await prisma.symptomReport.findMany({
      where: {
        reportedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    
    // Group by city
    const cityData: Record<string, any> = {};
    
    reports.forEach(report => {
      const city = report.city || 'Unknown';
      if (!cityData[city]) {
        cityData[city] = {
          region: city,
          symptoms: {},
          totalReports: 0
        };
      }
      
      cityData[city].totalReports++;
      
      const symptoms = report.symptoms as Array<{ name: string; severity: string }>;
      symptoms.forEach(s => {
        if (!cityData[city].symptoms[s.name]) {
          cityData[city].symptoms[s.name] = 0;
        }
        cityData[city].symptoms[s.name]++;
      });
    });
    
    // Create geographic health data entries
    for (const [city, data] of Object.entries(cityData)) {
      const topSymptoms = Object.entries(data.symptoms)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);
      
      const alertLevel = data.totalReports > 100 ? 'CRITICAL' : 
                        data.totalReports > 50 ? 'HIGH' : 
                        data.totalReports > 20 ? 'MODERATE' : 'LOW';
      
      await prisma.geographicHealthData.create({
        data: {
          region: city,
          topSymptoms,
          totalReports: data.totalReports,
          alertLevel,
          calculatedAt: new Date(),
          metadata: {}
        }
      });
    }
    
    console.log(`✅ Created geographic data for ${Object.keys(cityData).length} cities`);
  } catch (error) {
    console.error('❌ Error seeding geographic data:', error);
  }
}

async function testAnalyticsEndpoints() {
  console.log('\n🧪 Step 2: Testing Analytics API Endpoints...\n');

  const tests = [
    {
      name: 'Trending Symptoms',
      url: `${API_URL}/api/health-analytics/trending?timeWindow=daily&limit=10`,
      method: 'GET'
    },
    {
      name: 'Geographic Alerts',
      url: `${API_URL}/api/health-analytics/geographic-alerts`,
      method: 'GET'
    },
    {
      name: 'Top Health Issues',
      url: `${API_URL}/api/health-analytics/top-issues?limit=5`,
      method: 'GET'
    },
    {
      name: 'Symptom Patterns',
      url: `${API_URL}/api/health-analytics/patterns?symptom=Fever`,
      method: 'GET'
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await axios.get(test.url, { timeout: 5000 });
      
      if (response.data && response.data.success) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Data count: ${response.data.data?.length || 'N/A'}`);
        passedTests++;
      } else {
        console.log(`⚠️  ${test.name}: No data returned`);
        failedTests++;
      }
    } catch (error: any) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
      failedTests++;
    }
  }

  console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
  return failedTests === 0;
}

async function verifyDatabaseData() {
  console.log('\n🔍 Step 3: Verifying Database Data...\n');

  try {
    const reportCount = await prisma.symptomReport.count();
    console.log(`✅ Total symptom reports: ${reportCount}`);

    const recentReports = await prisma.symptomReport.count({
      where: {
        reportedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    console.log(`✅ Reports in last 24 hours: ${recentReports}`);

    const symptomBreakdown = await prisma.symptomReport.groupBy({
      by: ['city'],
      _count: true,
      orderBy: {
        _count: {
          city: 'desc'
        }
      },
      take: 5
    });

    console.log('\n📈 Top 5 Cities with Reports:');
    symptomBreakdown.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.city}: ${item._count} reports`);
    });

    return reportCount > 0;
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Complete Analytics Setup...\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Seed data
    const seedSuccess = await seedSymptomData();
    if (!seedSuccess) {
      console.log('\n❌ Setup failed at seeding step');
      process.exit(1);
    }

    // Step 2: Verify database
    const verifySuccess = await verifyDatabaseData();
    if (!verifySuccess) {
      console.log('\n❌ Setup failed at verification step');
      process.exit(1);
    }

    // Step 3: Test endpoints
    console.log('\n⏳ Waiting 2 seconds for API to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testSuccess = await testAnalyticsEndpoints();

    console.log('\n' + '='.repeat(60));
    
    if (testSuccess) {
      console.log('\n✅ SETUP COMPLETE! Analytics page is ready to use.');
      console.log('\n📍 Visit: http://localhost:3000/analytics');
      console.log('\n💡 The page will now show real-time data from your database!');
    } else {
      console.log('\n⚠️  Setup completed with warnings.');
      console.log('   Data is seeded but some API endpoints may need debugging.');
      console.log('   Check if the API server is running on port 3001');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
