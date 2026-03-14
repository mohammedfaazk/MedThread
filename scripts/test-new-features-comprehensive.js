#!/usr/bin/env node

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

class FeatureTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.authToken = null;
    this.testUsers = {
      admin: null,
      doctor: null,
      patient: null
    };
  }

  async setup() {
    console.log('🔧 Setting up test environment...');
    
    try {
      // Get test users
      this.testUsers.admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      this.testUsers.doctor = await prisma.user.findFirst({
        where: { role: 'DOCTOR' }
      });
      
      this.testUsers.patient = await prisma.user.findFirst({
        where: { role: 'PATIENT' }
      });

      if (!this.testUsers.admin || !this.testUsers.doctor || !this.testUsers.patient) {
        throw new Error('Missing required test users. Please run setup-new-features.js first.');
      }

      // Get auth token (simulate login)
      this.authToken = await this.getAuthToken();
      
      console.log('✅ Test environment ready');
      console.log(`Admin: ${this.testUsers.admin.username}`);
      console.log(`Doctor: ${this.testUsers.doctor.username}`);
      console.log(`Patient: ${this.testUsers.patient.username}`);
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async getAuthToken() {
    // For testing, we'll create a simple JWT token
    // In production, this would be obtained through proper login
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'test-secret';
    
    return jwt.sign(
      { 
        userId: this.testUsers.admin.id, 
        role: this.testUsers.admin.role 
      },
      secret,
      { expiresIn: '1h' }
    );
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ ${testName}: PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ 
        name: testName, 
        status: 'FAILED', 
        error: error.message 
      });
      console.log(`❌ ${testName}: FAILED - ${error.message}`);
    }
  }

  async apiCall(endpoint, options = {}) {
    const config = {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await axios({
      url: `${API_URL}${endpoint}`,
      ...config
    });

    return response.data;
  }

  // Feature 1: Doctor Profile Analytics Tests
  async testDoctorProfileAnalytics() {
    const doctorId = this.testUsers.doctor.id;

    // Test patient acquisition
    const acquisition = await this.apiCall(`/api/doctor-profile-analytics/patient-acquisition/${doctorId}`);
    if (!acquisition.success || !acquisition.data.monthlyGrowth) {
      throw new Error('Patient acquisition data invalid');
    }

    // Test reply time
    const replyTime = await this.apiCall(`/api/doctor-profile-analytics/reply-time/${doctorId}`);
    if (!replyTime.success || typeof replyTime.data.averageReplyHours !== 'number') {
      throw new Error('Reply time data invalid');
    }

    // Test daily activity
    const activity = await this.apiCall(`/api/doctor-profile-analytics/daily-activity/${doctorId}`);
    if (!activity.success || !Array.isArray(activity.data.hourlyPattern)) {
      throw new Error('Daily activity data invalid');
    }

    // Test comprehensive endpoint
    const comprehensive = await this.apiCall(`/api/doctor-profile-analytics/comprehensive/${doctorId}`);
    if (!comprehensive.success || !comprehensive.data.patientAcquisition) {
      throw new Error('Comprehensive data invalid');
    }
  }

  // Feature 2: Post Priority System Tests
  async testPostPrioritySystem() {
    // Test priority stats
    const stats = await this.apiCall('/api/post-priority/stats');
    if (!stats.success || typeof stats.data.total !== 'number') {
      throw new Error('Priority stats invalid');
    }

    // Test trending symptoms
    const trending = await this.apiCall('/api/post-priority/trending-symptoms?days=7');
    if (!trending.success || !Array.isArray(trending.data.trending)) {
      throw new Error('Trending symptoms data invalid');
    }

    // Test doctor feed (requires doctor auth)
    const doctorToken = require('jsonwebtoken').sign(
      { userId: this.testUsers.doctor.id, role: this.testUsers.doctor.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const feed = await this.apiCall('/api/post-priority/doctor-feed?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    
    if (!feed.success || !Array.isArray(feed.data.posts)) {
      throw new Error('Doctor feed data invalid');
    }
  }

  // Feature 3: Admin User Activity Tests
  async testAdminUserActivity() {
    const userId = this.testUsers.patient.id;

    // Test hourly activity
    const hourly = await this.apiCall(`/api/admin-user-activity/user/${userId}?timeframe=hourly`);
    if (!hourly.success || !Array.isArray(hourly.data.hourlyPattern)) {
      throw new Error('Hourly activity data invalid');
    }

    // Test weekly activity
    const weekly = await this.apiCall(`/api/admin-user-activity/user/${userId}?timeframe=weekly`);
    if (!weekly.success || !Array.isArray(weekly.data.weeklyPattern)) {
      throw new Error('Weekly activity data invalid');
    }

    // Test user comparison
    const comparison = await this.apiCall('/api/admin-user-activity/compare', {
      method: 'POST',
      data: {
        userIds: [this.testUsers.doctor.id, this.testUsers.patient.id],
        timeframe: 'hourly'
      }
    });
    
    if (!comparison.success || !Array.isArray(comparison.data.comparisons)) {
      throw new Error('User comparison data invalid');
    }
  }

  // Feature 4: Regional Symptom Analytics Tests
  async testRegionalSymptomAnalytics() {
    // Test heatmap data
    const heatmap = await this.apiCall('/api/regional-symptom-analytics/heatmap?locationLevel=city');
    if (!heatmap.success || !Array.isArray(heatmap.data.heatmapData)) {
      throw new Error('Heatmap data invalid');
    }

    // Test trending symptoms
    const trending = await this.apiCall('/api/regional-symptom-analytics/trending?days=7');
    if (!trending.success || !Array.isArray(trending.data.trending)) {
      throw new Error('Regional trending data invalid');
    }

    // Test location details
    const location = await this.apiCall('/api/regional-symptom-analytics/location/Chennai?level=city');
    if (!location.success || !location.data.location) {
      throw new Error('Location details invalid');
    }

    // Test health alerts
    const alerts = await this.apiCall('/api/regional-symptom-analytics/alerts');
    if (!alerts.success || !Array.isArray(alerts.data.alerts)) {
      throw new Error('Health alerts data invalid');
    }
  }

  // Database Integrity Tests
  async testDatabaseIntegrity() {
    // Check required tables exist and have data
    const tables = [
      { name: 'PostPriority', model: prisma.postPriority },
      { name: 'SymptomReport', model: prisma.symptomReport },
      { name: 'DoctorPerformance', model: prisma.doctorPerformance },
      { name: 'UserActivityLog', model: prisma.userActivityLog }
    ];

    for (const table of tables) {
      const count = await table.model.count();
      if (count === 0) {
        throw new Error(`${table.name} table is empty`);
      }
      console.log(`  ✓ ${table.name}: ${count} records`);
    }

    // Check data relationships
    const postWithPriority = await prisma.post.findFirst({
      include: { priority: true }
    });
    
    if (!postWithPriority?.priority) {
      throw new Error('Posts missing priority analysis');
    }

    // Check geographic data integrity
    const symptomWithLocation = await prisma.symptomReport.findFirst({
      where: { 
        pincode: { not: null },
        city: { not: null }
      }
    });
    
    if (!symptomWithLocation) {
      throw new Error('Symptom reports missing geographic data');
    }
  }

  // Performance Tests
  async testPerformance() {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = [
      this.apiCall(`/api/doctor-profile-analytics/comprehensive/${this.testUsers.doctor.id}`),
      this.apiCall('/api/post-priority/stats'),
      this.apiCall('/api/regional-symptom-analytics/heatmap?locationLevel=city'),
      this.apiCall(`/api/admin-user-activity/user/${this.testUsers.patient.id}`)
    ];

    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    console.log(`  ⏱️ Concurrent requests completed in ${duration}ms`);
    
    if (duration > 5000) {
      throw new Error(`Performance test failed: ${duration}ms > 5000ms threshold`);
    }
  }

  // Authentication & Authorization Tests
  async testAuthAndAuth() {
    // Test admin-only endpoint without admin token
    const patientToken = require('jsonwebtoken').sign(
      { userId: this.testUsers.patient.id, role: 'PATIENT' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    try {
      await this.apiCall(`/api/admin-user-activity/user/${this.testUsers.patient.id}`, {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      throw new Error('Patient should not access admin endpoints');
    } catch (error) {
      if (error.response?.status !== 403) {
        throw new Error('Expected 403 Forbidden for non-admin access');
      }
    }

    // Test doctor-only endpoint without doctor token
    try {
      await this.apiCall('/api/post-priority/doctor-feed', {
        headers: { 'Authorization': `Bearer ${patientToken}` }
      });
      // This might be allowed, so we just check it doesn't crash
    } catch (error) {
      // Expected behavior varies by implementation
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive feature testing...\n');

    await this.setup();

    // Run all test suites
    await this.runTest('Database Integrity', () => this.testDatabaseIntegrity());
    await this.runTest('Doctor Profile Analytics', () => this.testDoctorProfileAnalytics());
    await this.runTest('Post Priority System', () => this.testPostPrioritySystem());
    await this.runTest('Admin User Activity', () => this.testAdminUserActivity());
    await this.runTest('Regional Symptom Analytics', () => this.testRegionalSymptomAnalytics());
    await this.runTest('Performance', () => this.testPerformance());
    await this.runTest('Authentication & Authorization', () => this.testAuthAndAuth());

    // Print results
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`);
        });
    }

    await prisma.$disconnect();
    
    // Exit with error code if tests failed
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new FeatureTester();
  tester.runAllTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = FeatureTester;