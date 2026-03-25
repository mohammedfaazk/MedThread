/**
 * Comprehensive test to verify all community features are working
 */

async function testEndpoint(url: string, name: string) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ ${name}: Working (${response.status})`);
      return true;
    } else {
      console.log(`⚠️  ${name}: Response not successful (${response.status})`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
    return false;
  }
}

async function verifyAllFeatures() {
  console.log('🔍 Verifying all community features...\n');

  const tests = [
    { url: 'http://localhost:3001/api/v1/support-groups', name: 'Support Groups' },
    { url: 'http://localhost:3001/api/v1/qa-forum/questions', name: 'QA Forum' },
    { url: 'http://localhost:3001/api/v1/success-stories', name: 'Success Stories' },
    { url: 'http://localhost:3001/api/v1/emergency-broadcast/active', name: 'Emergency Broadcasts' },
  ];

  let passed = 0;
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    if (result) passed++;
  }

  console.log(`\n📊 Results: ${passed}/${tests.length} endpoints working`);
  
  if (passed === tests.length) {
    console.log('🎉 All community features are operational!');
  } else {
    console.log('⚠️  Some features need attention');
  }
}

verifyAllFeatures();
