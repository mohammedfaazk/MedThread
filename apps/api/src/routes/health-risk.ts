import express from 'express';
import { authenticate } from '../middleware/auth';
import { healthRiskPredictorService } from '../services/health-risk-predictor.service';

const router = express.Router();

// Get risk predictions for a user
router.get('/predictions/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const predictions = await healthRiskPredictorService.getPredictions(userId);
    
    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Error fetching risk predictions:', error);
    res.status(500).json({ error: 'Failed to fetch risk predictions' });
  }
});

// Generate new risk assessment
router.post('/assess/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const assessment = await healthRiskPredictorService.generateAssessment(userId);
    
    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error generating risk assessment:', error);
    res.status(500).json({ error: 'Failed to generate risk assessment' });
  }
});

// Get risk timeline
router.get('/timeline/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = '5_YEARS' } = req.query;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const timeline = await healthRiskPredictorService.getRiskTimeline(userId, timeframe as string);
    
    res.json({
      success: true,
      timeline
    });
  } catch (error) {
    console.error('Error fetching risk timeline:', error);
    res.status(500).json({ error: 'Failed to fetch risk timeline' });
  }
});

// Get prevention recommendations
router.get('/prevention/:userId/:disease', authenticate, async (req, res) => {
  try {
    const { userId, disease } = req.params;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const recommendations = await healthRiskPredictorService.getPreventionRecommendations(
      userId,
      disease
    );
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching prevention recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
