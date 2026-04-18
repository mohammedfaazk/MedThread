// Quick test script to verify the moderation activity endpoint
const fetch = require('node-fetch');

async function testModerationEndpoint() {
  try {
    console.log('🧪 Testing moderation activity endpoint...\n');
    
    // You'll need to replace this with a valid admin token
    // Get it from localStorage in your browser after logging in as admin
    const token = 'YOUR_ADMIN_TOKEN_HERE';
    
    const response = await fetch('http://localhost:3001/api/admin-analytics/moderation-activity?weeks=12', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Endpoint working!\n');
      console.log('📊 Moderation Activity Data:');
      console.log(JSON.stringify(data.data, null, 2));
      console.log(`\n⏱️ Average Resolution Time: ${data.avgResolutionTimeHours} hours`);
      
      // Summary
      const totalFiled = data.data.reduce((sum, week) => sum + week.filed, 0);
      const totalResolved = data.data.reduce((sum, week) => sum + week.resolved, 0);
      const totalDismissed = data.data.reduce((sum, week) => sum + week.dismissed, 0);
      
      console.log('\n📈 Summary:');
      console.log(`   Total Filed: ${totalFiled}`);
      console.log(`   Total Resolved: ${totalResolved}`);
      console.log(`   Total Dismissed: ${totalDismissed}`);
      console.log(`   Pending: ${totalFiled - totalResolved - totalDismissed}`);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to test endpoint:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. API server is running on port 3001');
    console.log('   2. You have a valid admin token');
    console.log('   3. You ran the seed script: npm run seed:reports');
  }
}

testModerationEndpoint();
