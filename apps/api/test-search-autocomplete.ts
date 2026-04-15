import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testSearchAutocomplete() {
  console.log('🔍 Testing Search Autocomplete...\n');

  try {
    // Test 1: Search for doctors
    console.log('Test 1: Searching for "doctor"...');
    const response1 = await axios.get(`${API_URL}/api/v1/search/autocomplete`, {
      params: { q: 'doctor', limit: 5 }
    });
    console.log('Response:', JSON.stringify(response1.data, null, 2));
    console.log('---\n');

    // Test 2: Search for posts
    console.log('Test 2: Searching for "health"...');
    const response2 = await axios.get(`${API_URL}/api/v1/search/autocomplete`, {
      params: { q: 'health', limit: 5 }
    });
    console.log('Response:', JSON.stringify(response2.data, null, 2));
    console.log('---\n');

    // Test 3: Search for a specific user
    console.log('Test 3: Searching for "rifa"...');
    const response3 = await axios.get(`${API_URL}/api/v1/search/autocomplete`, {
      params: { q: 'rifa', limit: 5 }
    });
    console.log('Response:', JSON.stringify(response3.data, null, 2));
    console.log('---\n');

    // Test 4: Check database for users
    console.log('Test 4: Checking database for users...');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    const doctors = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
        doctorVerificationStatus: 'APPROVED'
      },
      select: {
        username: true,
        specialty: true,
        role: true,
        doctorVerificationStatus: true
      },
      take: 5
    });
    console.log('Sample doctors:', JSON.stringify(doctors, null, 2));
    console.log('---\n');

    const posts = await prisma.post.findMany({
      where: {
        isDraft: false,
        isRemoved: false
      },
      select: {
        id: true,
        title: true
      },
      take: 5
    });
    console.log('Sample posts:', JSON.stringify(posts, null, 2));
    
    await prisma.$disconnect();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testSearchAutocomplete();
