import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import axios from 'axios';

async function healthCheck() {
  console.log('🏥 MedThread Health Check\n');
  console.log('='.repeat(60));

  let allGood = true;

  // 1. Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: OK');
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.error('   Error:', error);
    allGood = false;
  }

  // 2. Check users have passwords
  try {
    const usersWithoutPasswords = await prisma.user.count({
      where: {
        passwordHash: null
      }
    });

    if (usersWithoutPasswords === 0) {
      console.log('✅ User passwords: All users have passwords');
    } else {
      console.log(`⚠️  User passwords: ${usersWithoutPasswords} users without passwords`);
      allGood = false;
    }
  } catch (error) {
    console.log('❌ User passwords check: FAILED');
    console.error('   Error:', error);
    allGood = false;
  }

  // 3. Check admin user
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@medthread.com' }
    });

    if (admin && admin.passwordHash) {
      const isValid = await bcrypt.compare('Admin@123456', admin.passwordHash);
      if (isValid) {
        console.log('✅ Admin user: OK (admin@medthread.com / Admin@123456)');
      } else {
        console.log('⚠️  Admin user: Password does not match default');
      }
    } else {
      console.log('❌ Admin user: Not found or no password');
      allGood = false;
    }
  } catch (error) {
    console.log('❌ Admin user check: FAILED');
    console.error('   Error:', error);
    allGood = false;
  }

  // 4. Check API server
  try {
    const response = await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    if (response.status === 200) {
      console.log('✅ API server: Running on port 3001');
    } else {
      console.log('⚠️  API server: Unexpected response');
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ API server: Not running (start with: npm run dev)');
    } else {
      console.log('⚠️  API server: Error connecting');
    }
  }

  // 5. Test login endpoint
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@medthread.com',
      password: 'Admin@123456'
    }, {
      timeout: 5000
    });

    if (response.data.success && response.data.data.token) {
      console.log('✅ Login endpoint: Working correctly');
    } else {
      console.log('⚠️  Login endpoint: Unexpected response');
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Login endpoint: API not running');
    } else if (error.response?.status === 401) {
      console.log('❌ Login endpoint: Authentication failed');
      allGood = false;
    } else {
      console.log('⚠️  Login endpoint: Error');
    }
  }

  console.log('='.repeat(60));
  
  if (allGood) {
    console.log('\n✅ All checks passed! System is healthy.\n');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the issues above.\n');
    console.log('To fix user passwords, run:');
    console.log('   npx tsx fix-all-user-passwords.ts\n');
  }

  await prisma.$disconnect();
}

healthCheck();
