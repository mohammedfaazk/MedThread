/**
 * Test Community Features API Endpoints
 */

async function testAPI() {
  const baseURL = 'http://localhost:3001/api/v1';

  console.log('🧪 Testing Community Features API...\n');

  try {
    // Test Support Groups
    console.log('1️⃣ Testing Support Groups...');
    const groupsRes = await fetch(`${baseURL}/support-groups`);
    const groupsData = await groupsRes.json();
    console.log(`   ✅ Found ${groupsData.data?.length || 0} support groups`);
    if (groupsData.data?.length > 0) {
      console.log(`   📋 Sample: ${groupsData.data[0].name}`);
    }

    // Test Q&A Forum
    console.log('\n2️⃣ Testing Q&A Forum...');
    const qaRes = await fetch(`${baseURL}/qa-forum/questions`);
    const qaData = await qaRes.json();
    const questionCount = qaData.data?.questions?.length || 0;
    console.log(`   ✅ Found ${questionCount} forum questions`);
    if (questionCount > 0) {
      console.log(`   📋 Sample: ${qaData.data.questions[0].title}`);
    }

    // Test Health Challenges
    console.log('\n3️⃣ Testing Health Challenges...');
    const challengesRes = await fetch(`${baseURL}/health-challenges/popular`);
    const challengesData = await challengesRes.json();
    const challengeCount = challengesData.data?.length || 0;
    console.log(`   ✅ Found ${challengeCount} health challenges`);
    if (challengeCount > 0) {
      console.log(`   📋 Sample: ${challengesData.data[0].title}`);
    }

    // Test Success Stories
    console.log('\n4️⃣ Testing Success Stories...');
    const storiesRes = await fetch(`${baseURL}/success-stories`);
    const storiesData = await storiesRes.json();
    const storyCount = storiesData.data?.stories?.length || 0;
    console.log(`   ✅ Found ${storyCount} success stories`);
    if (storyCount > 0) {
      console.log(`   📋 Sample: ${storiesData.data.stories[0].title}`);
    }

    console.log('\n🎉 All API endpoints working!\n');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testAPI();
