import axios from 'axios';
import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testAnalyticsEndpoints() {
  console.log('🔍 Testing Doctor Analytics Endpoints\n');

  // Find the doctor
  const doctor = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'dr.rifa.hassan' },
        { username: 'dr_rifa_hassan' },
        { email: { contains: 'rifa' } }
      ]
    }
  });

  if (!doctor) {
    console.error('❌ Doctor not found!');
    return;
  }

  console.log(`✅ Found doctor: ${doctor.username} (ID: ${doctor.id})\n`);

  const endpoints = [
    'treatment-outcomes',
    'posts-over-time',
    'comments-over-time',
    'conversion-rate',
    'patients-cured',
    'clinic-visits',
    'portfolio-score'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📊 Testing: ${endpoint}`);
      const url = `${API_URL}/api/doctor-public-analytics/${doctor.id}/${endpoint}`;
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        console.log(`   ✅ Success`);
        console.log(`   KPI: ${response.data.kpi}`);
        console.log(`   Data points: ${response.data.data?.length || 0}`);
        if (response.data.data?.length > 0) {
          console.log(`   Sample: ${JSON.stringify(response.data.data[0])}`);
        }
      } else {
        console.log(`   ⚠️  No success flag`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('');
  }

  // Check database directly
  console.log('\n📊 Checking Database Directly:\n');
  
  try {
    const feedbackCount = await prisma.patientFeedback.count({
      where: { doctorId: doctor.id }
    });
    console.log(`   PatientFeedback records: ${feedbackCount}`);
  } catch (e) {
    console.log(`   PatientFeedback: Table may not exist`);
  }

  try {
    const postsCount = await prisma.post.count({
      where: { authorId: doctor.id }
    });
    console.log(`   Posts: ${postsCount}`);
  } catch (e) {
    console.log(`   Posts: Error counting`);
  }

  try {
    const commentsCount = await prisma.comment.count({
      where: { authorId: doctor.id }
    });
    console.log(`   Comments: ${commentsCount}`);
  } catch (e) {
    console.log(`   Comments: Error counting`);
  }

  try {
    const conversionsCount = await prisma.commentConversion.count({
      where: { doctorId: doctor.id }
    });
    console.log(`   Conversions: ${conversionsCount}`);
  } catch (e) {
    console.log(`   Conversions: Table may not exist`);
  }

  try {
    const performance = await prisma.doctorPerformance.findUnique({
      where: { doctorId: doctor.id }
    });
    console.log(`   Portfolio Score: ${performance?.portfolioScore || 'Not found'}`);
  } catch (e) {
    console.log(`   DoctorPerformance: Table may not exist`);
  }
}

testAnalyticsEndpoints()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
