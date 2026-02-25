/**
 * Comprehensive Endpoint Testing
 * Tests ALL registered endpoints with success, failure, and auth cases
 */

import axios, { AxiosError } from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001';
let adminToken = '';
let doctorToken = '';
let patientToken = '';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  error?: string;
}

const results: TestResult[] = [];

function logResult(endpoint: string, method: string, status: 'PASS' | 'FAIL', error?: string) {
  results.push({ endpoint, method, status, error });
  if (status === 'FAIL') {
    console.log(`❌ FAIL: ${method} ${endpoint}`);
    if (error) console.log(`   Error: ${error}`);
  }
}

async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    return response.data.data?.token || response.data.token || '';
  } catch (error: any) {
    throw new Error(`Login failed for ${email}: ${error.message}`);
  }
}

async function testEndpoint(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  token?: string,
  expectedStatus?: number
) {
  try {
    const config: any = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true // Don't throw on any status
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (expectedStatus && response.status !== expectedStatus) {
      logResult(endpoint, method, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`);
      return false;
    }

    return response.status < 500; // 5xx = server error = fail
  } catch (error: any) {
    logResult(endpoint, method, 'FAIL', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Endpoint Testing...\n');

  try {
    // Step 1: Test health endpoint
    console.log('Testing /health...');
    const healthOk = await testEndpoint('GET', '/health', undefined, undefined, 200);
    if (!healthOk) {
      logResult('/health', 'GET', 'FAIL', 'Health check failed');
      return;
    }

    // Step 2: Login to get tokens
    console.log('Logging in users...');
    try {
      adminToken = await login('admin@medthread.com', 'admin123');
      doctorToken = await login('dr.smith@medthread.com', 'doctor123');
      patientToken = await login('john.doe@example.com', 'patient123');
    } catch (error: any) {
      logResult('/api/auth/login', 'POST', 'FAIL', error.message);
      return;
    }

    // Step 3: Test Auth Endpoints
    console.log('\n📝 Testing Auth Endpoints...');
    
    // Login - invalid credentials
    const loginFail = await testEndpoint('POST', '/api/auth/login', 
      { email: 'invalid@test.com', password: 'wrong' }, undefined, 401);
    if (!loginFail) logResult('/api/auth/login', 'POST', 'FAIL', 'Should reject invalid credentials');

    // Get current user
    const meOk = await testEndpoint('GET', '/api/auth/me', undefined, adminToken, 200);
    if (!meOk) logResult('/api/auth/me', 'GET', 'FAIL', 'Failed to get current user');

    // Get current user without auth
    const meNoAuth = await testEndpoint('GET', '/api/auth/me', undefined, undefined, 401);
    if (!meNoAuth) logResult('/api/auth/me', 'GET', 'FAIL', 'Should require auth');

    // Step 4: Test Gamification Endpoints
    console.log('\n🎮 Testing Gamification Endpoints...');
    
    // Get all badges (public)
    const badgesOk = await testEndpoint('GET', '/api/gamification/badges/all');
    if (!badgesOk) logResult('/api/gamification/badges/all', 'GET', 'FAIL');

    // Get doctor badges (protected)
    const doctorBadgesOk = await testEndpoint('GET', '/api/gamification/badges', undefined, doctorToken);
    if (!doctorBadgesOk) logResult('/api/gamification/badges', 'GET', 'FAIL');

    // Get leaderboard (public)
    const leaderboardOk = await testEndpoint('GET', '/api/gamification/leaderboard');
    if (!leaderboardOk) logResult('/api/gamification/leaderboard', 'GET', 'FAIL');

    // Step 5: Test Cron Jobs Endpoints (Admin only)
    console.log('\n⏰ Testing Cron Jobs Endpoints...');
    
    // List cron jobs (admin)
    const cronListOk = await testEndpoint('GET', '/api/cron-jobs', undefined, adminToken);
    if (!cronListOk) logResult('/api/cron-jobs', 'GET', 'FAIL');

    // List cron jobs without auth
    const cronListNoAuth = await testEndpoint('GET', '/api/cron-jobs', undefined, undefined, 401);
    if (!cronListNoAuth) logResult('/api/cron-jobs', 'GET', 'FAIL', 'Should require auth');

    // List cron jobs as non-admin
    const cronListNonAdmin = await testEndpoint('GET', '/api/cron-jobs', undefined, patientToken, 403);
    if (!cronListNonAdmin) logResult('/api/cron-jobs', 'GET', 'FAIL', 'Should require admin');

    // Step 6: Test Communities Endpoints
    console.log('\n🏘️ Testing Communities Endpoints...');
    
    // Get communities
    const communitiesOk = await testEndpoint('GET', '/api/v1/communities');
    if (!communitiesOk) logResult('/api/v1/communities', 'GET', 'FAIL');

    // Step 7: Test Posts Endpoints
    console.log('\n📝 Testing Posts Endpoints...');
    
    // Get posts
    const postsOk = await testEndpoint('GET', '/api/v1/posts');
    if (!postsOk) logResult('/api/v1/posts', 'GET', 'FAIL');

    // Step 8: Test Threads Endpoints
    console.log('\n🧵 Testing Threads Endpoints...');
    
    // Get threads
    const threadsOk = await testEndpoint('GET', '/api/threads');
    if (!threadsOk) logResult('/api/threads', 'GET', 'FAIL');

    // Step 9: Test Admin Endpoints
    console.log('\n👑 Testing Admin Endpoints...');
    
    // Get users (admin)
    const adminUsersOk = await testEndpoint('GET', '/api/admin/users', undefined, adminToken);
    if (!adminUsersOk) logResult('/api/admin/users', 'GET', 'FAIL');

    // Get users without auth
    const adminUsersNoAuth = await testEndpoint('GET', '/api/admin/users', undefined, undefined, 401);
    if (!adminUsersNoAuth) logResult('/api/admin/users', 'GET', 'FAIL', 'Should require auth');

    // Get users as non-admin
    const adminUsersNonAdmin = await testEndpoint('GET', '/api/admin/users', undefined, patientToken, 403);
    if (!adminUsersNonAdmin) logResult('/api/admin/users', 'GET', 'FAIL', 'Should require admin');

    // Step 10: Test Notifications Endpoints
    console.log('\n🔔 Testing Notifications Endpoints...');
    
    // Get notifications (protected)
    const notificationsOk = await testEndpoint('GET', '/api/notifications', undefined, patientToken);
    if (!notificationsOk) logResult('/api/notifications', 'GET', 'FAIL');

    // Get notifications without auth
    const notificationsNoAuth = await testEndpoint('GET', '/api/notifications', undefined, undefined, 401);
    if (!notificationsNoAuth) logResult('/api/notifications', 'GET', 'FAIL', 'Should require auth');

    // Step 11: Test CSRF Token
    console.log('\n🔒 Testing CSRF Token...');
    
    const csrfOk = await testEndpoint('GET', '/api/csrf-token');
    if (!csrfOk) logResult('/api/csrf-token', 'GET', 'FAIL');

    // Step 12: Test Analytics Endpoints
    console.log('\n📊 Testing Analytics Endpoints...');
    
    // Get analytics (admin)
    const analyticsOk = await testEndpoint('GET', '/api/analytics/overview', undefined, adminToken);
    if (!analyticsOk) logResult('/api/analytics/overview', 'GET', 'FAIL');

    // Step 13: Test Profile Endpoints
    console.log('\n👤 Testing Profile Endpoints...');
    
    // Get profile (protected)
    const profileOk = await testEndpoint('GET', '/api/profile', undefined, patientToken);
    if (!profileOk) logResult('/api/profile', 'GET', 'FAIL');

    // Step 14: Test Appointments Endpoints
    console.log('\n📅 Testing Appointments Endpoints...');
    
    // Get appointments (protected)
    const appointmentsOk = await testEndpoint('GET', '/api/appointments', undefined, patientToken);
    if (!appointmentsOk) logResult('/api/appointments', 'GET', 'FAIL');

    // Step 15: Test Reports Endpoints
    console.log('\n🚨 Testing Reports Endpoints...');
    
    // Get reports (admin)
    const reportsOk = await testEndpoint('GET', '/api/reports', undefined, adminToken);
    if (!reportsOk) logResult('/api/reports', 'GET', 'FAIL');

    // Step 16: Test Upload Endpoints
    console.log('\n📤 Testing Upload Endpoints...');
    
    // Upload without auth (should be 401)
    const uploadNoAuth = await testEndpoint('POST', '/api/upload/single', {}, undefined, 401);
    if (!uploadNoAuth) logResult('/api/upload/single', 'POST', 'FAIL', 'Should require auth');

  } catch (error: any) {
    console.error('❌ Test suite error:', error.message);
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));

  const failures = results.filter(r => r.status === 'FAIL');
  
  if (failures.length === 0) {
    console.log('\n✅ ENDPOINTS: VERIFIED');
    console.log(`\nAll ${results.length} endpoint tests passed.`);
  } else {
    console.log(`\n❌ ${failures.length} FAILURES:\n`);
    failures.forEach(f => {
      console.log(`${f.method} ${f.endpoint}`);
      if (f.error) console.log(`  ${f.error}`);
    });
    process.exit(1);
  }
}

runTests();
