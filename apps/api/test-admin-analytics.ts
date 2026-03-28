/**
 * Test Admin Analytics Endpoints
 * 
 * This script tests if the admin analytics endpoints are working
 * by creating a test admin user and making authenticated requests.
 */

import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function testAdminAnalytics() {
  console.log('🧪 Testing Admin Analytics Endpoints...\n');

  try {
    // 1. Find or create an admin user
    console.log('📋 Step 1: Finding/Creating admin user...');
    
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('   No admin user found. Creating one...');
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
      console.log('   ✅ Created admin user: admin@medthread.com / Admin@123');
    } else {
      console.log(`   ✅ Found admin user: ${adminUser.email}`);
    }

    // 2. Generate JWT token
    console.log('\n📋 Step 2: Generating JWT token...');
    const token = jwt.sign(
      { userId: adminUser.id, role: adminUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    console.log('   ✅ Token generated');

    // 3. Test endpoint with token
    console.log('\n📋 Step 3: Testing endpoint...');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${baseUrl}/api/admin-analytics/active-users?period=today`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Success! Data received:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('   ❌ Error:', error);
    }

    // 4. Print credentials for manual testing
    console.log('\n═══════════════════════════════════════════');
    console.log('📝 ADMIN CREDENTIALS FOR TESTING');
    console.log('═══════════════════════════════════════════');
    console.log(`Email: ${adminUser.email}`);
    console.log('Password: Admin@123');
    console.log('Role: ADMIN');
    console.log('═══════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAnalytics();
