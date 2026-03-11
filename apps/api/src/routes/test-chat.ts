import { Router } from 'express';
import { appointmentsStore, createMockConversation, saveStore } from '../lib/mockStore';

const router = Router();

// Test endpoint to create a mock approved appointment and conversation
router.post('/create-test-conversation', async (req, res) => {
    try {
        const { patientId, doctorId } = req.body;
        
        if (!patientId || !doctorId) {
            return res.status(400).json({ 
                error: 'Missing required fields: patientId and doctorId' 
            });
        }

        // Create a mock approved appointment
        const appointment = {
            id: `test-app-${Date.now()}`,
            patientId,
            doctorId,
            startTime: new Date(Date.now() + 3600000).toISOString(),
            endTime: new Date(Date.now() + 7200000).toISOString(),
            status: 'APPROVED',
            reason: 'Test appointment for chat',
            patient: { 
                id: patientId, 
                username: 'Test Patient', 
                avatar: null 
            },
            doctor: { 
                id: doctorId, 
                username: 'Test Doctor', 
                avatar: null, 
                specialty: 'General Medicine' 
            }
        };

        // Add to appointments store
        appointmentsStore.push(appointment);
        
        // Create conversation
        const conversation = createMockConversation(appointment);
        
        // Save to disk
        saveStore();

        res.json({
            success: true,
            appointment,
            conversation,
            message: 'Test conversation created successfully'
        });
    } catch (error) {
        console.error('Error creating test conversation:', error);
        res.status(500).json({ 
            error: 'Failed to create test conversation',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get current store state
router.get('/store-state', (req, res) => {
    const { appointmentsStore, conversationsStore } = require('../lib/mockStore');
    res.json({
        appointments: appointmentsStore,
        conversations: conversationsStore
    });
});

export { router as testChatRouter };
