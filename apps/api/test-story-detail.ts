import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testStoryDetail() {
  try {
    console.log('📋 Fetching all stories to get an ID...\n');
    
    const listResponse = await fetch(`${API_URL}/api/v1/success-stories`);
    const listData = await listResponse.json();
    
    if (!listData.success || listData.data.stories.length === 0) {
      console.log('❌ No stories found');
      return;
    }

    const storyId = listData.data.stories[0].id;
    console.log(`✅ Found story ID: ${storyId}\n`);

    // Fetch story detail
    console.log('📖 Fetching story detail...\n');
    const detailResponse = await fetch(`${API_URL}/api/v1/success-stories/${storyId}`);
    const detailData = await detailResponse.json();
    
    if (detailData.success) {
      console.log('✅ Story detail fetched successfully!');
      console.log('   Title:', detailData.data.title);
      console.log('   Author:', detailData.data.author.username);
      console.log('   Likes:', detailData.data.likes);
      console.log('   Views:', detailData.data.views);
      console.log('   Comments:', detailData.data.comments.length);
      console.log('\n🎉 Story detail page will work!');
    } else {
      console.log('❌ Failed to fetch story detail:', detailData);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testStoryDetail();
