import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful! Found ${userCount} users.`);
    
    // Try to find admin user
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@medthread.com' }
    });
    
    if (admin) {
      console.log('✅ Admin user found:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
    } else {
      console.log('⚠️  Admin user not found');
    }
    
    await prisma.$disconnect();
    console.log('\n🎉 Database is working perfectly!');
    
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('Circuit breaker')) {
      console.log('\n⏰ Circuit breaker is still active. Wait 5-10 minutes and try again.');
    }
    process.exit(1);
  }
}

testConnection();
