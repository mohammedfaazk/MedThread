import { PrismaClient } from '@medthread/database';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function diagnoseDatabaseAndAPI() {
  console.log('🔍 MedThread Database & API Diagnostics\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Database Connection
    console.log('\n📊 Test 1: Database Connection');
    console.log('-'.repeat(60));
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (error: any) {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n🔧 Fix: Check your DATABASE_URL in apps/api/.env');
      process.exit(1);
    }

    // Test 2: Check Users
    console.log('\n👥 Test 2: Users in Database');
    console.log('-'.repeat(60));
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
      take: 5
    });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ID: ${user.id}`);
    });

    if (users.length === 0) {
      console.log('⚠️  No users found! Run: npm run seed');
    }

    // Test 3: Check Communities
    console.log('\n🏘️  Test 3: Communities in Database');
    console.log('-'.repeat(60));
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        _count: {
          select: {
            posts: true,
            members: true
          }
        }
      }
    });
    console.log(`Found ${communities.length} communities:`);
    communities.forEach(comm => {
      console.log(`  - ${comm.displayName} (${comm.name})`);
      console.log(`    ID: ${comm.id}`);
      console.log(`    Posts: ${comm._count.posts}, Members: ${comm._count.members}`);
    });

    if (communities.length === 0) {
      console.log('⚠️  No communities found!');
      console.log('\n🔧 Creating default communities...');
      
      const defaultCommunities = [
        {
          name: 'general',
          displayName: 'General Health',
          description: 'General health discussions and questions',
          icon: '🏥'
        },
        {
          name: 'mental-health',
          displayName: 'Mental Health',
          description: 'Mental health support and discussions',
          icon: '🧠'
        },
        {
          name: 'nutrition',
          displayName: 'Nutrition & Diet',
          description: 'Nutrition advice and healthy eating',
          icon: '🥗'
        }
      ];

      for (const comm of defaultCommunities) {
        try {
          const created = await prisma.community.create({
            data: comm
          });
          console.log(`  ✅ Created: ${created.displayName}`);
        } catch (error: any) {
          console.log(`  ❌ Failed to create ${comm.displayName}:`, error.message);
        }
      }
    }

    // Test 4: Check Posts
    console.log('\n📝 Test 4: Posts in Database');
    console.log('-'.repeat(60));
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        author: {
          select: {
            username: true,
            role: true
          }
        },
        community: {
          select: {
            name: true
          }
        },
        createdAt: true
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`Found ${posts.length} posts (showing latest 5):`);
    posts.forEach(post => {
      console.log(`  - "${post.title}"`);
      console.log(`    By: ${post.author.username} (${post.author.role})`);
      console.log(`    In: ${post.community.name}`);
      console.log(`    Created: ${post.createdAt.toLocaleString()}`);
    });

    // Test 5: API Server Check
    console.log('\n🌐 Test 5: API Server Status');
    console.log('-'.repeat(60));
    try {
      const healthCheck = await axios.get(`${API_URL}/health`, { timeout: 3000 });
      console.log('✅ API server is running');
      console.log(`   Status: ${healthCheck.status}`);
    } catch (error: any) {
      console.log('❌ API server is not responding');
      console.log('   Make sure to run: cd apps/api && npm run dev');
      console.log(`   Expected URL: ${API_URL}`);
    }

    // Test 6: Login Test
    console.log('\n🔐 Test 6: Authentication Test');
    console.log('-'.repeat(60));
    try {
      // Try with harry@gmail.com first
      const loginResponse = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email: 'harry@gmail.com',
        password: 'password123'
      }, { timeout: 5000 });

      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${token.substring(0, 20)}...`);

      // Test 7: Create Community via API
      console.log('\n🏘️  Test 7: Create Community via API');
      console.log('-'.repeat(60));
      try {
        const testCommunityName = `test-${Date.now()}`;
        const createCommResponse = await axios.post(
          `${API_URL}/api/v1/communities`,
          {
            name: testCommunityName,
            displayName: 'Test Community',
            description: 'A test community created by diagnostics'
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );

        const newComm = createCommResponse.data.community || createCommResponse.data;
        console.log('✅ Community creation successful');
        console.log(`   Name: ${newComm.name}`);
        console.log(`   ID: ${newComm.id}`);

        // Test 8: Create Post via API
        console.log('\n📝 Test 8: Create Post via API');
        console.log('-'.repeat(60));
        try {
          const createPostResponse = await axios.post(
            `${API_URL}/api/v1/posts`,
            {
              title: `Test Post ${Date.now()}`,
              content: 'This is a diagnostic test post',
              communityId: newComm.id,
              type: 'TEXT',
              isNSFW: false,
              isSpoiler: false,
              isPrivate: false
            },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );

          const newPost = createPostResponse.data.data || createPostResponse.data;
          console.log('✅ Post creation successful');
          console.log(`   Title: ${newPost.title}`);
          console.log(`   ID: ${newPost.id}`);
          console.log(`   Community: ${newPost.community?.name}`);

          console.log('\n' + '='.repeat(60));
          console.log('✅ ALL TESTS PASSED!');
          console.log('='.repeat(60));
          console.log('\n✨ Your database and API are working correctly!');
          console.log('   You should be able to create posts and communities now.');

        } catch (error: any) {
          console.log('❌ Post creation failed');
          if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
          } else {
            console.log(`   Error: ${error.message}`);
          }
          throw error;
        }

      } catch (error: any) {
        console.log('❌ Community creation failed');
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
        throw error;
      }

    } catch (error: any) {
      console.log('❌ Login failed');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('\n🔧 Fix: Make sure standard users exist. Run: npx tsx create-standard-users.ts');
    }

  } catch (error: any) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ DIAGNOSTICS FAILED');
    console.log('='.repeat(60));
    console.error('\nError:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Fix: Start the API server');
      console.log('   cd apps/api && npm run dev');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDatabaseAndAPI();
