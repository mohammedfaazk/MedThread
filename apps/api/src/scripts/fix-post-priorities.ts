/**
 * Script to fix priorities for all existing posts
 * Run this to analyze and assign correct priorities to posts that have wrong or missing priorities
 */

import { prisma } from '@medthread/database';
import { postPriorityService } from '../services/post-priority.service';

async function fixPostPriorities() {
  console.log('🔍 Starting priority fix for all posts...\n');

  try {
    // Get all posts
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        priority: {
          select: {
            priorityLevel: true,
            urgencyScore: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${posts.length} posts to analyze\n`);

    let fixed = 0;
    let errors = 0;

    for (const post of posts) {
      try {
        const titleLower = post.title.toLowerCase();
        const contentLower = (post.content || '').toLowerCase();
        const combinedText = `${titleLower} ${contentLower}`;

        // Check if this is clearly a HIGH priority post
        const highPriorityKeywords = [
          'heart attack', 'chest pain', 'difficulty breathing', 'shortness of breath',
          'stroke', 'seizure', 'unconscious', 'severe bleeding', 'can\'t breathe',
          'cardiac arrest', 'severe pain', 'emergency', 'critical', 'life threatening',
          'suicidal', 'overdose', 'poisoning', 'anaphylaxis', 'choking'
        ];

        const hasHighPriorityKeyword = highPriorityKeywords.some(keyword => 
          combinedText.includes(keyword)
        );

        const currentPriority = post.priority?.priorityLevel;
        const currentScore = post.priority?.urgencyScore || 0;

        // If it has high priority keywords but is marked LOW or MEDIUM, fix it
        if (hasHighPriorityKeyword && currentPriority !== 'HIGH') {
          console.log(`🚨 FIXING: "${post.title}"`);
          console.log(`   Current: ${currentPriority || 'NONE'} (score: ${currentScore})`);
          
          const result = await postPriorityService.analyzePostPriority(
            post.id,
            post.title,
            post.content || ''
          );

          console.log(`   New: ${result.priorityLevel} (score: ${result.urgencyScore})`);
          console.log(`   Detected: ${result.detectedSymptoms.map(s => s.symptom).join(', ')}\n`);
          fixed++;
        } 
        // If it has no priority at all, analyze it
        else if (!post.priority) {
          console.log(`📝 Analyzing: "${post.title}"`);
          
          const result = await postPriorityService.analyzePostPriority(
            post.id,
            post.title,
            post.content || ''
          );

          console.log(`   Assigned: ${result.priorityLevel} (score: ${result.urgencyScore})\n`);
          fixed++;
        }
        // Otherwise, just log it
        else {
          console.log(`✅ OK: "${post.title}" - ${currentPriority} (${currentScore})`);
        }

      } catch (error) {
        console.error(`❌ Error analyzing post "${post.title}":`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Fixed/Analyzed: ${fixed} posts`);
    console.log(`❌ Errors: ${errors} posts`);
    console.log(`📊 Total: ${posts.length} posts`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixPostPriorities()
  .then(() => {
    console.log('\n✨ Priority fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
