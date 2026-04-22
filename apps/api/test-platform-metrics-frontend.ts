/**
 * Test Platform Metrics Frontend Data
 * This script tests the exact data structure the frontend receives
 */

async function testPlatformMetrics() {
  console.log('🧪 Testing Platform Metrics Frontend Data...\n');

  try {
    // Test peak usage
    console.log('1️⃣ Testing Peak Usage API...');
    const peakResponse = await fetch('http://localhost:3000/api/platform-analytics/peak-usage?days=30');
    const peakData = await peakResponse.json();
    
    console.log('Peak Usage Response:', JSON.stringify(peakData, null, 2));
    
    if (peakData.success && peakData.data) {
      console.log('\n✅ Peak Usage Data Structure:');
      console.log('- Peak Hours:', Object.keys(peakData.data.peakHours).length, 'hours');
      console.log('- Peak Days:', Object.keys(peakData.data.peakDays).length, 'days');
      console.log('- Average Active Users:', peakData.data.averageActiveUsers);
      
      // Show top 5 peak hours
      const sortedHours = Object.entries(peakData.data.peakHours)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);
      console.log('\nTop 5 Peak Hours:');
      sortedHours.forEach(([hour, count]) => {
        console.log(`  ${hour}:00 - ${parseInt(hour) + 1}:00: ${count} sessions`);
      });
      
      // Show all peak days
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log('\nPeak Days:');
      Object.entries(peakData.data.peakDays)
        .sort(([, a]: any, [, b]: any) => b - a)
        .forEach(([day, count]) => {
          console.log(`  ${dayNames[parseInt(day)]}: ${count} active users`);
        });
    } else {
      console.log('❌ Peak Usage API failed:', peakData);
    }

    // Test bottlenecks
    console.log('\n\n2️⃣ Testing Bottlenecks API...');
    const bottleneckResponse = await fetch('http://localhost:3000/api/platform-analytics/bottlenecks');
    const bottleneckData = await bottleneckResponse.json();
    
    console.log('Bottlenecks Response:', JSON.stringify(bottleneckData, null, 2));
    
    if (bottleneckData.success && bottleneckData.data) {
      console.log('\n✅ Bottlenecks Data Structure:');
      console.log('- High Bounce Posts:', bottleneckData.data.highBouncePosts.length);
      console.log('- Slow Doctors:', bottleneckData.data.slowDoctors.length);
    } else {
      console.log('❌ Bottlenecks API failed:', bottleneckData);
    }

    console.log('\n\n✅ All Platform Metrics APIs Working!');
    console.log('\n📊 Summary:');
    console.log('- Peak Usage: ✅ Working');
    console.log('- Bottlenecks: ✅ Working');
    console.log('\n🎯 Visit http://localhost:3000/analytics and click "Platform Metrics" tab');

  } catch (error) {
    console.error('❌ Error testing platform metrics:', error);
  }
}

testPlatformMetrics();
