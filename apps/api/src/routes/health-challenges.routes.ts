import express from 'express';
import { authenticate } from '../middleware/auth';
import { healthChallengesService } from '../services/health-challenges.service';
import { prisma } from '@medthread/database';

const router = express.Router();

// Get all active challenges
router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      userRole: (req as any).userRole
    };

    const result = await healthChallengesService.getActiveChallenges(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get ALL challenges (including unapproved HIGH-RISK) - for doctors/admins only
router.get('/all', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const filters = {
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      userRole: 'ADMIN' // Show all challenges regardless of approval status
    };

    // Override to show all challenges
    const page = filters.page;
    const limit = filters.limit;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    const [challenges, total] = await Promise.all([
      prisma.healthChallenge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.healthChallenge.count({ where })
    ]);

    res.json({ 
      success: true, 
      data: {
        challenges,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching all challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get popular challenges
router.get('/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const challenges = await healthChallengesService.getPopularChallenges(limit);
    res.json({ success: true, data: challenges });
  } catch (error: any) {
    console.error('Error fetching popular challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single challenge
router.get('/:id', async (req, res) => {
  try {
    const challenge = await healthChallengesService.getChallenge(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    res.json({ success: true, data: challenge });
  } catch (error: any) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create challenge (admin/doctor only)
router.post('/', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'ADMIN' && (req as any).userRole !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Transform frontend data to service format
    const { title, description, category, difficulty, duration, targetMetric, targetValue, riskLevel } = req.body;
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (duration || 7));

    const challengeData = {
      title,
      description,
      category,
      difficulty,
      riskLevel: riskLevel || 'LOW',
      startDate: now,
      endDate,
      goals: {
        type: targetMetric || 'steps',
        value: targetValue || 0
      },
      rewards: {
        points: 100
      }
    };

    const challenge = await healthChallengesService.createChallenge(challengeData, (req as any).userId);
    res.json({ success: true, data: challenge });
  } catch (error: any) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join challenge
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const participant = await healthChallengesService.joinChallenge(req.params.id, (req as any).userId);
    res.json({ success: true, data: participant });
  } catch (error: any) {
    console.error('Error joining challenge:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Leave challenge
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    await healthChallengesService.leaveChallenge(req.params.id, (req as any).userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving challenge:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update progress
router.post('/:id/progress', authenticate, async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, error: 'Invalid progress value' });
    }

    const participant = await healthChallengesService.updateProgress(req.params.id, (req as any).userId, progress);
    res.json({ success: true, data: participant });
  } catch (error: any) {
    console.error('Error updating progress:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const leaderboard = await healthChallengesService.getLeaderboard(req.params.id, limit);
    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's challenges
router.get('/user/my-challenges', authenticate, async (req, res) => {
  try {
    const challenges = await healthChallengesService.getUserChallenges((req as any).userId);
    res.json({ success: true, data: challenges });
  } catch (error: any) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;


/**
 * GET /api/v1/health-challenges/pending-approval
 * Get challenges pending doctor approval (Doctor only)
 */
router.get('/pending-approval', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const challenges = await healthChallengesService.getChallengesPendingApproval();
    res.json({ success: true, data: challenges });
  } catch (error: any) {
    console.error('Error getting pending challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/health-challenges/:id/approve
 * Doctor approves a challenge (makes it visible to patients)
 */
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get doctor info
    const doctor = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { username: true }
    });

    const challenge = await healthChallengesService.approveChallengeByDoctor(
      req.params.id, 
      (req as any).userId,
      doctor?.username || 'Unknown Doctor'
    );
    
    res.json({ success: true, data: challenge });
  } catch (error: any) {
    console.error('Error approving challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/health-challenges/approvals/pending
 * Get pending approval requests (Doctor only)
 * @deprecated - Old approval flow, kept for backward compatibility
 */
router.get('/approvals/pending', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const requests = await healthChallengesService.getPendingApprovals((req as any).userId);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/health-challenges/approvals/:id/approve
 * Approve a challenge request (Doctor only)
 * @deprecated - Old approval flow, kept for backward compatibility
 */
router.post('/approvals/:id/approve', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { notes } = req.body;
    const request = await healthChallengesService.approveRequest(req.params.id, (req as any).userId, notes);
    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/health-challenges/approvals/:id/reject
 * Reject a challenge request (Doctor only)
 * @deprecated - Old approval flow, kept for backward compatibility
 */
router.post('/approvals/:id/reject', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'DOCTOR' && (req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({ success: false, error: 'Rejection reason required' });
    }

    const request = await healthChallengesService.rejectRequest(req.params.id, (req as any).userId, notes);
    res.json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
