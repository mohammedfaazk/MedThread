import { Router, Request, Response } from 'express';
import { liabilityProtectionService } from '../services/liability-protection.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/generate-waiver', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, patientId, interactionType } = req.body;
    const waiver = await liabilityProtectionService.generateLiabilityWaiver(doctorId, patientId, interactionType);
    res.json({ waiver });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Generation failed' });
  }
});

router.post('/accept-waiver', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, patientId, interactionType, waiverText } = req.body;
    await liabilityProtectionService.recordWaiverAcceptance({
      doctorId,
      patientId,
      interactionType,
      waiverText,
      acceptedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Acceptance failed' });
  }
});

router.get('/check-waiver/:doctorId/:patientId/:interactionType', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const required = await liabilityProtectionService.isWaiverRequired(
      req.params.doctorId,
      req.params.patientId,
      req.params.interactionType
    );
    res.json({ required });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Check failed' });
  }
});

router.get('/disclaimer/:type', async (req: AuthRequest, res: Response) => {
  try {
    const disclaimer = liabilityProtectionService.getDisclaimer(req.params.type as any);
    res.json(disclaimer);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get disclaimer' });
  }
});

router.get('/doctor-status/:doctorId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const status = await liabilityProtectionService.validateDoctorStatus(req.params.doctorId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Status check failed' });
  }
});

router.get('/liability-report/:doctorId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;
    const report = await liabilityProtectionService.generateLiabilityReport(req.params.doctorId, {
      from: new Date(from as string),
      to: new Date(to as string)
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Report generation failed' });
  }
});

export default router;
