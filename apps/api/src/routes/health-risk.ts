import express from 'express';
import { authenticate } from '../middleware/auth';
import healthRiskPredictorService from '../services/health-risk-predictor.service';

const router = express.Router();

// Get risk predictions for a user
router.get('/predictions/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const predictions = await healthRiskPredictorService.getUserRiskPredictions(userId);
    
    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Error fetching risk predictions:', error);
    res.status(500).json({ error: 'Failed to fetch risk predictions' });
  }
});

// Submit health assessment data and generate risk predictions
router.post('/assess', authenticate, async (req, res) => {
  try {
    const { userId, ...assessmentData } = req.body;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Save assessment data to health profile
    await healthRiskPredictorService.saveHealthAssessment(userId, assessmentData);
    
    // Generate risk predictions
    const predictions = await healthRiskPredictorService.predictHealthRisks(userId);
    
    res.json({
      success: true,
      message: 'Health assessment completed successfully',
      predictions
    });
  } catch (error) {
    console.error('Error processing health assessment:', error);
    res.status(500).json({ error: 'Failed to process health assessment' });
  }
});

// Get existing assessment data
router.get('/assessment/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can access this data
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const assessment = await healthRiskPredictorService.getHealthAssessment(userId);
    
    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error fetching health assessment:', error);
    res.status(500).json({ error: 'Failed to fetch health assessment' });
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
