import { Router } from 'express';
import { PrismaClient } from '@medthread/database';

const router = Router();
const prisma = new PrismaClient();

import { appointmentsStore, availabilityStore, createMockConversation, saveStore } from '../lib/mockStore';

// Get doctor's availability
router.get('/doctors/:doctorId/availability', async (req, res) => {
    try {
        const { doctorId } = req.params;
        console.log(`[API] Fetching availability for doctorId: ${doctorId}`);

        let availability = [];
        try {
            availability = await prisma.availability.findMany({
                where: { doctorId, isBooked: false },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            });
            console.log(`[API] Found ${availability.length} slots in DB`);
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

            // Generate slots for the next 7 days (including today)
            for (let i = 0; i <= 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dayOfWeek = date.getDay();

                // Weekdays: 4pm - 8pm
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    for (let hour = 16; hour < 20; hour++) {
                        const start = new Date(date);
                        start.setHours(hour, 0, 0, 0);
                        const end = new Date(date);
                        end.setHours(hour + 1, 0, 0, 0);

                        defaultSlots.push({
                            id: `default-${dayOfWeek}-${hour}-${i}`,
                            doctorId,
                            dayOfWeek,
                            startTime: start,
                            endTime: end,
                            isBooked: false
                        });
                    }
                }
                // Weekends: 10am - 7pm
                else {
                    for (let hour = 10; hour < 19; hour++) {
                        const start = new Date(date);
                        start.setHours(hour, 0, 0, 0);
                        const end = new Date(date);
                        end.setHours(hour + 1, 0, 0, 0);

                        defaultSlots.push({
                            id: `default-${dayOfWeek}-${hour}-${i}`,
                            doctorId,
                            dayOfWeek,
                            startTime: start,
                            endTime: end,
                            isBooked: false
                        });
                    }
                }
            }
            availability = defaultSlots as any;
            console.log(`[API] Returning ${availability.length} default slots`);
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
                    patient: { select: { username: true, avatar: true } },
                    doctor: { select: { username: true, avatar: true, specialty: true } }
                }
            });
            console.log('[API] Saved to DB');
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

// Doctor approves/rejects appointment
router.put('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, doctorId } = req.body; // APPROVED or REJECTED
        console.log(`[API] Update status: id=${id}, status=${status}`);

        try {
            const appointment = await prisma.appointment.findUnique({
                where: { id }
            });

            if (appointment && appointment.doctorId === doctorId) {
                const updated = await prisma.appointment.update({
                    where: { id },
                    data: { status },
                    include: {
                        patient: { select: { username: true, avatar: true } },
                        doctor: { select: { username: true, avatar: true } }
                    }
                });

                // If approved, create a conversation
                if (status === 'APPROVED') {
                    // Even if DB update succeeded, we might want to ensure mock store has it for testing
                    createMockConversation(updated);

                    try {
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
                    } catch (pError) {
                        console.warn('[API] DB Conversation create failed (expected during mock testing)');
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

export { router as appointmentRouter };
