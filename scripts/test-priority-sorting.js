#!/usr/bin/env node

require('dotenv').config();
const API_URL = 'http://localhost:3001';

async function testPrioritySorting() {
  console.log('🔍 Testing Priority-Based Sorting on Main Feed...\n');

  try {
    // Test different sort options
    const sortOptions = ['hot', 'new', 'top'];
    
    for (const sort of sortOptions) {
      console.log(`📊 Testing "${sort}" sort with priority ordering:`);
      console.log('='.repeat(50));
      
      const response = await fetch(`${API_URL}/api/v1/posts?sort=${sort}&limit=10`);
      
      if (response.ok) {
        const posts = await response.json();
        
        posts.forEach((post, index) => {
          const priority = post.priority;
          const emoji = priority?.priorityLevel === 'HIGH' ? '🔴' : 
                        priority?.priorityLevel === 'MEDIUM' ? '🟡' : 
                        priority?.priorityLevel === 'LOW' ? '🟢' : '⚪';
          
          const urgencyScore = priority?.urgencyScore || 0;
          const authorRole = post.author.role;
          
          console.log(`${index + 1}. ${emoji} [Score: ${urgencyScore}] ${post.title.substring(0, 40)}...`);
          console.log(`   Author: ${post.author.username} (${authorRole})`);
          console.log(`   Created: ${new Date(post.createdAt).toLocaleString()}`);
          console.log('');
        });
        
        // Analyze sorting effectiveness
        const patientPosts = posts.filter(post => post.author.role === 'PATIENT');
        const urgencyScores = patientPosts.map(post => post.priority?.urgencyScore || 0);
        
        console.log(`📈 Sorting Analysis for "${sort}":`);
        console.log(`   Patient posts: ${patientPosts.length}`);
        console.log(`   Urgency scores: [${urgencyScores.join(', ')}]`);
        
        // Check if scores are in descending order
        const isSortedByPriority = urgencyScores.every((score, i) => 
          i === 0 || urgencyScores[i - 1] >= score
        );
        
        console.log(`   ✅ Sorted by priority: ${isSortedByPriority ? 'YES' : 'NO'}`);
        
        if (!isSortedByPriority) {
          console.log(`   ⚠️ Priority sorting may not be working correctly`);
        }
        
      } else {
        console.log(`❌ Error fetching posts with sort="${sort}"`);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // Test expected order
    console.log('🎯 Expected Order:');
    console.log('1. 🔴 HIGH priority posts (Score: 8) - Medical emergencies');
    console.log('2. 🟡 MEDIUM priority posts (Score: 5) - Moderate symptoms');
    console.log('3. 🟢 LOW priority posts (Score: 2) - Minor symptoms');
    console.log('4. ⚪ No priority posts (Score: 0) - Doctor posts, etc.');

  } catch (error) {
    console.error('❌ Error testing priority sorting:', error.message);
  }
}

testPrioritySorting().catch(console.error);