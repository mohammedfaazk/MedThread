#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function testMainFeedPriority() {
  console.log('🔍 Testing Main Feed Priority Labels...\n');

  try {
    // Test the main posts API endpoint
    console.log('📡 Testing main posts API endpoint...');
    const response = await fetch(`${API_URL}/api/v1/posts?limit=5`);
    
    console.log(`📊 API Response Status: ${response.status}`);
    
    if (response.ok) {
      const posts = await response.json();
      console.log(`✅ Posts returned: ${posts.length}`);
      
      console.log('\n📝 Posts with Priority Data:');
      console.log('================================');
      
      posts.forEach((post, index) => {
        const priority = post.priority;
        const emoji = priority?.priorityLevel === 'HIGH' ? '🔴' : 
                      priority?.priorityLevel === 'MEDIUM' ? '🟡' : 
                      priority?.priorityLevel === 'LOW' ? '🟢' : '⚪';
        
        console.log(`${emoji} Post ${index + 1}: "${post.title}"`);
        console.log(`   Author: ${post.author.username} (${post.author.role})`);
        console.log(`   Priority Data: ${priority ? 'Yes' : 'No'}`);
        
        if (priority) {
          console.log(`   Priority Level: ${priority.priorityLevel}`);
          console.log(`   Urgency Score: ${priority.urgencyScore}`);
          console.log(`   Detected Symptoms: ${priority.detectedSymptoms?.length || 0}`);
        }
        console.log('');
      });
      
      // Check if patient posts have priority data
      const patientPosts = posts.filter(post => post.author.role === 'PATIENT');
      const patientPostsWithPriority = patientPosts.filter(post => post.priority);
      
      console.log(`📊 Summary:`);
      console.log(`   Total posts: ${posts.length}`);
      console.log(`   Patient posts: ${patientPosts.length}`);
      console.log(`   Patient posts with priority: ${patientPostsWithPriority.length}`);
      
      if (patientPosts.length > 0 && patientPostsWithPriority.length === 0) {
        console.log('\n⚠️ No patient posts have priority data!');
        console.log('   This means priority analysis may not be running automatically.');
        console.log('   Try running: node scripts/analyze-test-posts.js');
      } else if (patientPostsWithPriority.length > 0) {
        console.log('\n✅ Priority system is working!');
        console.log('   Patient posts have priority data and should show badges on the main feed.');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }

    // Also check database directly
    console.log('\n🔍 Checking database directly...');
    const dbPosts = await prisma.post.findMany({
      where: {
        author: { role: 'PATIENT' }
      },
      include: {
        author: { select: { username: true, role: true } },
        priority: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 Database check: ${dbPosts.length} patient posts found`);
    const withPriority = dbPosts.filter(post => post.priority);
    console.log(`📊 Posts with priority in DB: ${withPriority.length}`);

  } catch (error) {
    console.error('❌ Error testing main feed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMainFeedPriority().catch(console.error);