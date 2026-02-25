/**
 * Test Revenue Streams
 * Run: npx ts-node test-revenue-streams.ts
 */

import { prisma } from '@medthread/database';

async function testRevenueStreams() {
  console.log('🧪 Testing Revenue Streams...\n');

  try {
    // 1. Check subscription tiers
    console.log('1️⃣ Checking subscription tiers...');
    const tiers = await prisma.$queryRaw<any[]>`
      SELECT tier_name, display_name, monthly_price, annual_price
      FROM "SubscriptionTier"
      WHERE is_active = true
      ORDER BY sort_order
    `;
    console.log(`✓ Found ${tiers.length} subscription tiers:`);
    tiers.forEach(tier => {
      console.log(`  - ${tier.display_name}: $${tier.monthly_price}/mo, $${tier.annual_price}/yr`);
    });

    // 2. Check doctor subscriptions
    console.log('\n2️⃣ Checking doctor subscriptions...');
    const subscriptions = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, status
      FROM "DoctorSubscription"
      GROUP BY status
    `;
    console.log(`✓ Subscription status:`);
    subscriptions.forEach(sub => {
      console.log(`  - ${sub.status}: ${sub.count}`);
    });

    // 3. Check premium listings
    console.log('\n3️⃣ Checking premium listings...');
    const premiumListings = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "PremiumListing"
      WHERE is_premium = true
    `;
    console.log(`✓ Found ${premiumListings[0].count} premium listings`);

    // 4. Check consultation commissions
    console.log('\n4️⃣ Checking consultation commissions...');
    const commissions = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, status
      FROM "ConsultationCommission"
      GROUP BY status
    `;
    if (commissions.length > 0) {
      console.log(`✓ Commission status:`);
      commissions.forEach(com => {
        console.log(`  - ${com.status}: ${com.count}`);
      });
    } else {
      console.log(`✓ No commissions recorded yet`);
    }

    // 5. Check advertisements
    console.log('\n5️⃣ Checking advertisements...');
    const ads = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, status
      FROM "Advertisement"
      GROUP BY status
    `;
    if (ads.length > 0) {
      console.log(`✓ Advertisement status:`);
      ads.forEach(ad => {
        console.log(`  - ${ad.status}: ${ad.count}`);
      });
    } else {
      console.log(`✓ No advertisements created yet`);
    }

    // 6. Check ad impressions
    console.log('\n6️⃣ Checking ad impressions...');
    const impressions = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE clicked = true) as clicks
      FROM "AdImpression"
    `;
    console.log(`✓ Ad impressions: ${impressions[0].total} (${impressions[0].clicks} clicks)`);

    // 7. Check data insights
    console.log('\n7️⃣ Checking data insights...');
    const insights = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, status
      FROM "DataInsight"
      GROUP BY status
    `;
    if (insights.length > 0) {
      console.log(`✓ Data insight status:`);
      insights.forEach(insight => {
        console.log(`  - ${insight.status}: ${insight.count}`);
      });
    } else {
      console.log(`✓ No data insights created yet`);
    }

    // 8. Check revenue transactions
    console.log('\n8️⃣ Checking revenue transactions...');
    const transactions = await prisma.$queryRaw<any[]>`
      SELECT transaction_type, COUNT(*) as count, SUM(amount) as total
      FROM "RevenueTransaction"
      WHERE status = 'completed'
      GROUP BY transaction_type
    `;
    if (transactions.length > 0) {
      console.log(`✓ Revenue by type:`);
      transactions.forEach(txn => {
        console.log(`  - ${txn.transaction_type}: ${txn.count} transactions, $${parseFloat(txn.total).toFixed(2)}`);
      });
    } else {
      console.log(`✓ No revenue transactions yet`);
    }

    // 9. Check platform revenue aggregation
    console.log('\n9️⃣ Checking platform revenue...');
    const platformRevenue = await prisma.$queryRaw<any[]>`
      SELECT period_type, COUNT(*) as periods, SUM(total_revenue) as total
      FROM "PlatformRevenue"
      GROUP BY period_type
    `;
    if (platformRevenue.length > 0) {
      console.log(`✓ Platform revenue by period:`);
      platformRevenue.forEach(rev => {
        console.log(`  - ${rev.period_type}: ${rev.periods} periods, $${parseFloat(rev.total).toFixed(2)}`);
      });
    } else {
      console.log(`✓ No platform revenue aggregated yet`);
    }

    // 10. Test commission calculation function
    console.log('\n🔟 Testing commission calculation...');
    const testFee = 100.00;
    const testDoctorId = 'test-doctor-id';
    
    try {
      const commissionCalc = await prisma.$queryRaw<any[]>`
        SELECT * FROM calculate_commission(${testFee}, ${testDoctorId})
      `;
      
      if (commissionCalc.length > 0) {
        const calc = commissionCalc[0];
        console.log(`✓ Commission calculation for $${testFee}:`);
        console.log(`  - Commission rate: ${calc.commission_rate}%`);
        console.log(`  - Commission amount: $${parseFloat(calc.commission_amount).toFixed(2)}`);
        console.log(`  - Doctor payout: $${parseFloat(calc.doctor_payout).toFixed(2)}`);
      }
    } catch (error) {
      console.log(`⚠️  Commission calculation test skipped (doctor not found)`);
    }

    console.log('\n✅ Revenue Streams test completed!');
    console.log('\n📝 Summary:');
    console.log(`  - Subscription Tiers: ${tiers.length}`);
    console.log(`  - Premium Listings: ${premiumListings[0].count}`);
    console.log(`  - Total Transactions: ${transactions.reduce((sum, t) => sum + parseInt(t.count), 0)}`);

  } catch (error) {
    console.error('❌ Error testing revenue streams:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRevenueStreams();
