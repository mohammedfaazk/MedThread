import express from 'express';
import { authenticate } from '../middleware/auth';
import { AIDiseaseDetectiveService } from '../services/ai-disease-detective.service';
import { aiSymptomAnalysisService } from '../services/ai-symptom-analysis.service';

const router = express.Router();
const aiDiseaseDetectiveService = new AIDiseaseDetectiveService();

// Analyze symptoms
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { userId, symptoms, severities, durations } = req.body;

    console.log('[AI Detective] Analyze request:', { userId, symptoms, severities, durations });

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: 'At least one symptom is required' });
    }

    // Use the symptom analysis service for immediate symptom analysis
    const diagnoses = await aiSymptomAnalysisService.analyzeSymptoms({
      symptoms: {
        primarySymptoms: symptoms,
        duration: durations?.[0] || 'recent',
        severity: severities?.[0] || 'moderate',
        description: symptoms.join(', ')
      }
    });

    console.log('[AI Detective] Analysis result:', diagnoses);

    // Transform to expected format
    const formattedDiagnoses = diagnoses.possibleConditions.map(condition => ({
      condition: condition.condition,
      probability: condition.probability / 100,
      severity: condition.urgency,
      urgency: condition.urgency,
      reasoning: [condition.reasoning],
      recommendations: diagnoses.recommendedActions,
      relatedSymptoms: [],
      whenToSeekCare: diagnoses.emergencyWarning || 
        (condition.urgency === 'high' || condition.urgency === 'emergency' 
          ? 'Seek medical attention within 24 hours' 
          : 'Monitor symptoms and consult a doctor if they persist or worsen')
    }));

    console.log('[AI Detective] Formatted diagnoses:', formattedDiagnoses);

    res.json({ 
      diagnoses: formattedDiagnoses,
      specialtyRecommendation: diagnoses.specialtyRecommendation 
    });
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
