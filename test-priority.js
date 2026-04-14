// Quick test script to verify priority analysis
const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPriorityAnalysis() {
  console.log('🧪 Testing Post Priority Feature...\n');

  try {
    // Test 1: Fetch posts and check if they're sorted by priority
    console.log('1️⃣ Testing GET /api/v1/posts - Priority Sorting');
    const response = await axios.get(`${API_URL}/api/v1/posts?limit=10`);
    
    if (response.data.success) {
      const posts = response.data.data || response.data;
      console.log(`✅ Fetched ${posts.length} posts`);
      
      // Check if posts have priority data
      const postsWithPriority = posts.filter(p => p.priority);
      console.log(`📊 Posts with priority data: ${postsWithPriority.length}/${posts.length}`);
      
      // Display priority distribution
      if (postsWithPriority.length > 0) {
        console.log('\n📋 Priority Distribution:');
        postsWithPriority.forEach((post, idx) => {
          const priority = post.priority;
          const emoji = priority.priorityLevel === 'HIGH' ? '🔴' : 
                       priority.priorityLevel === 'MEDIUM' ? '🟡' : '🟢';
          console.log(`  ${idx + 1}. ${emoji} ${priority.priorityLevel} (Score: ${priority.urgencyScore}) - "${post.title.substring(0, 50)}..."`);
        });
        
        // Verify sorting
        let isSorted = true;
        for (let i = 0; i < postsWithPriority.length - 1; i++) {
          const current = postsWithPriority[i].priority.urgencyScore;
          const next = postsWithPriority[i + 1].priority.urgencyScore;
          if (current < next) {
            isSorted = false;
            break;
          }
        }
        console.log(`\n${isSorted ? '✅' : '❌'} Posts are ${isSorted ? 'correctly' : 'NOT'} sorted by priority`);
      }
    }
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testPriorityAnalysis();
