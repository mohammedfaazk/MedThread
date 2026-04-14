import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

console.log('🔍 Database Connection Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('DIRECT_URL:', process.env.DIRECT_URL ? '✓ Set' : '✗ Not set');

if (process.env.DATABASE_URL) {
  // Mask password in URL for security
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log('Connection string:', maskedUrl);
}

// Test database connection
console.log('\n🔌 Testing Database Connection...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Connection successful!');
    
    // Test query
    console.log('\n📊 Testing Database Queries...');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`✓ Users table: ${userCount} records`);
    
    // Count posts
    const postCount = await prisma.post.count();
    console.log(`✓ Posts table: ${postCount} records`);
    
    // Count doctors
    const doctorCount = await prisma.user.count({
      where: { role: 'DOCTOR', isVerified: true }
    });
    console.log(`✓ Verified doctors: ${doctorCount} records`);
    
    // Count communities
    const communityCount = await prisma.community.count();
    console.log(`✓ Communities: ${communityCount} records`);
    
    console.log('\n✅ All database checks passed!');
    console.log('\n💡 Next Steps:');
    if (postCount === 0) {
      console.log('   - No posts found. Run seed script to add sample data');
      console.log('   - Command: npm run seed');
    }
    if (doctorCount === 0) {
      console.log('   - No verified doctors found. Run seed script or verify doctors manually');
    }
    
  } catch (error: any) {
    console.error('\n✗ Connection failed!');
    console.error('\n❌ Error Details:');
    console.error('Message:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n🔧 Possible Solutions:');
      console.error('   1. Database may be paused in Supabase');
      console.error('      → Go to https://supabase.com/dashboard');
      console.error('      → Resume/Restore your database');
      console.error('   2. Database credentials may be incorrect');
      console.error('      → Check your .env file');
      console.error('      → Get fresh credentials from Supabase dashboard');
      console.error('   3. Database may have been deleted');
      console.error('      → Create a new database in Supabase');
      console.error('      → Update .env with new credentials');
    } else if (error.message.includes('timeout')) {
      console.error('\n🔧 Possible Solutions:');
      console.error('   1. Network connectivity issues');
      console.error('      → Check your internet connection');
      console.error('      → Try disabling VPN/proxy');
      console.error('   2. Firewall blocking connection');
      console.error('      → Check firewall settings');
      console.error('      → Allow port 5432 for PostgreSQL');
    } else {
      console.error('\n🔧 General Solutions:');
      console.error('   1. Verify DATABASE_URL in .env file');
      console.error('   2. Check Supabase dashboard for database status');
      console.error('   3. Try using DIRECT_URL instead of DATABASE_URL');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(() => {
    console.log('\n' + '='.repeat(50));
    console.log('Diagnostic complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
