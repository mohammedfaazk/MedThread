"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientJourneyRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_refactored_1 = require("../middleware/auth.refactored");
const patient_journey_service_1 = require("../services/patient-journey.service");
exports.patientJourneyRouter = (0, express_1.Router)();
/**
 * POST /api/patient-journey/track-discovery
 * Track patient discovering a doctor profile
 */
exports.patientJourneyRouter.post('/patient-journey/track-discovery', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { doctorId, source, keyword } = req.body;
        const journey = await patient_journey_service_1.patientJourneyService.trackDiscovery({
            patientId: userId,
            doctorId,
            source,
            keyword
        });
        res.json({
            success: true,
            data: journey
        });
    }
    catch (error) {
        console.error('[API] Error tracking discovery:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track discovery'
        });
    }
});
/**
 * POST /api/patient-journey/questionnaire
 * Create pre-consultation questionnaire
 */
exports.patientJourneyRouter.post('/patient-journey/questionnaire', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId, doctorId, chiefComplaint, symptoms, symptomDuration, symptomSeverity, currentMedications, allergies, customQuestions } = req.body;
        if (!appointmentId || !chiefComplaint) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID and chief complaint are required'
            });
        }
        const questionnaire = await patient_journey_service_1.patientJourneyService.createQuestionnaire({
            appointmentId,
            patientId: userId,
            doctorId,
            chiefComplaint,
            symptoms,
            symptomDuration,
            symptomSeverity,
            currentMedications,
            allergies,
            customQuestions
        });
        res.status(201).json({
            success: true,
            data: questionnaire
        });
    }
    catch (error) {
        console.error('[API] Error creating questionnaire:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create questionnaire'
        });
    }
});
/**
 * PUT /api/patient-journey/questionnaire/:appointmentId
 * Complete questionnaire with answers
 */
exports.patientJourneyRouter.put('/patient-journey/questionnaire/:appointmentId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { answers } = req.body;
        await patient_journey_service_1.patientJourneyService.completeQuestionnaire(appointmentId, answers);
        res.json({
            success: true,
            message: 'Questionnaire completed successfully'
        });
    }
    catch (error) {
        console.error('[API] Error completing questionnaire:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete questionnaire'
        });
    }
});
/**
 * GET /api/patient-journey/questionnaire/:appointmentId
 * Get questionnaire for appointment
 */
