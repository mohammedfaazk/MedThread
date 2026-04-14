import { Router } from 'express';
import { prisma } from '@medthread/database';
import { postPriorityService } from '../services/post-priority.service';

export const analyzeAllPostsRouter = Router();

/**
 * GET /api/analyze-all-posts
 * Immediately analyze ALL posts and return results
 * This is a one-time fix to populate priorities
 */
analyzeAllPostsRouter.get('/', async (req, res) => {
  try {
    console.log('[Analyze All] Starting immediate analysis of all posts...');
    
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

    console.log(`[Analyze All] Found ${posts.length} posts`);

    const results = [];
    let analyzed = 0;
    let skipped = 0;
    let errors = 0;

    for (const post of posts) {
      try {
        // Always re-analyze to ensure correct priority
        console.log(`[Analyze All] Analyzing: "${post.title}"`);
        
        const result = await postPriorityService.analyzePostPriority(
          post.id,
          post.title,
          post.content || ''
        );

        console.log(`[Analyze All] ✅ ${result.priorityLevel} (${result.urgencyScore}) - "${post.title}"`);
        
        results.push({
          id: post.id,
          title: post.title,
          oldPriority: post.priority?.priorityLevel || 'NONE',
          newPriority: result.priorityLevel,
          score: result.urgencyScore,
          symptoms: result.detectedSymptoms.map(s => s.symptom)
        });
        
        analyzed++;
      } catch (error) {
        console.error(`[Analyze All] ❌ Error analyzing "${post.title}":`, error);
        errors++;
      }
    }

    console.log('[Analyze All] Complete!');
    console.log(`  Analyzed: ${analyzed}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);

    res.json({
      success: true,
      message: `Analyzed ${analyzed} posts`,
      data: {
        total: posts.length,
        analyzed,
        skipped,
        errors,
        results
      }
    });

  } catch (error) {
    console.error('[Analyze All] Fatal error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default analyzeAllPostsRouter;
