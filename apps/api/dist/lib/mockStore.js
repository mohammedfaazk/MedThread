"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockConversation = exports.saveStore = exports.availabilityStore = exports.messagesStore = exports.conversationsStore = exports.appointmentsStore = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const STORE_FILE = path_1.default.join(process.cwd(), 'temp_store.json');
const loadStore = () => {
    if (fs_1.default.existsSync(STORE_FILE)) {
        try {
            const data = JSON.parse(fs_1.default.readFileSync(STORE_FILE, 'utf8'));
            // Ensure all properties exist
            return {
                appointments: data.appointments || [],
                conversations: data.conversations || [],
                messages: data.messages || [],
                availability: data.availability || []
            };
        }
        catch (e) {
            console.error('Failed to load store:', e);
            return { appointments: [], conversations: [], messages: [], availability: [] };
        }
    }
    return { appointments: [], conversations: [], messages: [], availability: [] };
};
const store = loadStore();
exports.appointmentsStore = store.appointments;
exports.conversationsStore = store.conversations;
exports.messagesStore = store.messages;
exports.availabilityStore = store.availability;
const saveStore = () => {
    try {
        fs_1.default.writeFileSync(STORE_FILE, JSON.stringify({
            appointments: exports.appointmentsStore,
            conversations: exports.conversationsStore,
            messages: exports.messagesStore,
            availability: exports.availabilityStore
        }, null, 2));
        console.log('[STORE] Persisted to disk');
    }
    catch (e) {
        console.error('[STORE] Save failed:', e);
    }
};
exports.saveStore = saveStore;
const createMockConversation = (appointment) => {
    // Check if conversation already exists for this appointment
    const existingByAppointment = exports.conversationsStore.find((c) => c.appointmentId === appointment.id);
    if (existingByAppointment) {
        console.log(`[STORE] Conversation already exists for appointment ${appointment.id} (ID: ${existingByAppointment.id})`);
        return existingByAppointment;
    }
    // Also check if a conversation already exists between these two participants
    const patientIdLower = appointment.patientId.trim().toLowerCase();
    const doctorIdLower = appointment.doctorId.trim().toLowerCase();
    const existingByParticipants = exports.conversationsStore.find((c) => {
        if (!c.participantIds || c.participantIds.length !== 2)
            return false;
        const ids = c.participantIds.map((id) => id.trim().toLowerCase());
        return ids.includes(patientIdLower) && ids.includes(doctorIdLower);
    });
    if (existingByParticipants) {
        console.log(`[STORE] Conversation already exists between patient ${patientIdLower} and doctor ${doctorIdLower} (ID: ${existingByParticipants.id})`);
        // Update the existing conversation with this appointment if it doesn't have one
        if (!existingByParticipants.appointmentId) {
            existingByParticipants.appointmentId = appointment.id;
            (0, exports.saveStore)();
        }
        return existingByParticipants;
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
            patientIdLower,
            doctorIdLower
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
    exports.conversationsStore.push(conversation);
    (0, exports.saveStore)();
    console.log(`[STORE] Conversation created: ${conversation.id} with participants: ${conversation.participantIds.join(', ')}`);
    return conversation;
};
exports.createMockConversation = createMockConversation;
