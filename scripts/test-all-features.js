#!/usr/bin/env node

/**
 * Comprehensive test script for all MedThread features
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

const allRoutes = {
  'Core Platform': [
    '/api/auth/health',
    '/api/v1/posts',
    '/api/v1/comments',
    '/api/v1/communities',
    '/api/v1/search',
    '/api/follow',
    '/api/block',
    '/api/badges',
    '/api/v1/karma',
    '/api/v1/awards'
  ],
  'Medical Features': [
    '/api/appointments',
    '/api/chat',
    '/api/v2/chat',
    '/api/v1/doctor-verification',
    '/api/v1/medications',
    '/api/v1/symptom-diary',
    '/api/v1/health-timeline',
    '/api/v1/health-challenges',
    '/api/v1/support-groups',
    '/api/v1/health-risk',
    '/api/v1/health-profile',
    '/api/v1/diet-plan'
  ],
  'Analytics': [
    '/api/analytics',
    '/api/doctor-analytics',
    '/api/platform-analytics',
    '/api/enhanced-analytics',
    '/api/doctor-profile-analytics',
    '/api/post-priority',
    '/api/admin-user-activity',
    '/api/regional-symptom-analytics'
  ],
  'Advanced Features': [
    '/api/v1/unique-features',
    '/api/v1/voice-messages',
    '/api/v1/ai-detective',
    '/api/consultation-funnel',
    '/api/cme-credits',
    '/api/health-insights',
    '/api/file-upload',
    '/api/payment'
  ],
  'System': [
    '/api/notifications',
    '/api/profile',
    '/api/v2/users',
    '/health'
  ]
};

async function testRoute(route) {
  try {
    const response = await fetch(`${API_BASE}${route}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const status = response.status;
    
    if (status === 404) {
      return { success: false, status, message: 'NOT FOUND' };
    } else if (status === 401 || status === 403) {
      return { success: true, status, message: 'EXISTS (auth required)' };
    } else if (status === 200) {
      return { success: true, status, message: 'ACCESSIBLE' };
    } else {
      return { success: true, status, message: `Status ${status}` };
    }
  } catch (error) {
    return { success: false, status: 0, message: error.message };
  }
}

async function main() {
  console.log('🧪 MedThread Feature Test Suite\n');
  console.log(`API Base: ${API_BASE}\n`);
  console.log('='.repeat(60));
  
  let totalPassed = 0;
  let totalFailed = 0;
  const failedRoutes = [];
  
  for (const [category, routes] of Object.entries(allRoutes)) {
    console.log(`\n📦 ${category}`);
    console.log('-'.repeat(60));
    
    let categoryPassed = 0;
    let categoryFailed = 0;
    
    for (const route of routes) {
      const result = await testRoute(route);
      
      if (result.success) {
        console.log(`  ✅ ${route.padEnd(45)} ${result.message}`);
        categoryPassed++;
        totalPassed++;
      } else {
        console.log(`  ❌ ${route.padEnd(45)} ${result.message}`);
        categoryFailed++;
        totalFailed++;
        failedRoutes.push({ category, route, message: result.message });
      }
    }
    
    console.log(`  ${categoryPassed}/${routes.length} routes accessible`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Routes Tested: ${totalPassed + totalFailed}`);
  console.log(`✅ Accessible: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (failedRoutes.length > 0) {
    console.log('\n❌ FAILED ROUTES:');
    console.log('-'.repeat(60));
    failedRoutes.forEach(({ category, route, message }) => {
      console.log(`  [${category}] ${route} - ${message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (totalFailed === 0) {
    console.log('\n🎉 All routes are accessible! Platform is ready for testing.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${totalFailed} routes need attention.`);
    process.exit(1);
  }
}

main();
