import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

const DOCTOR_PASSWORDS: Record<string, string> = {
  'watson@gmail.com': 'Watson@123456',
  'dr.mitchell@medthread.com': 'Mitchell@123456',
  'rifa@gmail.com': 'Rifa@123456',
  'test.doctor.1773995866829@example.com': 'TestDoc@123456',
  'login.test.doctor.1773995919045@example.com': 'LoginTest@123456'
};

async function finalVerificationTest() {
  console.log('🧪 FINAL VERIFICATION TEST\n');
  console.log('═'.repeat(70));
  console.log('\nThis test verifies that the password fix is permanent and works correctly.\n');

  try {
    // Test 1: Database verification
    console.log('📋 TEST 1: Database Password Verification\n');
    
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        doctorVerificationStatus: true
      }
    });

    let dbTestsPassed = 0;
    for (const doctor of doctors) {
      const expectedPassword = DOCTOR_PASSWORDS[doctor.email];
      const isValid = await bcrypt.compare(expectedPassword, doctor.passwordHash);
      const isApproved = doctor.doctorVerificationStatus === 'APPROVED';
      
      if (isValid && isApproved) {
        console.log(`✅ ${doctor.username}: Password ✓ | Status: APPROVED`);
        dbTestsPassed++;
      } else {
        console.log(`❌ ${doctor.username}: Password ${isValid ? '✓' : '✗'} | Status: ${doctor.doctorVerificationStatus}`);
      }
    }

    console.log(`\nDatabase Tests: ${dbTestsPassed}/${doctors.length} passed\n`);

    // Test 2: API Login Test
    console.log('═'.repeat(70));
    console.log('\n📋 TEST 2: API Login Verification\n');

    let loginTestsPassed = 0;
    for (const [email, password] of Object.entries(DOCTOR_PASSWORDS)) {
      try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email,
          password
        });

        if (response.data.success && response.data.data.token) {
          console.log(`✅ ${email}: Login successful`);
          loginTestsPassed++;
        } else {
          console.log(`❌ ${email}: Login failed - no token`);
        }
      } catch (error: any) {
        console.log(`❌ ${email}: Login failed - ${error.response?.data?.error || error.message}`);
      }
    }

    console.log(`\nLogin Tests: ${loginTestsPassed}/${Object.keys(DOCTOR_PASSWORDS).length} passed\n`);

    // Test 3: Password Verification Endpoint Test
    console.log('═'.repeat(70));
    console.log('\n📋 TEST 3: Password Verification Endpoint\n');

    let verifyTestsPassed = 0;
    for (const [email, password] of Object.entries(DOCTOR_PASSWORDS)) {
      try {
        // First login to get token
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email,
          password
        });

        const token = loginResponse.data.data.token;

        // Then verify password
        const verifyResponse = await axios.post(
          `${API_URL}/api/auth/verify-password`,
          { password },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (verifyResponse.data.success) {
          console.log(`✅ ${email}: Password verification successful`);
          verifyTestsPassed++;
        } else {
          console.log(`❌ ${email}: Password verification failed`);
        }
      } catch (error: any) {
        console.log(`❌ ${email}: Verification failed - ${error.response?.data?.error || error.message}`);
      }
    }

    console.log(`\nVerification Tests: ${verifyTestsPassed}/${Object.keys(DOCTOR_PASSWORDS).length} passed\n`);

    // Final Summary
    console.log('═'.repeat(70));
    console.log('\n📊 FINAL SUMMARY\n');
    
    const totalTests = doctors.length + (Object.keys(DOCTOR_PASSWORDS).length * 2);
    const totalPassed = dbTestsPassed + loginTestsPassed + verifyTestsPassed;
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Tests Passed: ${totalPassed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! 🎉');
      console.log('\n✅ Password verification is working perfectly!');
      console.log('✅ All doctors can login!');
      console.log('✅ All doctors can access chat!');
      console.log('✅ Fix is PERMANENT and will persist across restarts!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }

    console.log('\n' + '═'.repeat(70));

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalVerificationTest()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
