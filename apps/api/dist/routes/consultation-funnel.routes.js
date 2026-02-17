"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultationFunnelRouter = void 0;
const express_1 = require("express");
const consultation_funnel_service_1 = require("../services/consultation-funnel.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.consultationFunnelRouter = (0, express_1.Router)();
/**
 * POST /api/consultation-funnel/request
 * Create consultation request from thread
 */
exports.consultationFunnelRouter.post('/request', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patientId = req.user.userId;
    const requestData = {
        ...req.body,
        patientId
    };
    const consultation = await consultation_funnel_service_1.consultationFunnelService.createConsultationRequest(requestData);
    res.json(consultation);
}));
/**
 * POST /api/consultation-funnel/:id/respond
 * Doctor responds to consultation request
 */
exports.consultationFunnelRouter.post('/:id/respond', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.userId;
    const response = req.body;
    const result = await consultation_funnel_service_1.consultationFunnelService.doctorRespond(id, doctorId, response);
    res.json(result);
}));
/**
 * POST /api/consultation-funnel/:id/schedule
 * Patient schedules appointment
 */
exports.consultationFunnelRouter.post('/:id/schedule', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const patientId = req.user.userId;
    const appointmentData = req.body;
    const result = await consultation_funnel_service_1.consultationFunnelService.scheduleAppointment(id, patientId, appointmentData);
    res.json(result);
}));
/**
 * POST /api/consultation-funnel/:id/complete
 * Mark consultation as completed
 */
exports.consultationFunnelRouter.post('/:id/complete', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.userId;
    const { notes } = req.body;
    const result = await consultation_funnel_service_1.consultationFunnelService.completeConsultation(id, doctorId, notes);
    res.json(result);
}));
/**
 * GET /api/consultation-funnel/metrics
 * Get funnel metrics for doctor
 */
exports.consultationFunnelRouter.get('/metrics', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const { timeframe = 'month' } = req.query;
    const metrics = await consultation_funnel_service_1.consultationFunnelService.getDoctorFunnelMetrics(doctorId, timeframe);
    res.json(metrics);
}));
/**
 * GET /api/consultation-funnel/top-threads
 * Get top converting threads
 */
exports.consultationFunnelRouter.get('/top-threads', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const { limit = 10 } = req.query;
    const threads = await consultation_funnel_service_1.consultationFunnelService.getTopConvertingThreads(doctorId, Number(limit));
    res.json(threads);
}));
