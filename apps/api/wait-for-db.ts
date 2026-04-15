import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    return false;
  }
}

async function waitForDatabase() {
  console.log('⏰ Waiting for circuit breaker to reset...\n');
  console.log('This usually takes 5-10 minutes.');
  console.log('Testing connection every 30 seconds...\n');
  
  let attempts = 0;
  const maxAttempts = 20; // 10 minutes
  
  while (attempts < maxAttempts) {
    attempts++;
    const elapsed = Math.floor(attempts * 0.5);
    
    process.stdout.write(`\r🔍 Attempt ${attempts}/${maxAttempts} (${elapsed} minutes elapsed)...`);
    
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n\n✅ DATABASE IS CONNECTED! 🎉');
      console.log('\nYou can now:');
      console.log('1. Test login at http://localhost:3000/login');
      console.log('2. Use credentials: admin@medthread.com / Admin@123');
      console.log('3. All 35 features should now work!\n');
      process.exit(0);
    }
    
    // Wait 30 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  console.log('\n\n⏰ Circuit breaker still active after 10 minutes.');
  console.log('Try resetting from Supabase dashboard or wait a bit longer.');
}

waitForDatabase();
