import axios from 'axios';
import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3001/api';

async function debugAdminLogin() {
  console.log('🔍 DEBUGGING ADMIN LOGIN\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check database connection
    console.log('\n1️⃣ Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Step 2: Find admin user
    console.log('\n2️⃣ Finding admin user in database...');
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
        isSuspended: true,
      }
    });

    if (!admin) {
      console.log('❌ Admin user NOT FOUND in database!');
      console.log('\n💡 Creating admin user...');
      
      const passwordHash = await bcrypt.hash('Admin@123456', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@medthread.com',
          username: 'admin',
          passwordHash,
          role: 'ADMIN',
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
      return debugAdminLogin(); // Retry
    }

    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Role:', admin.role);
    console.log('   Suspended:', admin.isSuspended);
    console.log('   Has password hash:', !!admin.passwordHash);

    // Step 3: Verify password hash
    console.log('\n3️⃣ Verifying password hash...');
    const testPassword = 'Admin@123456';
    const isValid = await bcrypt.compare(testPassword, admin.passwordHash!);
    console.log('   Password "Admin@123456" is:', isValid ? '✅ VALID' : '❌ INVALID');

    if (!isValid) {
      console.log('\n⚠️  Password hash is invalid! Fixing...');
      const newHash = await bcrypt.hash(testPassword, 12);
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password hash updated');
    }

    // Step 4: Check API server
    console.log('\n4️⃣ Checking API server...');
    try {
      const healthCheck = await axios.get('http://localhost:3001/health');
      console.log('✅ API server is running');
      console.log('   Response:', healthCheck.data);
    } catch (err) {
      console.log('❌ API server is NOT running on port 3001');
      console.log('   Please start the API server: npm run dev');
      return;
    }

    // Step 5: Test login via API
    console.log('\n5️⃣ Testing login via API...');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@medthread.com',
        password: 'Admin@123456',
      });

      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('\nResponse:');
      console.log('   Success:', response.data.success);
      console.log('   User:', response.data.data.user);
      console.log('   Token:', response.data.data.token.substring(0, 30) + '...');
      console.log('   Role:', response.data.data.user.role);

    } catch (err: any) {
      console.log('❌ LOGIN FAILED!');
      console.log('\nError details:');
      console.log('   Status:', err.response?.status);
      console.log('   Message:', err.response?.data?.error || err.response?.data?.message);
      console.log('   Full response:', JSON.stringify(err.response?.data, null, 2));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Debug complete!');

  } catch (error: any) {
    console.error('\n❌ Debug failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminLogin();
