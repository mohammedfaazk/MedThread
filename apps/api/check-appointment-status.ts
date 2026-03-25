import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkAppointments() {
    try {
        console.log('Checking all appointments...\n');
        
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: { select: { username: true, email: true } },
                doctor: { select: { username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log(`Found ${appointments.length} recent appointments:\n`);

        appointments.forEach((apt, index) => {
            console.log(`${index + 1}. ID: ${apt.id.slice(0, 12)}...`);
            console.log(`   Status: ${apt.status}`);
            console.log(`   Patient: ${apt.patient.username} (${apt.patient.email})`);
            console.log(`   Doctor: ${apt.doctor.username} (${apt.doctor.email})`);
            console.log(`   Time: ${apt.startTime.toLocaleString()}`);
            console.log(`   Reason: ${apt.reason?.slice(0, 50)}...`);
            console.log('');
        });

        // Count by status
        const statusCounts = await prisma.appointment.groupBy({
            by: ['status'],
            _count: true
        });

        console.log('Appointments by status:');
        statusCounts.forEach(({ status, _count }) => {
            console.log(`  ${status}: ${_count}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAppointments();
