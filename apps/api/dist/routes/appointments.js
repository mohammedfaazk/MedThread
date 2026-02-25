"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const notification_service_1 = require("../services/notification.service");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.appointmentRouter = router;
const prisma = new database_1.PrismaClient();
const mockStore_1 = require("../lib/mockStore");
// Get doctor's availability
router.get('/doctors/:doctorId/availability', async (req, res) => {
    try {
        const { doctorId } = req.params;
        console.log(`[API] Fetching availability for doctorId: ${doctorId}`);
        let availability = [];
        let bookedSlots = [];
        try {
            // Get existing availability from DB
            availability = await prisma.availability.findMany({
                where: { doctorId, isBooked: false },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
            console.log(`[API] Found ${availability.length} slots in DB`);
            // Get all booked appointments for this doctor
            const bookedAppointments = await prisma.appointment.findMany({
                where: {
                    doctorId,
                    status: { in: ['APPROVED', 'PENDING'] }
                },
                select: {
                    startTime: true,
                    endTime: true
                }
            });
            bookedSlots = bookedAppointments;
            console.log(`[API] Found ${bookedSlots.length} booked appointments`);
        }
        catch (dbError) {
            console.error('[API] DB availability fetch failed, falling back to defaults:', dbError);
        }
        // Check in-memory store
        const mockAvailability = (mockStore_1.availabilityStore || []).filter((a) => a.doctorId === doctorId && !a.isBooked);
        console.log(`[API] Found ${mockAvailability.length} slots in Mock Store`);
        // Merge results
        availability = [...availability, ...mockAvailability];
        // If no availability set, provide default slots
        if (availability.length === 0) {
            const today = new Date();
            const defaultSlots = [];
            // Generate slots for the next 14 days (2 weeks)
            for (let i = 0; i <= 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dayOfWeek = date.getDay();
                // Monday-Friday: 4pm (16:00) to 9pm (21:00) - 1 hour slots
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    for (let hour = 16; hour < 21; hour++) {
                        const start = new Date(date);
                        start.setHours(hour, 0, 0, 0);
                        const end = new Date(date);
                        end.setHours(hour + 1, 0, 0, 0);
                        // Check if this slot is already booked
                        const isBooked = bookedSlots.some((booked) => {
                            const bookedStart = new Date(booked.startTime);
                            const bookedEnd = new Date(booked.endTime);
                            return (start >= bookedStart && start < bookedEnd) ||
                                (end > bookedStart && end <= bookedEnd);
                        });
                        if (!isBooked) {
                            defaultSlots.push({
                                id: `default-${doctorId}-${dayOfWeek}-${hour}-${i}`,
                                doctorId,
                                dayOfWeek,
                                startTime: start,
                                endTime: end,
                                isBooked: false
                            });
                        }
                    }
                }
                // Saturday-Sunday: 7am (07:00) to 9pm (21:00) - 1 hour slots
                else if (dayOfWeek === 0 || dayOfWeek === 6) {
                    for (let hour = 7; hour < 21; hour++) {
                        const start = new Date(date);
                        start.setHours(hour, 0, 0, 0);
                        const end = new Date(date);
                        end.setHours(hour + 1, 0, 0, 0);
                        // Check if this slot is already booked
                        const isBooked = bookedSlots.some((booked) => {
                            const bookedStart = new Date(booked.startTime);
                            const bookedEnd = new Date(booked.endTime);
                            return (start >= bookedStart && start < bookedEnd) ||
                                (end > bookedStart && end <= bookedEnd);
                        });
                        if (!isBooked) {
                            defaultSlots.push({
                                id: `default-${doctorId}-${dayOfWeek}-${hour}-${i}`,
                                doctorId,
                                dayOfWeek,
                                startTime: start,
                                endTime: end,
                                isBooked: false
                            });
                        }
                    }
                }
            }
            availability = defaultSlots;
            console.log(`[API] Returning ${availability.length} default slots for doctor ${doctorId} (filtered out ${bookedSlots.length} booked)`);
        }
        res.json(availability);
    }
    catch (error) {
        console.error('Fetch availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});
// Doctor sets availability
router.post('/availability', async (req, res) => {
    try {
        const { doctorId, dayOfWeek, startTime, endTime } = req.body;
        console.log('[API] Creating availability:', { doctorId, dayOfWeek, startTime, endTime });
        if (!doctorId || dayOfWeek === undefined || !startTime || !endTime) {
            console.error('[API] Missing required fields');
            return res.status(400).json({ error: 'Missing required fields: doctorId, dayOfWeek, startTime, endTime' });
        }
        let availability;
        try {
            availability = await prisma.availability.create({
                data: {
                    doctorId,
                    dayOfWeek,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                }
            });
            console.log('[API] Availability created successfully in DB:', availability.id);
        }
        catch (dbError) {
            console.error('[API] DB Save failed, using In-Memory persistence:', dbError.message);
            // Fallback to in-memory store
            availability = {
                id: `avail-${Date.now()}`,
                doctorId,
                dayOfWeek,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                isBooked: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            mockStore_1.availabilityStore.push(availability);
            (0, mockStore_1.saveStore)();
            console.log('[API] Availability saved to Mock Store:', availability.id);
        }
        res.json(availability);
    }
    catch (error) {
        console.error('[API] Failed to create availability:', error);
        res.status(500).json({ error: 'Failed to create availability', details: error.message });
    }
});
// Patient books an appointment
router.post('/book', async (req, res) => {
    try {
        const { patientId, doctorId, startTime, endTime, reason } = req.body;
        console.log(`[API] Booking attempt: patient=${patientId}, doctor=${doctorId}`);
        let appointment;
        try {
            appointment = await prisma.appointment.create({
                data: {
                    patientId,
                    doctorId,
                    startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    reason,
                    status: 'PENDING'
                },
                include: {
                    patient: { select: { id: true, username: true, avatar: true } },
                    doctor: { select: { id: true, username: true, avatar: true, specialty: true } }
                }
            });
            console.log('[API] Saved to DB');
            // Create APPOINTMENT_REQUEST notification for doctor
            try {
                await notification_service_1.notificationService.createNotification({
                    type: client_1.NotificationType.APPOINTMENT_REQUEST,
                    recipientIds: [doctorId],
                    actorId: patientId,
                    contentId: appointment.id,
                    contentType: client_1.ContentType.APPOINTMENT,
                    metadata: {
                        title: 'New Appointment Request',
                        body: `${appointment.patient.username} requested an appointment`,
                        preview: reason,
                        link: `/appointments`,
                        appointmentTime: startTime,
                    }
                });
            }
            catch (notifError) {
                console.error('Failed to create appointment request notification:', notifError);
            }
        }
        catch (dbError) {
            console.error('[API] DB Save failed, using In-Memory persistence');
            console.log('[API] Mock booking with IDs:', { patientId, doctorId });
            // Try to get actual user info from Supabase or use fallback
            let patientUsername = 'Patient';
            let doctorUsername = 'Doctor';
            try {
                // Try to fetch from Supabase auth users (if available)
                const { createClient } = require('@supabase/supabase-js');
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                if (supabaseUrl && supabaseKey) {
                    const supabase = createClient(supabaseUrl, supabaseKey);
                    // Fetch patient info
                    const { data: patientAuth } = await supabase.auth.admin.getUserById(patientId);
                    if (patientAuth?.user?.email) {
                        patientUsername = patientAuth.user.email.split('@')[0];
                    }
                    // Fetch doctor info
                    const { data: doctorAuth } = await supabase.auth.admin.getUserById(doctorId);
                    if (doctorAuth?.user?.email) {
                        doctorUsername = 'Dr. ' + doctorAuth.user.email.split('@')[0];
                    }
                }
            }
            catch (authError) {
                console.log('[API] Could not fetch user info from auth:', authError);
            }
            appointment = {
                id: `app-${Date.now()}`,
                patientId,
                doctorId,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                reason,
                status: 'PENDING',
                patient: { id: patientId, username: patientUsername, avatar: null },
                doctor: { id: doctorId, username: doctorUsername, avatar: null, specialty: 'Medical' }
            };
            mockStore_1.appointmentsStore.push(appointment);
            (0, mockStore_1.saveStore)();
        }
        res.json(appointment);
    }
    catch (error) {
        console.error('[API] Book error:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});
// Cancel appointment
router.post('/appointments/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, reason } = req.body;
        console.log(`[API] Cancel appointment: id=${id}, userId=${userId}`);
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { email: true, username: true } },
                doctor: { select: { email: true, username: true } }
            }
        });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        // Check if user is authorized to cancel
        if (appointment.patientId !== userId && appointment.doctorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
        }
        // Update appointment status
        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                reason: `${appointment.reason}\n\nCancellation reason: ${reason}`
            }
        });
        // Send notifications
        const cancelledBy = appointment.patientId === userId ? 'patient' : 'doctor';
        const notifyUser = cancelledBy === 'patient' ? appointment.doctorId : appointment.patientId;
        const notifyEmail = cancelledBy === 'patient' ? appointment.doctor.email : appointment.patient.email;
        await prisma.notification.create({
            data: {
                userId: notifyUser,
                type: 'APPOINTMENT_CANCELLED',
                content: `Appointment cancelled by ${cancelledBy}. Reason: ${reason}`,
                link: `/appointments/${id}`
            }
        });
        // Send email notification
        const { emailService } = require('../services/email.service');
        await emailService.sendEmail({
            to: notifyEmail,
            subject: 'Appointment Cancelled - MedThread',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Appointment Cancelled</h2>
                    <p>Your appointment scheduled for ${new Date(appointment.startTime).toLocaleString()} has been cancelled.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>You can book a new appointment anytime.</p>
                </div>
            `,
            text: `Appointment cancelled. Reason: ${reason}`
        });
        res.json(updated);
    }
    catch (error) {
        console.error('[API] Cancel error:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});
// Reschedule appointment
router.post('/appointments/:id/reschedule', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, newStartTime, newEndTime, reason } = req.body;
        console.log(`[API] Reschedule appointment: id=${id}`);
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: { select: { email: true, username: true } },
                doctor: { select: { email: true, username: true } }
            }
        });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        // Check if user is authorized
        if (appointment.patientId !== userId && appointment.doctorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to reschedule this appointment' });
        }
        // Update appointment
        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                startTime: new Date(newStartTime),
                endTime: new Date(newEndTime),
                status: 'PENDING', // Reset to pending for approval
                reason: `${appointment.reason}\n\nRescheduled: ${reason}`
            }
        });
        // Send notifications
        const rescheduledBy = appointment.patientId === userId ? 'patient' : 'doctor';
        const notifyUser = rescheduledBy === 'patient' ? appointment.doctorId : appointment.patientId;
        const notifyEmail = rescheduledBy === 'patient' ? appointment.doctor.email : appointment.patient.email;
        await prisma.notification.create({
            data: {
                userId: notifyUser,
                type: 'APPOINTMENT_RESCHEDULED',
                content: `Appointment rescheduled to ${new Date(newStartTime).toLocaleString()}`,
                link: `/appointments/${id}`
            }
        });
        // Send email
        const { emailService } = require('../services/email.service');
        await emailService.sendEmail({
            to: notifyEmail,
            subject: 'Appointment Rescheduled - MedThread',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Appointment Rescheduled</h2>
                    <p>Your appointment has been rescheduled.</p>
                    <p><strong>New Date & Time:</strong> ${new Date(newStartTime).toLocaleString()}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>Please confirm the new time.</p>
                </div>
            `,
            text: `Appointment rescheduled to ${new Date(newStartTime).toLocaleString()}`
        });
        res.json(updated);
    }
    catch (error) {
        console.error('[API] Reschedule error:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});
// Doctor approves/rejects appointment - requires verified doctor
router.put('/appointments/:id', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, doctorId } = req.body; // APPROVED or REJECTED
        console.log(`[API] Update status: id=${id}, status=${status}`);
        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id },
                include: {
                    patient: { select: { id: true, username: true, avatar: true } },
                    doctor: { select: { id: true, username: true, avatar: true } }
                }
            });
            if (appointment && appointment.doctorId === doctorId) {
                const updated = await prisma.appointment.update({
                    where: { id },
                    data: { status },
                    include: {
                        patient: { select: { id: true, username: true, avatar: true } },
                        doctor: { select: { id: true, username: true, avatar: true } }
                    }
                });
                // Create APPOINTMENT_UPDATE notification for patient
                try {
                    const statusText = status === 'APPROVED' ? 'approved' : 'rejected';
                    await notification_service_1.notificationService.createNotification({
                        type: client_1.NotificationType.APPOINTMENT_UPDATE,
                        recipientIds: [appointment.patientId],
                        actorId: doctorId,
                        contentId: id,
                        contentType: client_1.ContentType.APPOINTMENT,
                        metadata: {
                            title: `Appointment ${statusText}`,
                            body: `Dr. ${updated.doctor.username} ${statusText} your appointment request`,
                            link: `/appointments`,
                            appointmentStatus: status,
                        }
                    });
                }
                catch (notifError) {
                    console.error('Failed to create appointment update notification:', notifError);
                }
                // If approved, create a conversation
                if (status === 'APPROVED') {
                    // Even if DB update succeeded, we might want to ensure mock store has it for testing
                    (0, mockStore_1.createMockConversation)(updated);
                    try {
                        await prisma.conversation.create({
                            data: {
                                appointmentId: id,
                                patientId: appointment.patientId,
                                doctorId: appointment.doctorId,
                                participants: {
                                    connect: [
                                        { id: appointment.patientId },
                                        { id: appointment.doctorId }
                                    ]
                                }
                            }
                        });
                    }
                    catch (pError) {
                        console.warn('[API] DB Conversation create failed (expected during mock testing)');
                    }
                }
                // Handle chat lifecycle
                if (status === 'REJECTED') {
                    try {
                        const { chatLifecycleService } = await Promise.resolve().then(() => __importStar(require('../services/chat-lifecycle.service')));
                        await chatLifecycleService.handleAppointmentStatusChange(id, status);
                    }
                    catch (lifecycleError) {
                        console.error('Chat lifecycle error:', lifecycleError);
                    }
                }
                return res.json(updated);
            }
        }
        catch (dbError) {
            console.error('[API] DB update failed, checking In-Memory store');
        }
        // Search in-memory store
        const index = mockStore_1.appointmentsStore.findIndex((a) => a.id === id);
        if (index !== -1) {
            mockStore_1.appointmentsStore[index].status = status;
            console.log('[API] Updated In-Memory store');
            if (status === 'APPROVED') {
                const conv = (0, mockStore_1.createMockConversation)(mockStore_1.appointmentsStore[index]);
                console.log('[API] Created Mock Conversation for approved appointment:', conv.id);
            }
            (0, mockStore_1.saveStore)();
            return res.json(mockStore_1.appointmentsStore[index]);
        }
        // Final fallback success
        res.json({
            id,
            status,
            patient: { username: 'Patient' },
            doctor: { username: 'Doctor' }
        });
    }
    catch (error) {
        console.error('[API] Update error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});
// Get user's appointments
router.get('/appointments', async (req, res) => {
    try {
        const { userId, role } = req.query;
        console.log(`[API] Fetching appointments for userId: ${userId}, role: ${role}`);
        let dbAppointments = [];
        try {
            const where = role === 'doctor'
                ? { doctorId: userId }
                : { patientId: userId };
            dbAppointments = await prisma.appointment.findMany({
                where,
                include: {
                    patient: { select: { id: true, username: true, avatar: true } },
                    doctor: { select: { id: true, username: true, avatar: true, specialty: true } }
                },
                orderBy: { startTime: 'asc' }
            });
            console.log(`[API] Found ${dbAppointments.length} appointments in DB`);
        }
        catch (dbError) {
            console.error('[API] DB appointments fetch failed:', dbError);
        }
        // Always check Mock Store and merge
        const mockAppointments = mockStore_1.appointmentsStore.filter((a) => role === 'doctor' ? a.doctorId === userId : a.patientId === userId);
        console.log(`[API] Found ${mockAppointments.length} appointments in Mock Store`);
        // Merge results, avoiding duplicates if any ID is in both (unlikely given current flow)
        const allAppointments = [...dbAppointments];
        mockAppointments.forEach((mockApt) => {
            if (!allAppointments.find((dbApt) => dbApt.id === mockApt.id)) {
                allAppointments.push(mockApt);
            }
        });
        // Final fallback if both are empty
        if (allAppointments.length === 0) {
            console.log('[API] Returning default dummy for empty list');
            return res.json([
                {
                    id: 'dummy-info-1',
                    patientId: userId,
                    doctorId: 'any',
                    startTime: new Date(Date.now() + 3600000).toISOString(),
                    endTime: new Date(Date.now() + 7200000).toISOString(),
                    status: 'PENDING',
                    reason: 'No appointments found. Please create a request from the Patient side.',
                    patient: { id: userId, username: 'Patient', avatar: null },
                    doctor: { id: 'any', username: 'System', avatar: null, specialty: 'Instructions' }
                }
            ]);
        }
        res.json(allAppointments);
    }
    catch (error) {
        console.error('Fetch appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});
// Debug route to see what's in memory
router.get('/debug', (req, res) => {
    res.json({
        appointments: mockStore_1.appointmentsStore,
        // conversations: conversationsStore, // Need to import if we want to see it here
        // messages: messagesStore
    });
});
// Debug route to check conversation and appointment details
router.get('/debug/conversation/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                appointment: {
                    include: {
                        patient: true,
                        doctor: true
                    }
                }
            }
        });
        res.json({
            conversation,
            now: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
});
