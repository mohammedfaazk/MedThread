/**
 * Test Admin Login and Analytics Access
 * 
 * This script tests the full flow: login as admin, get token, access analytics
 */

import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

async function testFullFlow() {
  console.log('🧪 Testing Full Admin Analytics Flow...\n');

  try {
    // 1. Ensure admin user exists
    console.log('📋 Step 1: Ensuring admin user exists...');
    
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@medthread.com' }
    });

    if (!adminUser) {
      console.log('   Creating admin user...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@medthread.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isVerified: true
        }
      });
      console.log('   ✅ Created admin user');
    } else {
      console.log(`   ✅ Admin user exists: ${adminUser.email}`);
    }

    // 2. Login via API
    console.log('\n📋 Step 2: Logging in via API...');
    const baseUrl = 'http://localhost:3001';
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@medthread.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('   ❌ Login failed:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('   ✅ Login successful');
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);

    // 3. Test analytics endpoint
    console.log('\n📋 Step 3: Testing analytics endpoint...');
    
    const analyticsResponse = await fetch(`${baseUrl}/api/admin-analytics/active-users?period=today`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log(`   Response status: ${analyticsResponse.status}`);
    
    if (analyticsResponse.ok) {
      const data = await analyticsResponse.json();
      console.log('   ✅ Success! Data received:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await analyticsResponse.text();
      console.log('   ❌ Error:', error);
    }

    // 4. Print summary
    console.log('\n═══════════════════════════════════════════');
    console.log('📝 TEST SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log('Admin Email: admin@medthread.com');
    console.log('Admin Password: Admin@123');
    console.log(`Login Status: ${loginResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Analytics Access: ${analyticsResponse.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('═══════════════════════════════════════════\n');

    if (loginResponse.ok && analyticsResponse.ok) {
      console.log('🎉 All tests passed! You can now:');
      console.log('   1. Login to the web app with admin@medthread.com / Admin@123');
      console.log('   2. Navigate to /admin/analytics');
      console.log('   3. View all analytics charts\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFullFlow();
