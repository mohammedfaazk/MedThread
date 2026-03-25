import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function checkUserAppointments() {
    try {
        // Find navin user
        const navin = await prisma.user.findFirst({
            where: { email: 'navin@gmail.com' }
        });

        if (!navin) {
            console.log('Navin user not found');
            return;
        }

        console.log(`Navin User ID: ${navin.id}\n`);

        // Get all appointments for navin as patient
        const appointments = await prisma.appointment.findMany({
            where: { patientId: navin.id },
            include: {
                doctor: { select: { username: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${appointments.length} appointments for navin as patient:\n`);

        appointments.forEach((apt, index) => {
            console.log(`${index + 1}. ID: ${apt.id}`);
            console.log(`   Status: ${apt.status}`);
            console.log(`   Doctor: ${apt.doctor.username}`);
            console.log(`   Time: ${apt.startTime.toLocaleString()}`);
            console.log(`   Created: ${apt.createdAt.toLocaleString()}`);
            console.log('');
        });

        // Count by status
        const statusCounts: Record<string, number> = {};
        appointments.forEach(apt => {
            statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
        });

        console.log('Status breakdown:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserAppointments();
