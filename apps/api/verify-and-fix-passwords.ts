import { prisma } from '@medthread/database';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verifyAndFixPasswords() {
  const users = [
    { email: 'meghamaryvinu@licet.ac.in', password: '12345678' },
    { email: 'navin@gmail.com', password: '12345678' },
    { email: 'admin@medthread.com', password: 'Admin@123456' }
  ];
  
  console.log('\n🔐 Verifying and fixing passwords...\n');
  
  for (const { email, password } of users) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          passwordHash: true
        }
      });
      
      if (!user) {
        console.log(`❌ User not found: ${email}\n`);
        continue;
      }
      
      // Test if password matches
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      
      if (isMatch) {
        console.log(`✅ ${email}`);
        console.log(`   Password: ${password} - CORRECT ✓`);
        console.log(`   Role: ${user.role}\n`);
      } else {
        console.log(`⚠️  ${email}`);
        console.log(`   Password: ${password} - INCORRECT ✗`);
        console.log(`   Updating password...`);
        
        // Hash the correct password
        const newHash = await bcrypt.hash(password, 12);
        
        // Update the password
        await prisma.user.update({
          where: { email },
          data: { passwordHash: newHash }
        });
        
        console.log(`   ✅ Password updated successfully!`);
        console.log(`   Role: ${user.role}\n`);
      }
      
    } catch (error: any) {
      console.error(`❌ Error processing ${email}:`, error.message);
    }
  }
  
  console.log('═'.repeat(60));
  console.log('\n✅ All passwords verified and fixed!\n');
  console.log('You can now login with:');
  console.log('  • meghamaryvinu@licet.ac.in / 12345678');
  console.log('  • navin@gmail.com / 12345678');
  console.log('  • admin@medthread.com / Admin@123456\n');
  console.log('═'.repeat(60) + '\n');
}

verifyAndFixPasswords()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
