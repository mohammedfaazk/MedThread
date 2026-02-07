import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'temp_store.json');

const loadStore = () => {
    if (fs.existsSync(STORE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
        } catch (e) {
            console.error('Failed to load store:', e);
            return { appointments: [], conversations: [], messages: [] };
        }
    }
    return { appointments: [], conversations: [], messages: [] };
};

const store = loadStore();

export const appointmentsStore = store.appointments;
export const conversationsStore = store.conversations;
export const messagesStore = store.messages;

export const saveStore = () => {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify({
            appointments: appointmentsStore,
            conversations: conversationsStore,
            messages: messagesStore
        }, null, 2));
        console.log('[STORE] Persisted to disk');
    } catch (e) {
        console.error('[STORE] Save failed:', e);
    }
};

export const createMockConversation = (appointment: any) => {
    // Check if it already exists
    const existing = conversationsStore.find((c: any) => c.appointmentId === appointment.id);
    if (existing) return existing;

    const conversation = {
        id: `conv-${appointment.id}`,
        appointmentId: appointment.id,
        participants: [
            { id: appointment.patientId, username: appointment.patient?.username || 'Patient', role: 'PATIENT' },
            { id: appointment.doctorId, username: appointment.doctor?.username || 'Doctor', role: 'DOCTOR' }
        ],
        participantIds: [appointment.patientId, appointment.doctorId],
        messages: [],
        appointment: {
            status: appointment.status,
            startTime: appointment.startTime,
            endTime: appointment.endTime
        }
    };
    conversationsStore.push(conversation);
    saveStore();
    return conversation;
};
