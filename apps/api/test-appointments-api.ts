import axios from 'axios';

const API_URL = 'http://localhost:3001';
const userId = 'cmmt5kn0e0002ztoyh2g3afz6'; // navin's user ID

async function testAppointmentsAPI() {
    try {
        console.log('Testing appointments API...\n');
        console.log(`User ID: ${userId}`);
        console.log(`URL: ${API_URL}/api/appointments/appointments?userId=${userId}&role=patient\n`);

        const response = await axios.get(
            `${API_URL}/api/appointments/appointments?userId=${userId}&role=patient`
        );

        console.log(`Status: ${response.status}`);
        console.log(`Received ${response.data.length} appointments:\n`);

        response.data.forEach((apt: any, index: number) => {
            console.log(`${index + 1}. ID: ${apt.id.slice(0, 12)}...`);
            console.log(`   Status: ${apt.status}`);
            console.log(`   Doctor: ${apt.doctor?.username || 'N/A'}`);
            console.log(`   Time: ${new Date(apt.startTime).toLocaleString()}`);
            console.log('');
        });

        // Count by status
        const statusCounts: Record<string, number> = {};
        response.data.forEach((apt: any) => {
            statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
        });

        console.log('Status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testAppointmentsAPI();
