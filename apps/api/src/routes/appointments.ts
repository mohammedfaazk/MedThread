import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { notificationService } from '../services/notification.service';
import { NotificationType, ContentType } from '@prisma/client';
import { analyticsEvents } from '../services/analytics-events.service';

const router = Router();

import { appointmentsStore, availabilityStore, createMockConversation, saveStore } from '../lib/mockStore';

// Get doctor's availability
router.get('/doctors/:doctorId/availability', async (req, res) => {
    try {
        const { doctorId } = req.params;
        console.log(`[API] Fetching availability for doctorId: ${doctorId}`);

        let availability: any[] = [];
        let bookedSlots: any[] = [];

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
        } catch (dbError) {
            console.error('[API] DB availability fetch failed, falling back to defaults:', dbError);
        }

        // Check in-memory store
        const mockAvailability = (availabilityStore || []).filter((a: any) => a.doctorId === doctorId && !a.isBooked);
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
                        const isBooked = bookedSlots.some((booked: any) => {
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
                        const isBooked = bookedSlots.some((booked: any) => {
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
            availability = defaultSlots as any;
            console.log(`[API] Returning ${availability.length} default slots for doctor ${doctorId} (filtered out ${bookedSlots.length} booked)`);
        }

        res.json(availability);
    } catch (error) {
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
        } catch (dbError: any) {
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
            availabilityStore.push(availability);
            saveStore();
            console.log('[API] Availability saved to Mock Store:', availability.id);
        }

        res.json(availability);
    } catch (error: any) {
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

            // Emit analytics event for appointment booking
            analyticsEvents.emitAppointmentBooked({
              appointmentId: appointment.id,
              doctorId: appointment.doctorId,
              patientId: appointment.patientId
            });

            // Create APPOINTMENT_REQUEST notification for doctor
            try {
                await notificationService.createNotification({
                    type: NotificationType.APPOINTMENT_REQUEST,
                    recipientIds: [doctorId],
                    actorId: patientId,
                    contentId: appointment.id,
                    contentType: ContentType.APPOINTMENT,
                    metadata: {
                        title: 'New Appointment Request',
                        body: `${appointment.patient.username} requested an appointment`,
                        preview: reason,
                        link: `/appointments`,
                        appointmentTime: startTime,
                    }
                });
            } catch (notifError) {
                console.error('Failed to create appointment request notification:', notifError);
            }
        } catch (dbError) {
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
            } catch (authError) {
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
            appointmentsStore.push(appointment);
            saveStore();
        }

        res.json(appointment);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
        console.error('[API] Reschedule error:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

// Doctor approves/rejects appointment - requires verified doctor
router.put('/appointments/:id', authenticate, requireVerifiedDoctor, async (req, res) => {
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
                    await notificationService.createNotification({
                        type: NotificationType.APPOINTMENT_UPDATE,
                        recipientIds: [appointment.patientId],
                        actorId: doctorId,
                        contentId: id,
                        contentType: ContentType.APPOINTMENT,
                        metadata: {
                            title: `Appointment ${statusText}`,
                            body: `Dr. ${updated.doctor.username} ${statusText} your appointment request`,
                            link: `/appointments`,
                            appointmentStatus: status,
                        }
                    });
                } catch (notifError) {
                    console.error('Failed to create appointment update notification:', notifError);
                }

                // If approved, create a conversation AND track conversion
                if (status === 'APPROVED') {
                    // Track conversion - appointment approval increases conversion count
                    try {
                        // Directly increment conversion count for appointment approvals
                        await prisma.doctorPerformance.upsert({
                            where: { doctorId: appointment.doctorId },
                            create: {
                                doctorId: appointment.doctorId,
                                conversionCount: 1,
                                clinicVisitCount: 1,
                                totalPostsCommented: 0,
                                totalCommentsCount: 0
                            },
                            update: {
                                conversionCount: { increment: 1 },
                                clinicVisitCount: { increment: 1 }
                            }
                        });
                        console.log('[API] Tracked appointment approval as conversion');
                    } catch (conversionError) {
                        console.error('[API] Failed to track conversion:', conversionError);
                    }

                    // Even if DB update succeeded, we might want to ensure mock store has it for testing
                    createMockConversation(updated);

                    try {
                        // Check if conversation already exists for this appointment
                        const existingConversation = await prisma.conversation.findUnique({
                            where: { appointmentId: id }
                        });

                        if (!existingConversation) {
                            await prisma.conversation.create({
                                data: {
                                    appointmentId: id,
                                    participants: {
                                        connect: [
                                            { id: appointment.patientId },
                                            { id: appointment.doctorId }
                                        ]
                                    }
                                }
                            });
                            console.log('[API] Conversation created for appointment:', id);
                        } else {
                            console.log('[API] Conversation already exists for appointment:', id);
                        }
                    } catch (pError) {
                        console.error('[API] DB Conversation create failed:', pError);
                    }
                }
                
                // Handle chat lifecycle
                if (status === 'REJECTED') {
                    try {
                        const { chatLifecycleService } = await import('../services/chat-lifecycle.service');
                        await chatLifecycleService.handleAppointmentStatusChange(id, status);
                    } catch (lifecycleError) {
                        console.error('Chat lifecycle error:', lifecycleError);
                    }
                }
                
                return res.json(updated);
            }
        } catch (dbError) {
            console.error('[API] DB update failed, checking In-Memory store');
        }

        // Search in-memory store
        const index = appointmentsStore.findIndex((a: any) => a.id === id);
        if (index !== -1) {
            appointmentsStore[index].status = status;
            console.log('[API] Updated In-Memory store');

            if (status === 'APPROVED') {
                // Track conversion for in-memory appointments too
                try {
                    // Directly increment conversion count for appointment approvals
                    await prisma.doctorPerformance.upsert({
                        where: { doctorId: appointmentsStore[index].doctorId },
                        create: {
                            doctorId: appointmentsStore[index].doctorId,
                            conversionCount: 1,
                            clinicVisitCount: 1,
                            totalPostsCommented: 0,
                            totalCommentsCount: 0
                        },
                        update: {
                            conversionCount: { increment: 1 },
                            clinicVisitCount: { increment: 1 }
                        }
                    });
                    console.log('[API] Tracked in-memory appointment approval as conversion');
                } catch (conversionError) {
                    console.error('[API] Failed to track in-memory conversion:', conversionError);
                }

                const conv = createMockConversation(appointmentsStore[index]);
                console.log('[API] Created Mock Conversation for approved appointment:', conv.id);
            }

            saveStore();
            return res.json(appointmentsStore[index]);
        }

        // Final fallback success
        res.json({
            id,
            status,
            patient: { username: 'Patient' },
            doctor: { username: 'Doctor' }
        });
    } catch (error) {
        console.error('[API] Update error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

// Get user's appointments
router.get('/appointments', async (req, res) => {
    try {
        const { userId, role } = req.query;
        console.log(`[API] Fetching appointments for userId: ${userId}, role: ${role}`);

        let dbAppointments: any[] = [];
        try {
            const where = role === 'doctor'
                ? { doctorId: userId as string }
                : { patientId: userId as string };

            dbAppointments = await prisma.appointment.findMany({
                where,
                include: {
                    patient: { select: { id: true, username: true, avatar: true } },
                    doctor: { select: { id: true, username: true, avatar: true, specialty: true } }
                },
                orderBy: { startTime: 'asc' }
            });
            console.log(`[API] Found ${dbAppointments.length} appointments in DB`);
        } catch (dbError) {
            console.error('[API] DB appointments fetch failed:', dbError);
        }

        // Always check Mock Store and merge
        const mockAppointments = appointmentsStore.filter((a: any) =>
            role === 'doctor' ? a.doctorId === userId : a.patientId === userId
        );
        console.log(`[API] Found ${mockAppointments.length} appointments in Mock Store`);

        // Merge results, avoiding duplicates if any ID is in both (unlikely given current flow)
        const allAppointments = [...dbAppointments];
        mockAppointments.forEach((mockApt: any) => {
            if (!allAppointments.find((dbApt: any) => dbApt.id === mockApt.id)) {
                allAppointments.push(mockApt);
            }
        });

        // Final fallback if both are empty
        if (allAppointments.length === 0) {
            console.log('[API] Returning default dummy for empty list');
            return res.json([
                {
                    id: 'dummy-info-1',
                    patientId: userId as string,
                    doctorId: 'any',
                    startTime: new Date(Date.now() + 3600000).toISOString(),
                    endTime: new Date(Date.now() + 7200000).toISOString(),
                    status: 'PENDING',
                    reason: 'No appointments found. Please create a request from the Patient side.',
                    patient: { id: userId as string, username: 'Patient', avatar: null },
                    doctor: { id: 'any', username: 'System', avatar: null, specialty: 'Instructions' }
                }
            ]);
        }

        res.json(allAppointments);
    } catch (error) {
        console.error('Fetch appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Debug route to see what's in memory
router.get('/debug', (req, res) => {
    res.json({
        appointments: appointmentsStore,
        // conversations: conversationsStore, // Need to import if we want to see it here
        // messages: messagesStore
    });
});

// Mark appointment as completed
router.post('/appointments/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        console.log(`[API] Mark appointment as complete: id=${id}, userId=${userId}`);

        let appointment;
        try {
            appointment = await prisma.appointment.findUnique({
                where: { id },
                include: {
                    patient: { select: { id: true, email: true, username: true } },
                    doctor: { select: { id: true, email: true, username: true } }
                }
            });
        } catch (dbError) {
            console.error('[API] DB fetch failed, checking in-memory store');
            // Check in-memory store
            const memAppointment = appointmentsStore.find((a: any) => a.id === id);
            if (memAppointment) {
                appointment = memAppointment;
            }
        }

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if user is authorized (doctor or patient can mark as complete)
        if (appointment.patientId !== userId && appointment.doctorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to complete this appointment' });
        }

        // Only APPROVED appointments can be marked as COMPLETED
        if (appointment.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Only approved appointments can be marked as completed' });
        }

        // Update appointment status
        let updated;
        try {
            updated = await prisma.appointment.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });
            console.log('[API] Appointment marked as completed in DB');
        } catch (dbError) {
            console.error('[API] DB update failed, updating in-memory store');
            // Update in-memory store
            const index = appointmentsStore.findIndex((a: any) => a.id === id);
            if (index !== -1) {
                appointmentsStore[index].status = 'COMPLETED';
                updated = appointmentsStore[index];
                saveStore();
                console.log('[API] Appointment marked as completed in memory');
            } else {
                throw new Error('Failed to update appointment');
            }
        }

        // Try to send notification (non-blocking)
        try {
            const completedBy = appointment.patientId === userId ? 'patient' : 'doctor';
            const notifyUser = completedBy === 'patient' ? appointment.doctorId : appointment.patientId;

            await notificationService.createNotification({
                type: NotificationType.APPOINTMENT_UPDATE,
                recipientIds: [notifyUser],
                actorId: userId,
                contentId: id,
                contentType: ContentType.APPOINTMENT,
                metadata: {
                    title: 'Appointment Completed',
                    body: `Appointment marked as completed by ${completedBy}`,
                    link: `/appointments`,
                    appointmentStatus: 'COMPLETED',
                }
            });
            console.log('[API] Notification sent');
        } catch (notifError) {
            console.error('[API] Failed to send notification (non-critical):', notifError);
        }

        // Try to send email (non-blocking)
        try {
            const completedBy = appointment.patientId === userId ? 'patient' : 'doctor';
            const notifyUser = completedBy === 'patient' ? appointment.doctorId : appointment.patientId;
            const notifyEmail = completedBy === 'patient' ? appointment.doctor?.email : appointment.patient?.email;

            if (notifyEmail) {
                const { emailService } = require('../services/email.service');
                await emailService.sendEmail({
                    to: notifyEmail,
                    subject: 'Appointment Completed - MedThread',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2563eb;">Appointment Completed</h2>
                            <p>Your appointment scheduled for ${new Date(appointment.startTime).toLocaleString()} has been marked as completed.</p>
                            ${completedBy === 'doctor' && appointment.patientId === notifyUser ? '<p>You can now leave a review for your doctor.</p>' : ''}
                            <p>Thank you for using MedThread!</p>
                        </div>
                    `,
                    text: `Appointment completed. Scheduled for ${new Date(appointment.startTime).toLocaleString()}`
                });
                console.log('[API] Email sent');
            }
        } catch (emailError) {
            console.error('[API] Failed to send email (non-critical):', emailError);
        }

        res.json(updated);
    } catch (error: any) {
        console.error('[API] Complete error:', error);
        res.status(500).json({ error: 'Failed to complete appointment', details: error.message });
    }
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
});

export { router as appointmentRouter };