exports.patientJourneyRouter.get('/patient-journey/questionnaire/:appointmentId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const questionnaire = await database_1.prisma.$queryRaw `
      SELECT * FROM "PreConsultationQuestionnaire"
      WHERE appointment_id = ${appointmentId}
    `;
        if (questionnaire.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Questionnaire not found'
            });
        }
        res.json({
            success: true,
            data: questionnaire[0]
        });
    }
    catch (error) {
        console.error('[API] Error fetching questionnaire:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch questionnaire'
        });
    }
});
/**
 * POST /api/patient-journey/prescription
 * Issue prescription (doctor only)
 */
exports.patientJourneyRouter.post('/patient-journey/prescription', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId, patientId, diagnosis, medications, generalInstructions, followUpInstructions, validUntil } = req.body;
        // Verify user is a doctor
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !['DOCTOR', 'NURSE', 'PHARMACIST'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Only healthcare professionals can issue prescriptions'
            });
        }
        if (!appointmentId || !diagnosis || !medications || medications.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Appointment ID, diagnosis, and medications are required'
            });
        }
        const prescription = await patient_journey_service_1.patientJourneyService.issuePrescription({
            appointmentId,
            patientId,
            doctorId: userId,
            diagnosis,
            medications,
            generalInstructions,
            followUpInstructions,
            validUntil: validUntil ? new Date(validUntil) : undefined
        });
        res.status(201).json({
            success: true,
            data: prescription
        });
    }
    catch (error) {
        console.error('[API] Error issuing prescription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to issue prescription'
        });
    }
});
/**
 * GET /api/patient-journey/prescription/:appointmentId
 * Get prescription for appointment
 */
exports.patientJourneyRouter.get('/patient-journey/prescription/:appointmentId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const prescription = await database_1.prisma.$queryRaw `
      SELECT * FROM "Prescription"
      WHERE appointment_id = ${appointmentId}
    `;
        if (prescription.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Prescription not found'
            });
        }
        res.json({
            success: true,
            data: prescription[0]
        });
    }
    catch (error) {
        console.error('[API] Error fetching prescription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch prescription'
        });
    }
});
/**
 * POST /api/patient-journey/follow-up
 * Schedule follow-up appointment
 */
exports.patientJourneyRouter.post('/patient-journey/follow-up', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { originalAppointmentId, patientId, doctorId, recommendedDate, recommendedReason, recommendedByDoctor } = req.body;
        if (!originalAppointmentId) {
            return res.status(400).json({
                success: false,
                error: 'Original appointment ID is required'
            });
        }
        const followUp = await patient_journey_service_1.patientJourneyService.scheduleFollowUp({
            originalAppointmentId,
            patientId: patientId || userId,
            doctorId,
            recommendedDate: recommendedDate ? new Date(recommendedDate) : undefined,
            recommendedReason,
            recommendedByDoctor
        });
        res.status(201).json({
            success: true,
            data: followUp
        });
    }
    catch (error) {
        console.error('[API] Error scheduling follow-up:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule follow-up'
        });
    }
});
/**
 * GET /api/patient-journey/:journeyId
 * Get complete journey details
 */
exports.patientJourneyRouter.get('/patient-journey/:journeyId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { journeyId } = req.params;
        const journey = await patient_journey_service_1.patientJourneyService.getJourneyDetails(parseInt(journeyId));
        if (!journey) {
            return res.status(404).json({
                success: false,
                error: 'Journey not found'
            });
        }
        res.json({
            success: true,
            data: journey
        });
    }
    catch (error) {
        console.error('[API] Error fetching journey:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journey'
        });
    }
});
/**
 * POST /api/patient-journey/cta/track
 * Track CTA performance
 */
exports.patientJourneyRouter.post('/patient-journey/cta/track', async (req, res) => {
    try {
        const { ctaId, action } = req.body; // action: 'impression', 'click', 'booking'
        if (!ctaId || !action) {
            return res.status(400).json({
                success: false,
                error: 'CTA ID and action are required'
            });
        }
        if (action === 'impression') {
            await patient_journey_service_1.patientJourneyService.trackCTAImpression(parseInt(ctaId));
        }
        else if (action === 'click') {
            await patient_journey_service_1.patientJourneyService.trackCTAClick(parseInt(ctaId));
        }
        else if (action === 'booking') {
            await patient_journey_service_1.patientJourneyService.trackCTABooking(parseInt(ctaId));
        }
        else {
            return res.status(400).json({
                success: false,
                error: 'Invalid action'
            });
        }
        res.json({
            success: true,
            message: 'CTA tracked successfully'
        });
    }
    catch (error) {
        console.error('[API] Error tracking CTA:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track CTA'
        });
    }
});
/**
 * GET /api/patient-journey/cta/:doctorId
 * Get doctor's booking CTAs
 */
exports.patientJourneyRouter.get('/patient-journey/cta/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const ctas = await patient_journey_service_1.patientJourneyService.getDoctorCTAs(doctorId);
        res.json({
            success: true,
            data: ctas
        });
    }
    catch (error) {
        console.error('[API] Error fetching CTAs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch CTAs'
        });
    }
});
/**
 * POST /api/patient-journey/reminders/send
 * Send pending reminders (cron job endpoint)
 */
exports.patientJourneyRouter.post('/patient-journey/reminders/send', async (req, res) => {
    try {
        const count = await patient_journey_service_1.patientJourneyService.sendPendingReminders();
        res.json({
            success: true,
            message: `Sent ${count} reminders`
        });
    }
    catch (error) {
        console.error('[API] Error sending reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send reminders'
        });
    }
});
/**
 * POST /api/patient-journey/reviews/send
 * Send pending review requests (cron job endpoint)
 */
exports.patientJourneyRouter.post('/patient-journey/reviews/send', async (req, res) => {
    try {
        const count = await patient_journey_service_1.patientJourneyService.sendPendingReviewRequests();
        res.json({
            success: true,
            message: `Sent ${count} review requests`
        });
    }
    catch (error) {
        console.error('[API] Error sending review requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send review requests'
        });
    }
});
exports.default = exports.patientJourneyRouter;
