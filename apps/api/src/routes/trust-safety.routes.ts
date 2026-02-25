import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { trustSafetyService } from '../services/trust-safety.service';

export const trustSafetyRouter = Router();

/**
 * POST /api/trust/license/submit
 * Submit medical license for verification
 */
trustSafetyRouter.post('/trust/license/submit', authenticate, async (req, res) => {
  try {
    const doctorId = (req as any).userId;
    const result = await trustSafetyService.submitLicenseVerification({
      doctorId,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error submitting license:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/license/verify/:id
 * Verify medical license (admin only)
 */
trustSafetyRouter.post('/trust/license/verify/:id', authenticate, async (req, res) => {
  try {
    const verifiedBy = (req as any).userId;
    const { id } = req.params;
    const { approved, notes } = req.body;

    const result = await trustSafetyService.verifyLicense(
      parseInt(id),
      verifiedBy,
      approved,
      notes
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error verifying license:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/hospital/submit
 * Submit hospital affiliation for verification
 */
trustSafetyRouter.post('/trust/hospital/submit', authenticate, async (req, res) => {
  try {
    const doctorId = (req as any).userId;
    const result = await trustSafetyService.submitHospitalAffiliation({
      doctorId,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error submitting hospital affiliation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/hospital/verify/:id
 * Verify hospital affiliation (admin only)
 */
trustSafetyRouter.post('/trust/hospital/verify/:id', authenticate, async (req, res) => {
  try {
    const verifiedBy = (req as any).userId;
    const { id } = req.params;
    const { approved, notes } = req.body;

    const result = await trustSafetyService.verifyHospitalAffiliation(
      parseInt(id),
      verifiedBy,
      approved,
      notes
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error verifying hospital affiliation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/endorsement
 * Create peer endorsement
 */
trustSafetyRouter.post('/trust/endorsement', authenticate, async (req, res) => {
  try {
    const endorserId = (req as any).userId;
    const result = await trustSafetyService.createPeerEndorsement({
      endorserId,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error creating endorsement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/patient/verify
 * Verify patient identity
 */
trustSafetyRouter.post('/trust/patient/verify', authenticate, async (req, res) => {
  try {
    const patientId = (req as any).userId;
    const result = await trustSafetyService.verifyPatientIdentity({
      patientId,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error verifying patient:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/moderate
 * Moderate content with AI
 */
trustSafetyRouter.post('/trust/moderate', async (req, res) => {
  try {
    const result = await trustSafetyService.moderateContent(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error moderating content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/peer-review/request
 * Request peer review of medical advice
 */
trustSafetyRouter.post('/trust/peer-review/request', authenticate, async (req, res) => {
  try {
    const requestedBy = (req as any).userId;
    const result = await trustSafetyService.requestPeerReview({
      requestedBy,
      ...req.body
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error requesting peer review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/peer-review/:id/submit
 * Submit peer review
 */
trustSafetyRouter.post('/trust/peer-review/:id/submit', authenticate, async (req, res) => {
  try {
    const reviewerId = (req as any).userId;
    const { id } = req.params;

    const result = await trustSafetyService.submitPeerReview(
      parseInt(id),
      reviewerId,
      req.body
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error submitting peer review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/conflict/flag
 * Flag conflicting diagnosis
 */
trustSafetyRouter.post('/trust/conflict/flag', authenticate, async (req, res) => {
  try {
    const result = await trustSafetyService.flagConflictingDiagnosis(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error flagging conflict:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/quality-review/trigger
 * Trigger doctor quality review (admin only)
 */
trustSafetyRouter.post('/trust/quality-review/trigger', authenticate, async (req, res) => {
  try {
    const { doctorId, triggerType, triggerDetails } = req.body;

    const result = await trustSafetyService.triggerQualityReview(
      doctorId,
      triggerType,
      triggerDetails
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Error triggering quality review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/trust/score/:userId
 * Get user trust score
 */
trustSafetyRouter.get('/trust/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const trustScore = await trustSafetyService.getTrustScore(userId);

    res.json({ success: true, data: trustScore });
  } catch (error: any) {
    console.error('[API] Error fetching trust score:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/trust/score/calculate
 * Calculate/update trust score
 */
trustSafetyRouter.post('/trust/score/calculate', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { userType } = req.body;

    const score = await trustSafetyService.calculateTrustScore(userId, userType);

    res.json({ success: true, data: { trustScore: score } });
  } catch (error: any) {
    console.error('[API] Error calculating trust score:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default trustSafetyRouter;
