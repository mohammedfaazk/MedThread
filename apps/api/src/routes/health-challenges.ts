import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { healthChallengesService } from '../services/health-challenges.service';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { category, difficulty, status } = req.query;
    const challenges = await healthChallengesService.getChallenges({
      category: category as string,
      difficulty: difficulty as string,
      status: status as string
    });
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

router.get('/my-challenges', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const challenges = await healthChallengesService.getUserChallenges(userId);
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Failed to fetch user challenges' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await healthChallengesService.getChallenge(id);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const participant = await healthChallengesService.joinChallenge(userId, id);
    res.status(201).json(participant);
  } catch (error: any) {
    console.error('Error joining challenge:', error);
    res.status(400).json({ error: error.message || 'Failed to join challenge' });
  }
});

router.delete('/:id/leave', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    await healthChallengesService.leaveChallenge(userId, id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving challenge:', error);
    res.status(500).json({ error: 'Failed to leave challenge' });
  }
});

router.post('/:id/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const participant = await healthChallengesService.updateProgress(userId, id, req.body);
    res.json(participant);
  } catch (error: any) {
    console.error('Error updating progress:', error);
    res.status(400).json({ error: error.message || 'Failed to update progress' });
  }
});

router.get('/:id/leaderboard', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    
    const leaderboard = await healthChallengesService.getLeaderboard(
      id,
      limit ? parseInt(limit as string) : 50
    );
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await healthChallengesService.getStats(id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
