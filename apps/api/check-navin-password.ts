import { PrismaClient } from '@medthread/database';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkNavinPassword() {
    try {
        const navin = await prisma.user.findFirst({
            where: { email: 'navin@gmail.com' }
        });

        if (!navin) {
            console.log('Navin user not found');
            return;
        }

        console.log('Navin user found:');
        console.log('  ID:', navin.id);
        console.log('  Email:', navin.email);
        console.log('  Username:', navin.username);
        console.log('  Role:', navin.role);
        console.log('  Password hash:', navin.password?.slice(0, 20) + '...');
        
        // Test common passwords
        const testPasswords = ['password', 'navin123', '123456', 'navin', 'Password123'];
        
        console.log('\nTesting common passwords:');
        for (const pwd of testPasswords) {
            if (navin.password) {
                const match = await bcrypt.compare(pwd, navin.password);
                if (match) {
                    console.log(`  ✓ Password is: "${pwd}"`);
                    return;
                }
            }
        }
        
        console.log('  ✗ None of the common passwords matched');
        console.log('\nYou can reset the password by running: npx tsx reset-navin-password.ts');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNavinPassword();
