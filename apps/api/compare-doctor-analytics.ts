import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function compareDoctorAnalytics() {
  console.log('🔍 Comparing doctor analytics between admin dashboard and public profile...\n');

  try {
    // Get Dr. Rifa's ID
    const rifa = await prisma.user.findFirst({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!rifa) {
      console.log('❌ Dr. Rifa not found');
      return;
    }

    console.log(`Found Dr. Rifa: ${rifa.id}\n`);

    // 1. Get data from admin dashboard calculation (same as admin-analytics route)
    const doctor = await prisma.user.findUnique({
      where: { id: rifa.id },
      select: {
        id: true,
        username: true,
        specialty: true,
        posts: {
          select: { id: true }
        },
        comments: {
          select: { id: true }
        },
        appointmentsAsDoctor: {
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
    const cureRate = treatmentOutcomes.length > 0 
      ? Math.round((curedCount / treatmentOutcomes.length) * 100)
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

    console.log('📊 ADMIN DASHBOARD CALCULATION:');
    console.log(`   Portfolio Score: ${portfolioScore}/100`);
    console.log(`   Treatment Success Rate: ${treatmentSuccessRate}%`);
    console.log(`   Cure Rate (CURED only): ${cureRate}%`);
    console.log(`   Avg Rating: ${avgRating.toFixed(1)}/5.0`);
    console.log(`   Total Feedbacks: ${treatmentOutcomes.length}`);
    console.log(`   Cured: ${curedCount}`);
    console.log(`   Successful (Cured + Improved): ${successfulTreatments}`);
    console.log(`   Posts: ${totalPosts}, Comments: ${totalComments}`);
    console.log(`   Appointments: ${totalAppointments}\n`);

    // 2. Get data from public API endpoint
    try {
      const response = await axios.get(`http://localhost:3001/api/doctor-public-analytics/${rifa.id}/treatment-outcomes`);
      const apiData = response.data;
      
      console.log('🌐 PUBLIC API RESPONSE:');
      console.log(`   KPI: ${apiData.kpi}`);
      console.log(`   Data:`, JSON.stringify(apiData.data, null, 2));
      console.log();
    } catch (apiError: any) {
      console.log('❌ Failed to fetch from public API:', apiError.message);
    }

    // 3. Get data from DoctorPerformance table
    const performance = await prisma.doctorPerformance.findUnique({
      where: { doctorId: rifa.id }
    });

    if (performance) {
      console.log('💾 DOCTOR PERFORMANCE TABLE:');
      console.log(`   Portfolio Score: ${performance.portfolioScore}/100`);
      console.log(`   Cured Count: ${performance.curedPatientCount}`);
      console.log(`   Total Patients Helped: ${performance.totalPatientsHelped}`);
      console.log(`   Helpfulness Score: ${performance.helpfulnessScore}`);
      console.log(`   Conversion Count: ${performance.conversionCount}`);
      console.log();
    } else {
      console.log('❌ No DoctorPerformance record found\n');
    }

    // 4. Show breakdown of patient feedbacks
    console.log('📋 PATIENT FEEDBACK BREAKDOWN:');
    const statusCounts: Record<string, number> = {};
    treatmentOutcomes.forEach(status => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareDoctorAnalytics();
