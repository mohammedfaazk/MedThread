import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Middleware: All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// COMMUNITY SECTION ACTIVITY
// ============================================
router.get('/community-section-activity', async (req, res) => {
  try {
    const { period = '30d', metric = 'interactions' } = req.query;
    
    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Define community sections
    const sections = [
      { key: 'support_groups', label: 'Support Groups', color: '#2563EB' },
      { key: 'qa_forum', label: 'Q&A Forum', color: '#16A34A' },
      { key: 'health_challenges', label: 'Health Challenges', color: '#D97706' },
      { key: 'success_stories', label: 'Success Stories', color: '#7C3AED' }
    ];

    const results = [];

    for (const section of sections) {
      let value = 0;

      if (metric === 'posts') {
        // Count posts/threads
        if (section.key === 'support_groups') {
          value = await prisma.post.count({
            where: {
              createdAt: { gte: startDate },
              community: {
                OR: [
                  { displayName: { contains: 'Health' } },
                  { name: 'health' }
                ]
              }
            }
          });
        } else if (section.key === 'qa_forum') {
          value = await prisma.forumQuestion.count({
            where: {
              createdAt: { gte: startDate }
            }
          });
        } else if (section.key === 'health_challenges') {
          value = await prisma.healthChallenge.count({
            where: {
              createdAt: { gte: startDate }
            }
          });
        } else if (section.key === 'success_stories') {
          value = await prisma.successStory.count({
            where: {
              createdAt: { gte: startDate }
            }
          });
        }
      } else if (metric === 'comments') {
        // Count comments/replies
        if (section.key === 'support_groups') {
          value = await prisma.comment.count({
            where: {
              createdAt: { gte: startDate },
              post: {
                community: {
                  OR: [
                    { displayName: { contains: 'Health' } },
                    { name: 'health' }
                  ]
                }
              }
            }
          });
        } else if (section.key === 'qa_forum') {
          value = await prisma.forumAnswer.count({
            where: {
              createdAt: { gte: startDate }
            }
          });
        } else if (section.key === 'health_challenges') {
          value = await prisma.challengeParticipant.count({
            where: {
              joinedAt: { gte: startDate }
            }
          });
        } else if (section.key === 'success_stories') {
          value = await prisma.storyComment.count({
            where: {
              createdAt: { gte: startDate }
            }
          });
        }
      } else if (metric === 'interactions') {
        // Count total interactions (votes + reactions)
        if (section.key === 'support_groups') {
          const votes = await prisma.vote.count({
            where: {
              createdAt: { gte: startDate },
              post: {
                community: {
                  OR: [
                    { displayName: { contains: 'Health' } },
                    { name: 'health' }
                  ]
                }
              }
            }
          });
          value = votes;
        } else if (section.key === 'qa_forum') {
          const questionVotes = await prisma.forumQuestion.aggregate({
            where: { createdAt: { gte: startDate } },
            _sum: { upvotes: true }
          });
          const answerVotes = await prisma.forumAnswer.aggregate({
            where: { createdAt: { gte: startDate } },
            _sum: { upvotes: true }
          });
          value = (questionVotes._sum.upvotes || 0) + (answerVotes._sum.upvotes || 0);
        } else if (section.key === 'health_challenges') {
          const participants = await prisma.challengeParticipant.count({
            where: { joinedAt: { gte: startDate } }
          });
          value = participants;
        } else if (section.key === 'success_stories') {
          const likes = await prisma.successStory.aggregate({
            where: { createdAt: { gte: startDate } },
            _sum: { likes: true }
          });
          value = likes._sum.likes || 0;
        }
      } else if (metric === 'members') {
        // Count active members (unique users)
        if (section.key === 'support_groups') {
          const postAuthors = await prisma.post.findMany({
            where: {
              createdAt: { gte: startDate },
              community: {
                OR: [
                  { displayName: { contains: 'Health' } },
                  { name: 'health' }
                ]
              }
            },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const commentAuthors = await prisma.comment.findMany({
            where: {
              createdAt: { gte: startDate },
              post: {
                community: {
                  OR: [
                    { displayName: { contains: 'Health' } },
                    { name: 'health' }
                  ]
                }
              }
            },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const uniqueUsers = new Set([
            ...postAuthors.map(p => p.authorId),
            ...commentAuthors.map(c => c.authorId)
          ]);
          value = uniqueUsers.size;
        } else if (section.key === 'qa_forum') {
          const questionAuthors = await prisma.forumQuestion.findMany({
            where: { createdAt: { gte: startDate } },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const answerAuthors = await prisma.forumAnswer.findMany({
            where: { createdAt: { gte: startDate } },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const uniqueUsers = new Set([
            ...questionAuthors.map(q => q.authorId),
            ...answerAuthors.map(a => a.authorId)
          ]);
          value = uniqueUsers.size;
        } else if (section.key === 'health_challenges') {
          value = await prisma.challengeParticipant.findMany({
            where: { joinedAt: { gte: startDate } },
            select: { userId: true },
            distinct: ['userId']
          }).then(p => p.length);
        } else if (section.key === 'success_stories') {
          const storyAuthors = await prisma.successStory.findMany({
            where: { createdAt: { gte: startDate } },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const commentAuthors = await prisma.storyComment.findMany({
            where: { createdAt: { gte: startDate } },
            select: { authorId: true },
            distinct: ['authorId']
          });
          const uniqueUsers = new Set([
            ...storyAuthors.map(s => s.authorId),
            ...commentAuthors.map(c => c.authorId)
          ]);
          value = uniqueUsers.size;
        }
      }

      results.push({
        section: section.key,
        label: section.label,
        value,
        color: section.color
      });
    }

    // Calculate percentages
    const total = results.reduce((sum, r) => sum + r.value, 0);
    results.forEach(r => {
      r.percentageOfTotal = total > 0 ? Math.round((r.value / total) * 100) : 0;
    });

    res.json({
      success: true,
      data: results,
      total,
      metric,
      period
    });
  } catch (error: any) {
    console.error('Error fetching community section activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
