import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncPortfolioScores() {
  console.log('🔄 Syncing portfolio scores for all doctors...\n');

  try {
    // Get all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      },
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

    console.log(`Found ${doctors.length} verified doctors\n`);

    for (const doctor of doctors) {
      const totalPosts = doctor.posts.length;
      const totalComments = doctor.comments.length;
      const totalAppointments = doctor.appointmentsAsDoctor.length;
      const completedAppointments = doctor.appointmentsAsDoctor.filter(a => a.status === 'COMPLETED').length;
      
      // Calculate treatment success rate
      const treatmentOutcomes = doctor.patientFeedbacks.map(f => f.status).filter(Boolean);
      const successfulTreatments = treatmentOutcomes.filter(o => o === 'CURED' || o === 'IMPROVED').length;
      const treatmentSuccessRate = treatmentOutcomes.length > 0 
        ? Math.round((successfulTreatments / treatmentOutcomes.length) * 100)
        : 0;

      // Calculate average rating
      const ratings = doctor.patientFeedbacks.map(f => f.rating).filter(Boolean);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
        : 0;

      // Calculate conversion rate (appointments / posts+comments)
      const conversionRate = (totalPosts + totalComments) > 0
        ? Math.round((totalAppointments / (totalPosts + totalComments)) * 100)
        : 0;

      // Calculate portfolio score (weighted average) - SAME FORMULA AS ADMIN DASHBOARD
      const portfolioScore = Math.round(
        (treatmentSuccessRate * 0.4) + // 40% weight on treatment success
        (avgRating * 20 * 0.3) + // 30% weight on rating (scaled to 100)
        (Math.min(conversionRate, 100) * 0.2) + // 20% weight on conversion
        (Math.min((totalPosts + totalComments) / 10, 10) * 0.1) // 10% weight on activity
      );

      // Count treatment outcomes
      const curedCount = treatmentOutcomes.filter(o => o === 'CURED').length;
      const improvedCount = treatmentOutcomes.filter(o => o === 'IMPROVED').length;
      const notYetCount = treatmentOutcomes.filter(o => o === 'NOT_YET').length;
      const consultNewCount = treatmentOutcomes.filter(o => o === 'CONSULT_NEW_DOCTOR').length;

      // Update or create DoctorPerformance record
      await prisma.doctorPerformance.upsert({
        where: { doctorId: doctor.id },
        create: {
          doctorId: doctor.id,
          portfolioScore,
          totalPatientsHelped: doctor.patientFeedbacks.length,
          curedPatientCount: curedCount,
          notYetCount,
          consultNewDoctorCount: consultNewCount,
          conversionCount: totalAppointments,
          clinicVisitCount: completedAppointments,
          postClinicCureCount: curedCount,
          helpfulnessScore: avgRating,
          totalRatings: ratings.length,
          appointmentsCompleted: completedAppointments,
          totalPostsCommented: totalPosts,
          totalCommentsCount: totalComments
        },
        update: {
          portfolioScore,
          totalPatientsHelped: doctor.patientFeedbacks.length,
          curedPatientCount: curedCount,
          notYetCount,
          consultNewDoctorCount: consultNewCount,
          conversionCount: totalAppointments,
          clinicVisitCount: completedAppointments,
          postClinicCureCount: curedCount,
          helpfulnessScore: avgRating,
          totalRatings: ratings.length,
          appointmentsCompleted: completedAppointments,
          totalPostsCommented: totalPosts,
          totalCommentsCount: totalComments
        }
      });

      console.log(`✅ ${doctor.username}`);
      console.log(`   Portfolio Score: ${portfolioScore}/100`);
      console.log(`   Treatment Success: ${treatmentSuccessRate}%`);
      console.log(`   Avg Rating: ${avgRating.toFixed(1)}/5.0`);
      console.log(`   Cured: ${curedCount}, Improved: ${improvedCount}`);
      console.log(`   Posts: ${totalPosts}, Comments: ${totalComments}`);
      console.log(`   Appointments: ${totalAppointments}\n`);
    }

    console.log('✅ Portfolio scores synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing portfolio scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncPortfolioScores();
