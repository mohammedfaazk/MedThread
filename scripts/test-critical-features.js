#!/usr/bin/env node

/**
 * Test Script for Critical Features
 * Tests medical disclaimers and emergency detection
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Test emergency detection keywords
const testCases = [
  {
    name: 'IMMEDIATE - Suicide',
    content: 'I want to kill myself and end my life',
    expectedLevel: 'IMMEDIATE',
    shouldAlert: true
  },
  {
    name: 'IMMEDIATE - Chest Pain',
    content: 'I am having severe chest pain and cant breathe',
    expectedLevel: 'IMMEDIATE',
    shouldAlert: true
  },
  {
    name: 'MENTAL_HEALTH - Self Harm',
    content: 'I have been cutting myself and having suicidal thoughts',
    expectedLevel: 'MENTAL_HEALTH',
    shouldAlert: true
  },
  {
    name: 'HIGH - Severe Pain',
    content: 'I have severe abdominal pain and high fever',
    expectedLevel: 'HIGH',
    shouldAlert: false
  },
  {
    name: 'NORMAL - Regular Symptoms',
    content: 'I have a mild headache and feeling tired',
    expectedLevel: null,
    shouldAlert: false
  }
];

async function testEmergencyDetection() {
  section('🚨 Testing Emergency Detection System');

  // Import the service directly
  try {
    const { emergencyDetectionService } = require('../apps/api/src/services/emergency-detection.service');
    
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      log(`\nTest: ${testCase.name}`, 'blue');
      log(`Content: "${testCase.content}"`, 'yellow');

      const result = emergencyDetectionService.detectEmergency(testCase.content);

      log(`Detected Level: ${result.level || 'NONE'}`, 'cyan');
      log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, 'cyan');
      log(`Keywords: ${result.matchedKeywords.join(', ') || 'none'}`, 'cyan');

      // Verify expected level
      if (result.level === testCase.expectedLevel) {
        log('✅ Level detection: PASS', 'green');
        passed++;
      } else {
        log(`❌ Level detection: FAIL (expected ${testCase.expectedLevel}, got ${result.level})`, 'red');
        failed++;
      }

      // Verify alert decision
      const shouldAlert = emergencyDetectionService.shouldShowEmergencyAlert(result);
      if (shouldAlert === testCase.shouldAlert) {
        log('✅ Alert decision: PASS', 'green');
        passed++;
      } else {
        log(`❌ Alert decision: FAIL (expected ${testCase.shouldAlert}, got ${shouldAlert})`, 'red');
        failed++;
      }
    }

    log(`\n📊 Results: ${passed} passed, ${failed} failed`, failed > 0 ? 'red' : 'green');
    return failed === 0;

  } catch (error) {
    log(`❌ Error testing emergency detection: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  section('🔌 Testing API Endpoints');

  try {
    // Test health endpoint
    log('Testing API health endpoint...', 'blue');
    const healthResponse = await axios.get(`${API_URL}/health`);
    
    if (healthResponse.status === 200) {
      log('✅ API is running', 'green');
      return true;
    } else {
      log('❌ API health check failed', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ API not accessible: ${error.message}`, 'red');
    log('Make sure the API is running on port 3001', 'yellow');
    return false;
  }
}

async function testWebPages() {
  section('🌐 Testing Web Pages');

  const pages = [
    { url: `${WEB_URL}`, name: 'Homepage' },
    { url: `${WEB_URL}/terms`, name: 'Terms of Service' },
    { url: `${WEB_URL}/signup`, name: 'Signup Page' },
    { url: `${WEB_URL}/doctor-feed`, name: 'Doctor Feed' }
  ];

  let passed = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      log(`\nTesting ${page.name}...`, 'blue');
      const response = await axios.get(page.url, { timeout: 5000 });
      
      if (response.status === 200) {
        log(`✅ ${page.name}: Accessible`, 'green');
        passed++;
      } else {
        log(`❌ ${page.name}: Status ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        log(`❌ ${page.name}: Web server not running`, 'red');
      } else {
        log(`⚠️  ${page.name}: ${error.message}`, 'yellow');
      }
      failed++;
    }
  }

  log(`\n📊 Results: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
  return failed === 0;
}

async function checkFileExists(filePath) {
  const fs = require('fs');
  const path = require('path');
  
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

async function testFileStructure() {
  section('📁 Testing File Structure');

  const requiredFiles = [
    'apps/web/src/components/MedicalDisclaimer.tsx',
    'apps/web/src/components/EmergencyAlert.tsx',
    'apps/web/src/app/terms/page.tsx',
    'apps/api/src/constants/emergency-keywords.ts',
    'apps/api/src/services/emergency-detection.service.ts'
  ];

  let passed = 0;
  let failed = 0;

  for (const file of requiredFiles) {
    const exists = await checkFileExists(file);
    if (exists) {
      log(`✅ ${file}`, 'green');
      passed++;
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      failed++;
    }
  }

  log(`\n📊 Results: ${passed} passed, ${failed} failed`, failed > 0 ? 'red' : 'green');
  return failed === 0;
}

async function runAllTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     MedThread Critical Features Test Suite                ║', 'cyan');
  log('║     Testing Medical Disclaimers & Emergency Detection     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    fileStructure: await testFileStructure(),
    emergencyDetection: await testEmergencyDetection(),
    apiEndpoints: await testAPIEndpoints(),
    webPages: await testWebPages()
  };

  section('📊 Final Results');

  const allPassed = Object.values(results).every(r => r === true);

  log('File Structure:       ' + (results.fileStructure ? '✅ PASS' : '❌ FAIL'), results.fileStructure ? 'green' : 'red');
  log('Emergency Detection:  ' + (results.emergencyDetection ? '✅ PASS' : '❌ FAIL'), results.emergencyDetection ? 'green' : 'red');
  log('API Endpoints:        ' + (results.apiEndpoints ? '✅ PASS' : '❌ FAIL'), results.apiEndpoints ? 'green' : 'red');
  log('Web Pages:            ' + (results.webPages ? '✅ PASS' : '⚠️  PARTIAL'), results.webPages ? 'green' : 'yellow');

  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    log('🎉 ALL TESTS PASSED! Critical features are working correctly.', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED. Please review the results above.', 'yellow');
  }

  console.log('='.repeat(60) + '\n');

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
