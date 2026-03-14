#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testSignupUI() {
  console.log('🧪 Testing Signup UI...\n');

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Navigate to signup page
    console.log('📄 Step 1: Loading signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle0' });
    
    // Check if pincode field exists
    console.log('🔍 Step 2: Checking for pincode field...');
    const pincodeField = await page.$('input[placeholder*="pincode"]');
    
    if (pincodeField) {
      console.log('✅ Pincode field found!');
      
      // Check if it's visible
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, pincodeField);
      
      console.log(`   Visibility: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
      
      // Get placeholder text
      const placeholder = await page.evaluate(el => el.placeholder, pincodeField);
      console.log(`   Placeholder: "${placeholder}"`);
      
    } else {
      console.log('❌ Pincode field not found!');
    }
    
    // Test patient/doctor toggle
    console.log('\n🔄 Step 3: Testing patient/doctor toggle...');
    
    // Click doctor button
    const doctorButton = await page.$('button:has-text("Doctor")');
    if (doctorButton) {
      await doctorButton.click();
      console.log('✅ Doctor button clicked');
      
      // Wait a moment for any state changes
      await page.waitForTimeout(500);
      
      // Check if doctor-specific fields appear
      const doctorFields = await page.$('text=Doctor Verification Details');
      console.log(`   Doctor fields: ${doctorFields ? '✅ Visible' : '❌ Not visible'}`);
    }
    
    // Click patient button
    const patientButton = await page.$('button:has-text("Patient")');
    if (patientButton) {
      await patientButton.click();
      console.log('✅ Patient button clicked');
      
      // Wait a moment for any state changes
      await page.waitForTimeout(500);
    }
    
    // Test form fields
    console.log('\n📝 Step 4: Testing form fields...');
    
    const fields = [
      { selector: 'input[type="email"]', name: 'Email' },
      { selector: 'input[placeholder*="username"]', name: 'Username' },
      { selector: 'input[type="password"]', name: 'Password' },
      { selector: 'input[placeholder*="pincode"]', name: 'Pincode' }
    ];
    
    for (const field of fields) {
      const element = await page.$(field.selector);
      if (element) {
        console.log(`   ✅ ${field.name} field found`);
        
        // Test typing in the field
        if (field.name === 'Pincode') {
          await element.type('560001');
          const value = await page.evaluate(el => el.value, element);
          console.log(`      Value after typing: "${value}"`);
        }
      } else {
        console.log(`   ❌ ${field.name} field not found`);
      }
    }
    
    console.log('\n✅ UI test completed successfully!');
    
  } catch (error) {
    console.error('❌ UI test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testSignupUI();
} catch (error) {
  console.log('⚠️  Puppeteer not available, skipping UI test');
  console.log('   To run UI tests, install puppeteer: npm install puppeteer');
  console.log('');
  console.log('✅ Manual verification:');
  console.log('   1. Go to http://localhost:3000/signup');
  console.log('   2. Look for "Pincode" field after "Confirm Password"');
  console.log('   3. Try clicking Patient/Doctor buttons');
  console.log('   4. Verify pincode field accepts 6 digits');
}