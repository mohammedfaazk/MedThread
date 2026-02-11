const { Client } = require('pg');

// Test different connection strings
const connections = [
  {
    name: 'Correct Pooler Connection',
    connectionString: 'postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
  },
  {
    name: 'Pooler Port 6543',
    connectionString: 'postgresql://postgres.lfjqtefsfhkzlzixleee:MedthreadDev@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`   URL: ${config.connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  const client = new Client({
    connectionString: config.connectionString,
    ssl: config.connectionString.includes('sslmode=no-verify') 
      ? { rejectUnauthorized: false }
      : config.connectionString.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('   ✅ Connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log(`   📊 PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    if (error.code) console.log(`   Error code: ${error.code}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Supabase Database Connections...\n');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  
  for (const config of connections) {
    const success = await testConnection(config);
    if (success) successCount++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 Results: ${successCount}/${connections.length} connections successful`);
  
  if (successCount === 0) {
    console.log('\n⚠️  All connections failed. Possible issues:');
    console.log('   1. Incorrect password');
    console.log('   2. Firewall blocking Supabase');
    console.log('   3. Database paused/unavailable');
    console.log('   4. Network restrictions');
    console.log('\n💡 Please check your Supabase dashboard:');
    console.log('   https://supabase.com/dashboard/project/lfjqtefsfhkzlzixleee/settings/database');
  }
}

runTests().catch(console.error);
