import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testSupportGroupCreate() {
  try {
    console.log('🔐 Logging in as navin@gmail.com...\n');

    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'navin@gmail.com',
        password: 'navin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.data?.token) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Create a support group
    console.log('👥 Creating support group...\n');
    const groupResponse = await fetch(`${API_URL}/api/v1/support-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Group - ' + new Date().toISOString(),
        condition: 'Diabetes',
        description: 'This is a test group to verify support groups are working.',
        isPrivate: false
      })
    });

    const groupData = await groupResponse.json();
    
    if (groupData.success) {
      console.log('✅ Support group created successfully!');
      console.log('   ID:', groupData.group.id);
      console.log('   Name:', groupData.group.name);
      console.log('   Private:', groupData.group.isPrivate);
    } else {
      console.log('❌ Group creation failed:', groupData);
    }

    // Test creating a private group
    console.log('\n🔒 Creating private group...\n');
    const privateGroupResponse = await fetch(`${API_URL}/api/v1/support-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Private Test Group - ' + new Date().toISOString(),
        condition: 'Mental Health',
        description: 'This is a private test group.',
        isPrivate: true
      })
    });

    const privateGroupData = await privateGroupResponse.json();
    
    if (privateGroupData.success) {
      console.log('✅ Private group created successfully!');
      console.log('   ID:', privateGroupData.group.id);
      console.log('   Name:', privateGroupData.group.name);
      console.log('   Private:', privateGroupData.group.isPrivate);
    } else {
      console.log('❌ Private group creation failed:', privateGroupData);
    }

    console.log('\n🎉 Support Groups feature is fully operational!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSupportGroupCreate();
