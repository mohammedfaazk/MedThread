#!/usr/bin/env node

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

class QuickHealthCheck {
  constructor() {
    this.results = [];
  }

  async check(name, testFunction) {
    const startTime = Date.now();
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'PASS', duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      console.log(`❌ ${name} (${duration}ms) - ${error.message}`);
    }
  }

  async runHealthChecks() {
    console.log('🏥 Running quick health checks...\n');

    // 1. Database connectivity
    await this.check('Database Connection', async () => {
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.user.count();
      await prisma.$disconnect();
    });

    // 2. API server health
    await this.check('API Server Health', async () => {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error(`API health check failed: ${response.status}`);
      }
    });

    // 3. Web server accessibility
    await this.check('Web Server Health', async () => {
      const response = await axios.get(WEB_URL, { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error(`Web server not accessible: ${response.status}`);
      }
    });

    // 4. New API endpoints
    const endpoints = [
      '/api/doctor-profile-analytics/comprehensive/test-id',
      '/api/post-priority/stats',
      '/api/regional-symptom-analytics/heatmap',
      '/api/admin-user-activity/user/test-id'
    ];

    for (const endpoint of endpoints) {
      await this.check(`Endpoint: ${endpoint}`, async () => {
        try {
          const response = await axios.get(`${API_URL}${endpoint}`, { 
            timeout: 3000,
            validateStatus: (status) => status < 500 // Accept 4xx as valid (auth errors expected)
          });
          
          if (response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error('API server not running');
          }
          if (error.response?.status >= 500) {
            throw new Error(`Server error: ${error.response.status}`);
          }
          // 4xx errors are expected for endpoints requiring auth
        }
      });
    }

    // 5. Database tables
    const tables = ['PostPriority', 'SymptomReport', 'DoctorPerformance', 'UserActivityLog'];
    
    for (const table of tables) {
      await this.check(`Table: ${table}`, async () => {
        const prisma = new PrismaClient();
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        await prisma[modelName].count();
        await prisma.$disconnect();
      });
    }

    // 6. Test data existence
    await this.check('Test Data Availability', async () => {
      const prisma = new PrismaClient();
      
      const counts = {
        users: await prisma.user.count(),
        posts: await prisma.post.count(),
        priorities: await prisma.postPriority.count(),
        symptoms: await prisma.symptomReport.count()
      };
      
      await prisma.$disconnect();
      
      if (counts.users === 0) throw new Error('No users found');
      if (counts.posts === 0) throw new Error('No posts found');
      if (counts.priorities === 0) throw new Error('No priority data found');
      if (counts.symptoms === 0) throw new Error('No symptom data found');
    });

    // Print summary
    console.log('\n📊 Health Check Summary:');
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const avgDuration = Math.round(
      this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
    );

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️ Average response time: ${avgDuration}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed checks:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  • ${r.name}: ${r.error}`));
      
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Ensure API server is running: npm run dev:api');
      console.log('2. Ensure web server is running: npm run dev:web');
      console.log('3. Check database connection in .env file');
      console.log('4. Run setup script: node scripts/setup-new-features.js');
    } else {
      console.log('\n🎉 All health checks passed! System is ready.');
    }

    return failed === 0;
  }
}

// Run health checks if called directly
if (require.main === module) {
  const healthCheck = new QuickHealthCheck();
  healthCheck.runHealthChecks()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Health check crashed:', error);
      process.exit(1);
    });
}

module.exports = QuickHealthCheck;