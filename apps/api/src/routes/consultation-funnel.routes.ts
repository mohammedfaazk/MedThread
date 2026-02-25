import { Router, Response } from 'express';
import { consultationFunnelService } from '../services/consultation-funnel.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const consultationFunnelRouter = Router();

/**
 * POST /api/consultation-funnel/request
 * Create consultation request from thread
 */
consultationFunnelRouter.post(
  '/request',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const patientId = req.user.userId;
    const requestData = {
      ...req.body,
      patientId
    };
    
    const consultation = await consultationFunnelService.createConsultationRequest(requestData);
    res.json(consultation);
  })
);

/**
 * POST /api/consultation-funnel/:id/respond
 * Doctor responds to consultation request
 */
consultationFunnelRouter.post(
  '/:id/respond',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const doctorId = req.user.userId;
    const response = req.body;
    
    const result = await consultationFunnelService.doctorRespond(id, doctorId, response);
    res.json(result);
  })
);

/**
 * POST /api/consultation-funnel/:id/schedule
 * Patient schedules appointment
 */
consultationFunnelRouter.post(
  '/:id/schedule',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const patientId = req.user.userId;
    const appointmentData = req.body;
    
    const result = await consultationFunnelService.scheduleAppointment(
      id,
      patientId,
      appointmentData
    );
    res.json(result);
  })
);

/**
 * POST /api/consultation-funnel/:id/complete
 * Mark consultation as completed
 */
consultationFunnelRouter.post(
  '/:id/complete',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const doctorId = req.user.userId;
    const { notes } = req.body;
    
    const result = await consultationFunnelService.completeConsultation(id, doctorId, notes);
    res.json(result);
  })
);

/**
 * GET /api/consultation-funnel/metrics
 * Get funnel metrics for doctor
 */
consultationFunnelRouter.get(
  '/metrics',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const doctorId = req.user.userId;
    const { timeframe = 'month' } = req.query;
    
    const metrics = await consultationFunnelService.getDoctorFunnelMetrics(
      doctorId,
      timeframe as any
    );
    res.json(metrics);
  })
);

/**
 * GET /api/consultation-funnel/top-threads
 * Get top converting threads
 */
consultationFunnelRouter.get(
  '/top-threads',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const doctorId = req.user.userId;
    const { limit = 10 } = req.query;
    
    const threads = await consultationFunnelService.getTopConvertingThreads(
      doctorId,
      Number(limit)
    );
    res.json(threads);
  })
);

