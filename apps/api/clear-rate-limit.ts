import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function clearRateLimit() {
    try {
        // Clear all failed login attempts for navin
        const deleted = await prisma.failedLoginAttempt.deleteMany({
            where: {
                email: 'navin@gmail.com'
            }
        });

        console.log(`✓ Cleared ${deleted.count} failed login attempts for navin@gmail.com`);
        console.log('\nYou can now log in with:');
        console.log('  Email: navin@gmail.com');
        console.log('  Password: navin123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearRateLimit();
