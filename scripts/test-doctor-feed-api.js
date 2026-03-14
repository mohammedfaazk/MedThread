#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function testDoctorFeedAPI() {
  console.log('🔍 Testing Doctor Feed API endpoint...\n');

  try {
    // Get a doctor user for authentication
    const doctor = await prisma.user.findFirst({
      where: { 
        email: 'doctor@medthread.com'
      }
    });

    if (!doctor) {
      console.log('❌ No doctor user found');
      return;
    }

    console.log(`👨‍⚕️ Using doctor: ${doctor.username} (${doctor.email})`);

    // Create a simple auth token (in real app this would come from login)
    // For testing, we'll simulate the token structure
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: doctor.id, 
        email: doctor.email, 
        role: doctor.role 
      }, 
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    console.log('🔑 Generated auth token\n');

    // Test the doctor feed API endpoint
    const response = await fetch(`${API_URL}/api/post-priority/doctor-feed?page=1&limit=5&priority=ALL`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 API Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Success:', data.success);
      
      if (data.success && data.data) {
        console.log(`📊 Posts returned: ${data.data.posts.length}`);
        console.log(`📈 Priority stats:`, data.data.priorityStats);
        
        console.log('\n📝 Posts with Priority Data:');
        console.log('================================');
        
        data.data.posts.forEach((post, index) => {
          const emoji = post.urgencyScore >= 7 ? '🔴' : post.urgencyScore >= 4 ? '🟡' : '🟢';
          console.log(`${emoji} Post ${index + 1}: "${post.title}"`);
          console.log(`   Author: ${post.author.username} (${post.author.role})`);
          console.log(`   Urgency Score: ${post.urgencyScore}`);
          console.log(`   Detected Symptoms: ${post.detectedSymptoms?.length || 0}`);
          console.log(`   Priority Badge: ${post.priorityBadge ? 'Yes' : 'No'}`);
          
          // Test the frontend condition
          const shouldShow = post.urgencyScore > 0 || post.detectedSymptoms?.length > 0;
          console.log(`   Should Show Badge: ${shouldShow}`);
          console.log('');
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDoctorFeedAPI().catch(console.error);