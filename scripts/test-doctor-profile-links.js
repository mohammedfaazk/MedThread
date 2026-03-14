#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testDoctorProfileLinks() {
  console.log('🔍 Testing Doctor Profile Links...\n');

  // Check TopDoctorsWidget
  const topDoctorsWidgetPath = path.join(__dirname, '../apps/web/src/components/TopDoctorsWidget.tsx');
  const topDoctorsContent = fs.readFileSync(topDoctorsWidgetPath, 'utf8');
  
  if (topDoctorsContent.includes('href={`/u/${doctor.username}`}')) {
    console.log('✅ TopDoctorsWidget: Links to /u/ route (CORRECT)');
  } else if (topDoctorsContent.includes('href={`/doctor/${doctor.username}`}')) {
    console.log('❌ TopDoctorsWidget: Links to /doctor/ route (INCORRECT)');
  } else {
    console.log('⚠️  TopDoctorsWidget: Could not find doctor profile links');
  }

  // Check other key components
  const componentsToCheck = [
    {
      name: 'DiscoverDoctors',
      path: '../apps/web/src/components/follow/DiscoverDoctors.tsx',
      expectedPattern: 'href={`/u/${doctor.username}`}'
    },
    {
      name: 'TopDoctorsPage',
      path: '../apps/web/src/app/top-doctors/page.tsx',
      expectedPattern: 'href={`/u/${doctor.username}`}'
    }
  ];

  componentsToCheck.forEach(component => {
    try {
      const componentPath = path.join(__dirname, component.path);
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        if (content.includes(component.expectedPattern)) {
          console.log(`✅ ${component.name}: Links to /u/ route (CORRECT)`);
        } else if (content.includes('href={`/doctor/${doctor.username}`}')) {
          console.log(`❌ ${component.name}: Links to /doctor/ route (INCORRECT)`);
        } else {
          console.log(`⚠️  ${component.name}: Could not find doctor profile links`);
        }
      } else {
        console.log(`⚠️  ${component.name}: File not found`);
      }
    } catch (error) {
      console.log(`❌ ${component.name}: Error reading file - ${error.message}`);
    }
  });

  console.log('\n📋 Summary:');
  console.log('- /u/[username] route: Shows doctor profile with analytics stats (DoctorPublicStats)');
  console.log('- /doctor/[username] route: Shows detailed doctor profile with different metrics');
  console.log('- Both patients and doctors should see the /u/ route for consistency');
  console.log('\n🎯 Expected behavior: All doctor profile links should use /u/ route');
}

testDoctorProfileLinks();