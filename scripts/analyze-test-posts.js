#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function analyzeTestPosts() {
  console.log('🔍 Analyzing test posts for priority detection...\n');

  try {
    // Get recent posts that need analysis
    const posts = await prisma.post.findMany({
      where: {
        author: {
          role: 'PATIENT'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: true
      }
    });

    if (posts.length === 0) {
      console.log('❌ No patient posts found to analyze');
      return;
    }

    console.log(`📝 Found ${posts.length} posts to analyze\n`);

    // Get auth token for API calls (using doctor account)
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' }
    });

    if (!doctor) {
      console.log('❌ No doctor account found for authentication');
      return;
    }

    // Simulate auth token (in real app this would come from login)
    const authToken = 'mock-token-for-testing';

    for (const post of posts) {
      try {
        console.log(`🔍 Analyzing: "${post.title.substring(0, 50)}..."`);
        
        // Call the analyze API endpoint
        const response = await fetch(`${API_URL}/api/post-priority/analyze/${post.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`✅ Priority: ${result.data.priorityLevel} (Score: ${result.data.urgencyScore})`);
            if (result.data.detectedSymptoms.length > 0) {
              console.log(`   Symptoms: ${result.data.detectedSymptoms.map(s => s.symptom).join(', ')}`);
            }
          } else {
            console.log(`❌ Analysis failed: ${result.error}`);
          }
        } else {
          // If API is not running, analyze directly with database
          console.log(`⚠️ API not available, analyzing directly...`);
          await analyzePostDirectly(post);
        }
        
      } catch (error) {
        console.log(`⚠️ Error analyzing post ${post.id}: ${error.message}`);
        // Fallback to direct analysis
        await analyzePostDirectly(post);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Analysis complete! Check your doctor feed at /doctor-feed');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function analyzePostDirectly(post) {
  try {
    const combinedText = `${post.title} ${post.content}`.toLowerCase();
    
    // Simple symptom detection
    const highSymptoms = ['chest pain', 'difficulty breathing', 'severe', 'urgent', 'emergency', 'stroke', 'heart attack', 'high fever'];
    const mediumSymptoms = ['persistent', 'cough', 'fatigue', 'headache', 'joint pain', 'nausea'];
    const lowSymptoms = ['cold', 'sneezing', 'runny nose', 'vitamin', 'wellness', 'mild'];
    
    let priorityLevel = 'LOW';
    let urgencyScore = 0;
    let detectedSymptoms = [];
    
    // Check for high priority symptoms
    for (const symptom of highSymptoms) {
      if (combinedText.includes(symptom)) {
        priorityLevel = 'HIGH';
        urgencyScore = Math.max(urgencyScore, 8);
        detectedSymptoms.push({ symptom, weight: 8, category: 'HIGH' });
      }
    }
    
    // Check for medium priority symptoms
    if (priorityLevel !== 'HIGH') {
      for (const symptom of mediumSymptoms) {
        if (combinedText.includes(symptom)) {
          priorityLevel = 'MEDIUM';
          urgencyScore = Math.max(urgencyScore, 5);
          detectedSymptoms.push({ symptom, weight: 5, category: 'MEDIUM' });
        }
      }
    }
    
    // Check for low priority symptoms
    if (priorityLevel === 'LOW') {
      for (const symptom of lowSymptoms) {
        if (combinedText.includes(symptom)) {
          urgencyScore = Math.max(urgencyScore, 2);
          detectedSymptoms.push({ symptom, weight: 2, category: 'LOW' });
        }
      }
    }
    
    // Store in database
    await prisma.postPriority.upsert({
      where: { postId: post.id },
      create: {
        postId: post.id,
        priorityLevel,
        urgencyScore,
        detectedSymptoms: detectedSymptoms
      },
      update: {
        priorityLevel,
        urgencyScore,
        detectedSymptoms: detectedSymptoms
      }
    });
    
    console.log(`✅ Direct analysis: ${priorityLevel} (Score: ${urgencyScore})`);
    if (detectedSymptoms.length > 0) {
      console.log(`   Symptoms: ${detectedSymptoms.map(s => s.symptom).join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Direct analysis failed: ${error.message}`);
  }
}

analyzeTestPosts().catch(console.error);