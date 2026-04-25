import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminDashboardFix() {
  console.log('🧪 Testing admin dashboard calculation with real data...\n');

  try {
    const rifa = await prisma.user.findFirst({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!rifa) {
      console.log('❌ Dr. Rifa not found');
      return;
    }

    // Simulate admin dashboard calculation (30 days period)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const doctor = await prisma.user.findUnique({
      where: { id: rifa.id },
      select: {
        id: true,
        username: true,
        specialty: true,
        posts: {
          where: { createdAt: { gte: startDate } },
          select: { id: true }
        },
        comments: {
          where: { createdAt: { gte: startDate } },
          select: { id: true }
        },
        appointmentsAsDoctor: {
          where: { createdAt: { gte: startDate } },
          select: { 
            id: true,
            status: true
          }
        },
        patientFeedbacks: {
          select: {
            rating: true,
            status: true
          }
        }
      }
    });

    if (!doctor) {
      console.log('❌ Doctor data not found');
      return;
    }

    const totalPosts = doctor.posts.length;
    const totalComments = doctor.comments.length;
    const totalAppointments = doctor.appointmentsAsDoctor.length;
    const completedAppointments = doctor.appointmentsAsDoctor.filter(a => a.status === 'COMPLETED').length;
    
    // Calculate treatment success rate
    const treatmentOutcomes = doctor.patientFeedbacks.map(f => f.status).filter(Boolean);
    const successfulTreatments = treatmentOutcomes.filter(o => o === 'CURED' || o === 'IMPROVED').length;
    const curedCount = treatmentOutcomes.filter(o => o === 'CURED').length;
    const treatmentSuccessRate = treatmentOutcomes.length > 0 
      ? Math.round((successfulTreatments / treatmentOutcomes.length) * 100)
      : 0;

    // Calculate average rating
    const ratings = doctor.patientFeedbacks.map(f => f.rating).filter(Boolean);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
      : 0;

    // Calculate conversion rate
    const conversionRate = (totalPosts + totalComments) > 0
      ? Math.round((totalAppointments / (totalPosts + totalComments)) * 100)
      : 0;

    // Calculate portfolio score
    const portfolioScore = Math.round(
      (treatmentSuccessRate * 0.4) + // 40% weight on treatment success
      (avgRating * 20 * 0.3) + // 30% weight on rating (scaled to 100)
      (Math.min(conversionRate, 100) * 0.2) + // 20% weight on conversion
      (Math.min((totalPosts + totalComments) / 10, 10) * 0.1) // 10% weight on activity
    );

    console.log('✅ ADMIN DASHBOARD CALCULATION (FIXED):');
    console.log(`   Portfolio Score: ${portfolioScore}/100`);
    console.log(`   Treatment Success Rate: ${treatmentSuccessRate}%`);
    console.log(`   Cure Rate (CURED only): ${Math.round((curedCount / treatmentOutcomes.length) * 100)}%`);
    console.log(`   Avg Rating: ${avgRating.toFixed(1)}/5.0`);
    console.log(`   Total Feedbacks: ${treatmentOutcomes.length}`);
    console.log(`   Cured: ${curedCount}, Improved: ${treatmentOutcomes.filter(o => o === 'IMPROVED').length}`);
    console.log(`   Posts: ${totalPosts}, Comments: ${totalComments}`);
    console.log(`   Appointments: ${totalAppointments}\n`);

    // Fetch from public API
    try {
      const response = await fetch(`http://localhost:3001/api/doctor-public-analytics/${rifa.id}/treatment-outcomes`);
      const apiData = await response.json();
      
      console.log('🌐 PUBLIC API RESPONSE:');
      console.log(`   KPI: ${apiData.kpi}`);
      console.log(`   Data:`, JSON.stringify(apiData.data, null, 2));
      console.log();

      // Compare
      console.log('📊 COMPARISON:');
      console.log(`   Admin Dashboard Cure Rate: ${Math.round((curedCount / treatmentOutcomes.length) * 100)}%`);
      const apiCureRate = parseInt(apiData.kpi.split('%')[0]);
      console.log(`   Public API Cure Rate: ${apiCureRate}%`);
      console.log(`   Match: ${Math.round((curedCount / treatmentOutcomes.length) * 100) === apiCureRate ? '✅ YES' : '❌ NO'}`);
    } catch (apiError: any) {
      console.log('❌ Failed to fetch from public API:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDashboardFix();
