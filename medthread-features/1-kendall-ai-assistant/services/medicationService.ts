// Medication management service for VitaVoice

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: 'once' | 'twice' | 'thrice' | 'four_times' | 'as_needed';
    times: string[]; // e.g., ['09:00', '21:00']
    duration: {
        startDate: Date;
        endDate?: Date;
        ongoing: boolean;
    };
    instructions: string;
    familyMemberId?: string;
    remindersEnabled: boolean;
    takenHistory: {
        date: Date;
        taken: boolean;
        time: string;
    }[];
}

export interface MedicationReminder {
    medicationId: string;
    scheduledTime: string;
    date: Date;
    status: 'pending' | 'taken' | 'missed' | 'skipped';
}

class MedicationService {
    private medications: Medication[] = [];
    private reminders: MedicationReminder[] = [];

    /**
     * Initialize service and load data
     */
    async init(): Promise<void> {
        const saved = localStorage.getItem('vitavoice_medications');
        if (saved) {
            this.medications = JSON.parse(saved, (key, value) => {
                if (key === 'startDate' || key === 'endDate' || key === 'date') {
                    return value ? new Date(value) : value;
                }
                return value;
            });
        }
        this.scheduleReminders();
    }

    /**
     * Add new medication
     */
    addMedication(medication: Omit<Medication, 'id' | 'takenHistory'>): Medication {
        const newMed: Medication = {
            ...medication,
            id: Date.now().toString(),
            takenHistory: [],
        };

        this.medications.push(newMed);
        this.saveMedications();
        this.scheduleReminders();

        return newMed;
    }

    /**
     * Get all medications
     */
    getMedications(familyMemberId?: string): Medication[] {
        if (familyMemberId) {
            return this.medications.filter(m => m.familyMemberId === familyMemberId);
        }
        return this.medications;
    }

    /**
     * Get active medications (not ended)
     */
    getActiveMedications(familyMemberId?: string): Medication[] {
        const now = new Date();
        return this.getMedications(familyMemberId).filter(m => {
            if (m.duration.ongoing) return true;
            if (!m.duration.endDate) return true;
            return new Date(m.duration.endDate) >= now;
        });
    }

    /**
     * Mark medication as taken
     */
    markAsTaken(medicationId: string, time: string): void {
        const medication = this.medications.find(m => m.id === medicationId);
        if (medication) {
            medication.takenHistory.push({
                date: new Date(),
                taken: true,
                time,
            });
            this.saveMedications();
        }
    }

    /**
     * Mark medication as missed
     */
    markAsMissed(medicationId: string, time: string): void {
        const medication = this.medications.find(m => m.id === medicationId);
        if (medication) {
            medication.takenHistory.push({
                date: new Date(),
                taken: false,
                time,
            });
            this.saveMedications();
        }
    }

    /**
     * Get today's medication schedule
     */
    getTodaySchedule(familyMemberId?: string): Array<{
        medication: Medication;
        time: string;
        taken: boolean;
    }> {
        const activeMeds = this.getActiveMedications(familyMemberId);
        const today = new Date().toDateString();
        const schedule: Array<{ medication: Medication; time: string; taken: boolean }> = [];

        activeMeds.forEach(med => {
            med.times.forEach(time => {
                const takenToday = med.takenHistory.find(
                    h => new Date(h.date).toDateString() === today && h.time === time
                );
                schedule.push({
                    medication: med,
                    time,
                    taken: takenToday?.taken || false,
                });
            });
        });

        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));
        return schedule;
    }

    /**
     * Get adherence rate (percentage of medications taken on time)
     */
    getAdherenceRate(medicationId: string, days: number = 7): number {
        const medication = this.medications.find(m => m.id === medicationId);
        if (!medication) return 0;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentHistory = medication.takenHistory.filter(
            h => new Date(h.date) >= cutoffDate
        );

        if (recentHistory.length === 0) return 0;

        const taken = recentHistory.filter(h => h.taken).length;
        return Math.round((taken / recentHistory.length) * 100);
    }

    /**
     * Get medications needing refill (less than 7 days remaining)
     */
    getMedicationsNeedingRefill(): Medication[] {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        return this.medications.filter(m => {
            if (m.duration.ongoing) return false;
            if (!m.duration.endDate) return false;
            const endDate = new Date(m.duration.endDate);
            return endDate >= now && endDate <= sevenDaysFromNow;
        });
    }

    /**
     * Delete medication
     */
    deleteMedication(medicationId: string): void {
        this.medications = this.medications.filter(m => m.id !== medicationId);
        this.saveMedications();
    }

    /**
     * Update medication
     */
    updateMedication(medicationId: string, updates: Partial<Medication>): void {
        const index = this.medications.findIndex(m => m.id === medicationId);
        if (index !== -1) {
            this.medications[index] = { ...this.medications[index], ...updates };
            this.saveMedications();
            this.scheduleReminders();
        }
    }

    /**
     * Schedule reminders (would integrate with notification system)
     */
    private scheduleReminders(): void {
        // This would integrate with browser notifications or push notifications
        // For now, we'll just prepare the reminder data
        this.reminders = [];
        const activeMeds = this.getActiveMedications();

        activeMeds.forEach(med => {
            if (med.remindersEnabled) {
                med.times.forEach(time => {
                    this.reminders.push({
                        medicationId: med.id,
                        scheduledTime: time,
                        date: new Date(),
                        status: 'pending',
                    });
                });
            }
        });
    }

    /**
     * Save medications to localStorage
     */
    private saveMedications(): void {
        localStorage.setItem('vitavoice_medications', JSON.stringify(this.medications));
    }

    /**
     * Get medication statistics
     */
    getStatistics(familyMemberId?: string): {
        totalMedications: number;
        activeMedications: number;
        todaySchedule: number;
        takenToday: number;
        overallAdherence: number;
    } {
        const meds = this.getMedications(familyMemberId);
        const active = this.getActiveMedications(familyMemberId);
        const schedule = this.getTodaySchedule(familyMemberId);
        const taken = schedule.filter(s => s.taken).length;

        // Calculate overall adherence
        let totalAdherence = 0;
        active.forEach(med => {
            totalAdherence += this.getAdherenceRate(med.id, 30);
        });
        const overallAdherence = active.length > 0 ? Math.round(totalAdherence / active.length) : 0;

        return {
            totalMedications: meds.length,
            activeMedications: active.length,
            todaySchedule: schedule.length,
            takenToday: taken,
            overallAdherence,
        };
    }
}

export const medicationService = new MedicationService();
