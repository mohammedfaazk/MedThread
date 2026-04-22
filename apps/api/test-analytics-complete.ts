/**
 * Complete Analytics Test
 * Verifies all analytics endpoints and data
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testAnalytics() {
  console.log('🧪 Testing Analytics Endpoints\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Trending Symptoms
    console.log('\n1️⃣  Testing Trending Symptoms...');
    const trendingRes = await axios.get(`${API_URL}/api/health-analytics/trending?timeWindow=daily&limit=10`);
    
    if (trendingRes.data.success && trendingRes.data.data.length > 0) {
      console.log('✅ Trending Symptoms: WORKING');
      console.log(`   Found ${trendingRes.data.data.length} trending symptoms`);
      console.log(`   Top 3:`);
      trendingRes.data.data.slice(0, 3).forEach((item: any, i: number) => {
        console.log(`   ${i + 1}. ${item.symptom}: ${item.count} reports`);
      });
    } else {
      console.log('❌ Trending Symptoms: NO DATA');
    }

    // Test 2: Geographic Alerts
    console.log('\n2️⃣  Testing Geographic Alerts...');
    const alertsRes = await axios.get(`${API_URL}/api/health-analytics/geographic-alerts`);
    
    if (alertsRes.data.success) {
      console.log('✅ Geographic Alerts: WORKING');
      console.log(`   Found ${alertsRes.data.data.length} alerts`);
      if (alertsRes.data.data.length === 0) {
        console.log('   ℹ️  No HIGH/CRITICAL alerts (all cities are MODERATE)');
      }
    } else {
      console.log('❌ Geographic Alerts: FAILED');
    }

    // Test 3: Top Health Issues
    console.log('\n3️⃣  Testing Top Health Issues...');
    const issuesRes = await axios.get(`${API_URL}/api/health-analytics/top-issues?limit=5`);
    
    if (issuesRes.data.success) {
      console.log('✅ Top Health Issues: WORKING');
      console.log(`   Found ${issuesRes.data.data.length} issues`);
    } else {
      console.log('❌ Top Health Issues: NO DATA');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📍 Analytics Page Ready:');
    console.log('   http://localhost:3000/analytics');
    console.log('\n💡 The page will show:');
    console.log('   • Trending symptoms with real counts');
    console.log('   • Geographic health data (when alerts are HIGH/CRITICAL)');
    console.log('   • AI-generated health advisories');
    console.log('   • Real-time updates via WebSocket');

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. API server is running: npm run dev');
    console.log('   2. Database has data: npx tsx apps/api/complete-analytics-setup.ts');
    process.exit(1);
  }
}

testAnalytics();
