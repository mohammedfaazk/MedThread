#!/usr/bin/env node

/**
 * Test script to verify newly registered routes are accessible
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

const routes = [
  '/api/v1/medications',
  '/api/v1/symptom-diary',
  '/api/v1/health-timeline',
  '/api/v1/health-challenges',
  '/api/v1/support-groups',
  '/api/v1/health-risk',
  '/api/v1/unique-features'
];

async function testRoute(route) {
  try {
    const response = await fetch(`${API_BASE}${route}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    // 401 or 403 means route exists but needs auth (good!)
    // 404 means route doesn't exist (bad!)
    if (status === 404) {
      console.log(`❌ ${route} - NOT FOUND (route not registered)`);
      return false;
    } else if (status === 401 || status === 403) {
      console.log(`✅ ${route} - EXISTS (requires auth)`);
      return true;
    } else if (status === 200) {
      console.log(`✅ ${route} - EXISTS (accessible)`);
      return true;
    } else {
      console.log(`⚠️  ${route} - Status ${status} ${statusText}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${route} - ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing newly registered routes...\n');
  console.log(`API Base: ${API_BASE}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    const result = await testRoute(route);
    if (result) passed++;
    else failed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${routes.length} routes accessible`);
  
  if (failed === 0) {
    console.log('✅ All routes registered successfully!');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} routes not found`);
    process.exit(1);
  }
}

main();
