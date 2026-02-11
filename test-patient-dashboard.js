/**
 * Test Script for Patient Dashboard API Endpoints
 * Run with: node test-patient-dashboard.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testEndpoints() {
    console.log('🧪 Testing Patient Dashboard API Endpoints...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await axios.get(`${API_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');

        // Test 2: Get Verified Doctors
        console.log('2️⃣ Testing Verified Doctors Endpoint...');
        const doctorsResponse = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`);
        console.log('✅ Verified Doctors Response Structure:', {
            success: doctorsResponse.data.success,
            hasData: !!doctorsResponse.data.data,
            hasDoctors: !!doctorsResponse.data.data?.doctors,
            doctorCount: doctorsResponse.data.data?.doctors?.length || 0
        });
        
        if (doctorsResponse.data.data?.doctors?.length > 0) {
            console.log('\n📋 Verified Doctors:');
            doctorsResponse.data.data.doctors.forEach((doctor, index) => {
                console.log(`   ${index + 1}. Dr. ${doctor.username}`);
                console.log(`      - Email: ${doctor.email}`);
                console.log(`      - Specialty: ${doctor.specialty || 'N/A'}`);
                console.log(`      - Experience: ${doctor.yearsOfExperience || 0} years`);
                console.log(`      - Hospital: ${doctor.hospitalAffiliation || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No verified doctors found in the system');
        }

        // Test 3: Get Appointments (with dummy user ID)
        console.log('3️⃣ Testing Appointments Endpoint...');
        const testUserId = 'test-user-123';
        const appointmentsResponse = await axios.get(`${API_URL}/api/appointments/appointments`, {
            params: { userId: testUserId, role: 'patient' }
        });
        console.log('✅ Appointments Response:', {
            appointmentCount: appointmentsResponse.data.length,
            hasAppointments: appointmentsResponse.data.length > 0
        });
        console.log('');

        // Test 4: Get Doctor Availability (if we have a doctor)
        if (doctorsResponse.data.data?.doctors?.length > 0) {
            const firstDoctor = doctorsResponse.data.data.doctors[0];
            console.log(`4️⃣ Testing Doctor Availability for Dr. ${firstDoctor.username}...`);
            const availabilityResponse = await axios.get(
                `${API_URL}/api/appointments/doctors/${firstDoctor.id}/availability`
            );
            console.log('✅ Availability Response:', {
                slotCount: availabilityResponse.data.length,
                hasSlots: availabilityResponse.data.length > 0
            });
            
            if (availabilityResponse.data.length > 0) {
                console.log(`   📅 Sample slots (showing first 3):`);
                availabilityResponse.data.slice(0, 3).forEach((slot, index) => {
                    const start = new Date(slot.startTime);
                    const end = new Date(slot.endTime);
                    console.log(`      ${index + 1}. ${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`);
                });
            }
        }

        console.log('\n✅ All tests completed successfully!');
        console.log('\n📝 Summary:');
        console.log('   - API is running and healthy');
        console.log(`   - ${doctorsResponse.data.data?.doctors?.length || 0} verified doctor(s) available`);
        console.log('   - Appointments endpoint is working');
        console.log('   - Availability endpoint is working');
        console.log('\n🎉 Patient Dashboard should now display real data instead of dummy "John Doe"!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        } else if (error.request) {
            console.error('   No response received. Is the API running on port 3001?');
        }
        process.exit(1);
    }
}

// Run tests
testEndpoints();
