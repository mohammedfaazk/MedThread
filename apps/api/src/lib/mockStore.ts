import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'temp_store.json');

const loadStore = () => {
    if (fs.existsSync(STORE_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
            // Ensure all properties exist
            return {
                appointments: data.appointments || [],
                conversations: data.conversations || [],
                messages: data.messages || [],
                availability: data.availability || []
            };
        } catch (e) {
            console.error('Failed to load store:', e);
            return { appointments: [], conversations: [], messages: [], availability: [] };
        }
    }
    return { appointments: [], conversations: [], messages: [], availability: [] };
};

const store = loadStore();

export const appointmentsStore = store.appointments;
export const conversationsStore = store.conversations;
export const messagesStore = store.messages;
export const availabilityStore = store.availability;

export const saveStore = () => {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify({
            appointments: appointmentsStore,
            conversations: conversationsStore,
            messages: messagesStore,
            availability: availabilityStore
        }, null, 2));
        console.log('[STORE] Persisted to disk');
    } catch (e) {
        console.error('[STORE] Save failed:', e);
    }
};

export const createMockConversation = (appointment: any) => {
    // Check if it already exists
    const existing = conversationsStore.find((c: any) => c.appointmentId === appointment.id);
    if (existing) {
        console.log(`[STORE] Conversation already exists for appointment ${appointment.id} (ID: ${existing.id})`);
        return existing;
    }

    console.log(`[STORE] Creating new conversation for appointment ${appointment.id}`);
    console.log(`[STORE] Patient ID: ${appointment.patientId}, Doctor ID: ${appointment.doctorId}`);

    const conversation = {
        id: `conv-${appointment.id}`,
        appointmentId: appointment.id,
        participants: [
            {
                id: appointment.patientId,
                username: appointment.patient?.username || 'Patient',
                avatar: appointment.patient?.avatar || null,
                role: 'PATIENT'
            },
            {
                id: appointment.doctorId,
                username: appointment.doctor?.username || 'Doctor',
                avatar: appointment.doctor?.avatar || null,
                role: 'VERIFIED_DOCTOR'
            }
        ],
        participantIds: [
            appointment.patientId.trim().toLowerCase(),
            appointment.doctorId.trim().toLowerCase()
        ],
        messages: [],
        appointment: {
            status: appointment.status,
            startTime: appointment.startTime,
            endTime: appointment.endTime
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    conversationsStore.push(conversation);
    saveStore();
    console.log(`[STORE] Conversation created: ${conversation.id} with participants: ${conversation.participantIds.join(', ')}`);
    return conversation;
};
