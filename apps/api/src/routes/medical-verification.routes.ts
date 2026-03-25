import { Router, Request, Response } from 'express';
import { medicalVerificationService } from '../services/medical-verification.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/verify-content', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, authorRole } = req.body;
    const result = await medicalVerificationService.verifyMedicalContent(content, authorRole);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Verification failed' });
  }
});

router.post('/check-drug-interactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { medications } = req.body;
    const result = await medicalVerificationService.checkDrugInteractions(medications);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Check failed' });
  }
});

router.post('/detect-emergency', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const result = await medicalVerificationService.detectEmergency(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Detection failed' });
  }
});

router.get('/accuracy-score/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const score = await medicalVerificationService.getMedicalAccuracyScore(req.params.postId);
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get score' });
  }
});

export default router;
