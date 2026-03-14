#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDoctorFeedData() {
  console.log('🔍 Testing doctor feed data structure...\n');

  try {
    // Get posts with priority data like the doctor feed does
    const posts = await prisma.post.findMany({
      where: {
        author: {
          role: 'PATIENT' // Only show patient posts in doctor feed
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            icon: true,
          }
        },
        priority: true,
        _count: {
          select: {
            comments: true,
            votes: true,
          }
        }
      },
      orderBy: [
        { priority: { urgencyScore: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: 5
    });

    console.log(`📝 Found ${posts.length} posts\n`);

    posts.forEach((post, index) => {
      console.log(`Post ${index + 1}: "${post.title}"`);
      console.log(`  Author: ${post.author.username} (${post.author.role})`);
      console.log(`  Priority Data:`, post.priority ? {
        level: post.priority.priorityLevel,
        score: post.priority.urgencyScore,
        symptoms: post.priority.detectedSymptoms
      } : 'None');
      
      // Test the condition from doctor feed
      const hasUrgencyScore = post.priority?.urgencyScore > 0;
      const hasSymptoms = post.priority?.detectedSymptoms?.length > 0;
      const shouldShowBadge = hasUrgencyScore || hasSymptoms;
      
      console.log(`  Should show badge: ${shouldShowBadge} (urgencyScore: ${hasUrgencyScore}, symptoms: ${hasSymptoms})`);
      console.log('');
    });

    // Also check the formatted data structure
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      urgencyScore: post.priority?.urgencyScore || 0,
      detectedSymptoms: post.priority?.detectedSymptoms || [],
      priorityBadge: post.priority ? {
        emoji: post.priority.priorityLevel === 'HIGH' ? '🔴' : 
               post.priority.priorityLevel === 'MEDIUM' ? '🟡' : '🟢',
        label: post.priority.priorityLevel
      } : null
    }));

    console.log('📊 Formatted data structure:');
    console.log(JSON.stringify(formattedPosts, null, 2));

  } catch (error) {
    console.error('❌ Error testing doctor feed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDoctorFeedData().catch(console.error);