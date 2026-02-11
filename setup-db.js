const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up local database...');

try {
  // Run Prisma migrations
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate dev --name init', {
    cwd: path.join(__dirname, 'packages', 'database'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'postgresql://medthread:medthread_dev@localhost:5432/medthread' }
  });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\nPlease run these commands manually in PostgreSQL:');
  console.log('CREATE USER medthread WITH PASSWORD \'medthread_dev\';');
  console.log('CREATE DATABASE medthread OWNER medthread;');
  console.log('GRANT ALL PRIVILEGES ON DATABASE medthread TO medthread;');
  process.exit(1);
}
