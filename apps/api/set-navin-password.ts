import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setNavinPassword() {
    try {
        const password = 'navin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const updated = await prisma.user.update({
            where: { email: 'navin@gmail.com' },
            data: { passwordHash: hashedPassword }
        });

        console.log('✓ Password set successfully for navin@gmail.com');
        console.log('  Email: navin@gmail.com');
        console.log('  Password: navin123');
        console.log('\nYou can now log in with these credentials!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setNavinPassword();
