import express from 'express';
import { authenticate } from '../middleware/auth';
import { AIDiseaseDetectiveService } from '../services/ai-disease-detective.service';

const router = express.Router();
const aiDiseaseDetectiveService = new AIDiseaseDetectiveService();

// Analyze symptoms
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { userId, symptoms, severities, durations } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: 'At least one symptom is required' });
    }

    const diagnoses = await aiDiseaseDetectiveService.analyzeSymptoms({
      userId,
      symptoms,
      severities: severities || [],
      durations: durations || []
    });

    res.json({ diagnoses });
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

// Get analysis history
router.get('/history/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await aiDiseaseDetectiveService.getAnalysisHistory(userId);

    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// Get specific analysis
router.get('/analysis/:analysisId', authenticate, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const analysis = await aiDiseaseDetectiveService.getAnalysis(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Save analysis for later reference
router.post('/save', authenticate, async (req, res) => {
  try {
    const { userId, symptoms, diagnoses } = req.body;

    const saved = await aiDiseaseDetectiveService.saveAnalysis({
      userId,
      symptoms,
      diagnoses
    });

    res.json({ success: true, analysis: saved });
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

export default router;
