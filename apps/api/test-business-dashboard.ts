/**
 * Test script for Doctor Business Dashboard
 * Tests analytics, revenue tracking, and promotion features
 */

import { PrismaClient } from '@medthread/database';
import { doctorBusinessService } from './src/services/doctor-business.service';

const prisma = new PrismaClient();

async function testBusinessDashboard() {
  console.log('🧪 Testing Doctor Business Dashboard...\n');

  try {
    // 1. Find a test doctor
    console.log('1️⃣ Finding test doctor...');
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT u.id, u.username, u.specialty
      FROM "User" u
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
      LIMIT 1
    `;

    if (doctors.length === 0) {
      console.log('❌ No doctors found. Please create a doctor user first.');
      return;
    }

    const doctor = doctors[0];
    console.log(`✅ Found doctor: ${doctor.username} (${doctor.specialty})`);
    console.log(`   Doctor ID: ${doctor.id}\n`);

    // 2. Update daily analytics
    console.log('2️⃣ Updating daily analytics...');
    await doctorBusinessService.updateDailyAnalytics(doctor.id);
    console.log('✅ Analytics updated\n');

    // 3. Get business analytics
    console.log('3️⃣ Fetching business analytics...');
    const analytics = await doctorBusinessService.getDoctorAnalytics(doctor.id, {
      period: 'month'
    });
    console.log(`✅ Analytics retrieved:`);
    console.log(`   Profile Views: ${analytics.totals.profileViews}`);
    console.log(`   Consultation Requests: ${analytics.totals.consultationRequests}`);
    console.log(`   Consultations Completed: ${analytics.totals.consultationsCompleted}`);
    console.log(`   Conversion Rate: ${analytics.averages.conversionRate.toFixed(2)}%`);
    console.log(`   Revenue: $${analytics.totals.revenue.toFixed(2)}`);
    console.log(`   Net Revenue: $${analytics.totals.netRevenue.toFixed(2)}`);
    console.log(`   Rating Trend: ${analytics.ratingTrend.trend} (${analytics.ratingTrend.change})\n`);

    // 4. Get revenue breakdown
    console.log('4️⃣ Fetching revenue breakdown...');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    const revenue = await doctorBusinessService.getRevenueBreakdown(doctor.id, startDate, endDate);
    console.log(`✅ Revenue breakdown:`);
    console.log(`   Total: $${revenue.total.toFixed(2)}`);
    revenue.breakdown.forEach((item: any) => {
      console.log(`   ${item.type}: $${item.net.toFixed(2)} (${item.percentage}%)`);
    });
    console.log();

    // 5. Get patient retention
    console.log('5️⃣ Fetching patient retention...');
    const retention = await doctorBusinessService.getPatientRetention(doctor.id);
    console.log(`✅ Patient retention:`);
    console.log(`   Total Patients: ${retention.totalPatients}`);
    retention.breakdown.forEach((item: any) => {
      console.log(`   ${item.status}: ${item.count} (${item.percentage}%)`);
    });
    console.log();

    // 6. Create test promotion
    console.log('6️⃣ Creating test promotion...');
    const promotion = await doctorBusinessService.createPromotion(doctor.id, {
      promotionType: 'featured_badge',
      title: 'Featured Doctor Badge - Test',
      description: 'Test promotion for featured badge',
      pricePerDay: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log(`✅ Promotion created:`);
    console.log(`   ID: ${promotion.id}`);
    console.log(`   Type: ${promotion.promotion_type}`);
    console.log(`   Total Price: $${promotion.total_price}\n`);

    // 7. Simulate payment and activate
    console.log('7️⃣ Activating promotion...');
    const activated = await doctorBusinessService.activatePromotion(promotion.id, 'test_payment_123');
    console.log(`✅ Promotion activated`);
    console.log(`   Status: ${activated.payment_status}`);
    console.log(`   Active: ${activated.is_active}\n`);

    // 8. Get active promotions
    console.log('8️⃣ Fetching active promotions...');
    const activePromotions = await doctorBusinessService.getActivePromotions(doctor.id);
    console.log(`✅ Active promotions: ${activePromotions.length}`);
    activePromotions.forEach((promo: any) => {
      console.log(`   - ${promo.title} (${promo.promotion_type})`);
    });
    console.log();

    // 9. Track promotion metrics
    console.log('9️⃣ Tracking promotion metrics...');
    await doctorBusinessService.trackPromotionImpression(promotion.id, 'badge');
    await doctorBusinessService.trackPromotionClick(promotion.id, 'badge');
    console.log('✅ Metrics tracked\n');

    // 10. Get promotion performance
    console.log('🔟 Fetching promotion performance...');
    const performance = await doctorBusinessService.getPromotionPerformance(promotion.id);
    console.log(`✅ Performance metrics:`);
    console.log(`   Impressions: ${performance.performance.impressions}`);
    console.log(`   Clicks: ${performance.performance.clicks}`);
    console.log(`   CTR: ${performance.performance.ctr}%\n`);

    // 11. Get featured doctors
    console.log('1️⃣1️⃣ Fetching featured doctors...');
    const featured = await doctorBusinessService.getFeaturedDoctors(5);
    console.log(`✅ Featured doctors: ${featured.length}`);
    featured.forEach((doc: any) => {
      console.log(`   - ${doc.username} (${doc.badge_type})`);
    });
    console.log();

    // 12. Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log(`✅ Analytics: Working`);
    console.log(`✅ Revenue Tracking: Working`);
    console.log(`✅ Patient Retention: Working`);
    console.log(`✅ Promotions: Working`);
    console.log(`✅ Featured Badges: Working`);
    console.log(`✅ Performance Tracking: Working`);
    console.log('\n🎉 All business dashboard tests passed!\n');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testBusinessDashboard()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
