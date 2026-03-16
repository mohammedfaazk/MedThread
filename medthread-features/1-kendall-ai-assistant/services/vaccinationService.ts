// Vaccination tracking service for VitaVoice

export interface Vaccine {
    id: string;
    name: string;
    ageMonths: number;
    description: string;
    doses: number;
    category: 'infant' | 'child' | 'adult' | 'pregnancy';
}

export interface VaccinationRecord {
    id: string;
    patientHealthRecordId: string;
    vaccineId: string;
    vaccineName: string;
    dateGiven: Date;
    doseNumber: number;
    batchNumber?: string;
    location?: string;
    nextDueDate?: Date;
    notes?: string;
    isCompleted: boolean;
}

// Indian National Immunization Schedule
const VACCINATION_SCHEDULE: Vaccine[] = [
    // Birth
    { id: 'bcg', name: 'BCG', ageMonths: 0, description: 'Tuberculosis vaccine', doses: 1, category: 'infant' },
    { id: 'opv_0', name: 'OPV (Birth dose)', ageMonths: 0, description: 'Polio vaccine', doses: 1, category: 'infant' },
    { id: 'hep_b_0', name: 'Hepatitis B (Birth dose)', ageMonths: 0, description: 'Hepatitis B vaccine', doses: 1, category: 'infant' },

    // 6 weeks
    { id: 'opv_1', name: 'OPV 1', ageMonths: 1.5, description: 'Polio vaccine - 1st dose', doses: 1, category: 'infant' },
    { id: 'pentavalent_1', name: 'Pentavalent 1', ageMonths: 1.5, description: 'DPT+HepB+Hib - 1st dose', doses: 1, category: 'infant' },
    { id: 'rotavirus_1', name: 'Rotavirus 1', ageMonths: 1.5, description: 'Rotavirus vaccine - 1st dose', doses: 1, category: 'infant' },
    { id: 'pcv_1', name: 'PCV 1', ageMonths: 1.5, description: 'Pneumococcal vaccine - 1st dose', doses: 1, category: 'infant' },

    // 10 weeks
    { id: 'opv_2', name: 'OPV 2', ageMonths: 2.5, description: 'Polio vaccine - 2nd dose', doses: 1, category: 'infant' },
    { id: 'pentavalent_2', name: 'Pentavalent 2', ageMonths: 2.5, description: 'DPT+HepB+Hib - 2nd dose', doses: 1, category: 'infant' },
    { id: 'rotavirus_2', name: 'Rotavirus 2', ageMonths: 2.5, description: 'Rotavirus vaccine - 2nd dose', doses: 1, category: 'infant' },
    { id: 'pcv_2', name: 'PCV 2', ageMonths: 2.5, description: 'Pneumococcal vaccine - 2nd dose', doses: 1, category: 'infant' },

    // 14 weeks
    { id: 'opv_3', name: 'OPV 3', ageMonths: 3.5, description: 'Polio vaccine - 3rd dose', doses: 1, category: 'infant' },
    { id: 'pentavalent_3', name: 'Pentavalent 3', ageMonths: 3.5, description: 'DPT+HepB+Hib - 3rd dose', doses: 1, category: 'infant' },
    { id: 'rotavirus_3', name: 'Rotavirus 3', ageMonths: 3.5, description: 'Rotavirus vaccine - 3rd dose', doses: 1, category: 'infant' },
    { id: 'pcv_3', name: 'PCV 3', ageMonths: 3.5, description: 'Pneumococcal vaccine - 3rd dose', doses: 1, category: 'infant' },
    { id: 'ipv_1', name: 'IPV 1', ageMonths: 3.5, description: 'Injectable Polio vaccine', doses: 1, category: 'infant' },

    // 9 months
    { id: 'measles_1', name: 'Measles 1', ageMonths: 9, description: 'Measles vaccine - 1st dose', doses: 1, category: 'infant' },

    // 12 months
    { id: 'pcv_booster', name: 'PCV Booster', ageMonths: 12, description: 'Pneumococcal booster', doses: 1, category: 'child' },

    // 16-24 months
    { id: 'dpt_booster_1', name: 'DPT Booster 1', ageMonths: 18, description: 'DPT booster - 1st', doses: 1, category: 'child' },
    { id: 'opv_booster', name: 'OPV Booster', ageMonths: 18, description: 'Polio booster', doses: 1, category: 'child' },
    { id: 'measles_2', name: 'Measles 2 (MR)', ageMonths: 18, description: 'Measles-Rubella - 2nd dose', doses: 1, category: 'child' },

    // 5-6 years
    { id: 'dpt_booster_2', name: 'DPT Booster 2', ageMonths: 60, description: 'DPT booster - 2nd', doses: 1, category: 'child' },

    // 10 years
    { id: 'tdap', name: 'Tdap', ageMonths: 120, description: 'Tetanus-Diphtheria-Pertussis', doses: 1, category: 'child' },

    // Pregnancy
    { id: 'td_1', name: 'TD 1', ageMonths: 0, description: 'Tetanus-Diphtheria - 1st dose (Pregnancy)', doses: 1, category: 'pregnancy' },
    { id: 'td_2', name: 'TD 2', ageMonths: 0, description: 'Tetanus-Diphtheria - 2nd dose (Pregnancy)', doses: 1, category: 'pregnancy' },
];

class VaccinationService {
    private supabase: any = null;
    private records: VaccinationRecord[] = [];

    setSupabaseClient(supabaseClient: any): void {
        this.supabase = supabaseClient;
    }

    async init(userId: string): Promise<void> {
        if (!this.supabase) {
            console.warn('Supabase not initialized');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('vaccination_records')
                .select('*')
                .eq('user_id', userId)
                .order('date_given', { ascending: false });

            if (error) throw error;

            this.records = (data || []).map((record: any) => ({
                id: record.id,
                patientHealthRecordId: record.patient_health_record_id,
                vaccineId: record.vaccine_id,
                vaccineName: record.vaccine_name,
                dateGiven: new Date(record.date_given),
                doseNumber: record.dose_number,
                batchNumber: record.batch_number,
                location: record.location,
                nextDueDate: record.next_due_date ? new Date(record.next_due_date) : undefined,
                notes: record.notes,
                isCompleted: record.is_completed,
            }));
        } catch (error) {
            console.error('Error loading vaccination records:', error);
            this.records = [];
        }
    }

    getSchedule(category?: 'infant' | 'child' | 'adult' | 'pregnancy'): Vaccine[] {
        if (category) {
            return VACCINATION_SCHEDULE.filter(v => v.category === category);
        }
        return VACCINATION_SCHEDULE;
    }

    async addRecord(record: Omit<VaccinationRecord, 'id'>, userId: string): Promise<VaccinationRecord | null> {
        if (!this.supabase) {
            console.warn('Supabase not initialized');
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('vaccination_records')
                .insert({
                    user_id: userId,
                    patient_health_record_id: record.patientHealthRecordId,
                    vaccine_id: record.vaccineId,
                    vaccine_name: record.vaccineName,
                    date_given: record.dateGiven.toISOString(),
                    dose_number: record.doseNumber,
                    batch_number: record.batchNumber,
                    location: record.location,
                    next_due_date: record.nextDueDate?.toISOString(),
                    notes: record.notes,
                    is_completed: record.isCompleted,
                })
                .select()
                .single();

            if (error) throw error;

            const newRecord: VaccinationRecord = {
                id: data.id,
                patientHealthRecordId: data.patient_health_record_id,
                vaccineId: data.vaccine_id,
                vaccineName: data.vaccine_name,
                dateGiven: new Date(data.date_given),
                doseNumber: data.dose_number,
                batchNumber: data.batch_number,
                location: data.location,
                nextDueDate: data.next_due_date ? new Date(data.next_due_date) : undefined,
                notes: data.notes,
                isCompleted: data.is_completed,
            };

            this.records.push(newRecord);
            return newRecord;
        } catch (error) {
            console.error('Error saving vaccination record:', error);
            return null;
        }
    }

    getRecords(patientHealthRecordId: string): VaccinationRecord[] {
        return this.records.filter(r => r.patientHealthRecordId === patientHealthRecordId);
    }

    getDueVaccines(patientHealthRecordId: string, ageMonths: number): Vaccine[] {
        const givenRecords = this.getRecords(patientHealthRecordId);
        const givenVaccineIds = new Set(givenRecords.map(r => r.vaccineId));

        return VACCINATION_SCHEDULE.filter(vaccine => {
            if (givenVaccineIds.has(vaccine.id)) return false;
            return ageMonths >= vaccine.ageMonths && ageMonths <= vaccine.ageMonths + 2;
        });
    }

    getOverdueVaccines(patientHealthRecordId: string, ageMonths: number): Vaccine[] {
        const givenRecords = this.getRecords(patientHealthRecordId);
        const givenVaccineIds = new Set(givenRecords.map(r => r.vaccineId));

        return VACCINATION_SCHEDULE.filter(vaccine => {
            if (givenVaccineIds.has(vaccine.id)) return false;
            return ageMonths > vaccine.ageMonths + 2;
        });
    }

    getUpcomingVaccines(patientHealthRecordId: string, ageMonths: number): Vaccine[] {
        const givenRecords = this.getRecords(patientHealthRecordId);
        const givenVaccineIds = new Set(givenRecords.map(r => r.vaccineId));

        return VACCINATION_SCHEDULE.filter(vaccine => {
            if (givenVaccineIds.has(vaccine.id)) return false;
            return vaccine.ageMonths > ageMonths && vaccine.ageMonths <= ageMonths + 3;
        });
    }

    getCompletionPercentage(patientHealthRecordId: string, ageMonths: number): number {
        const givenRecords = this.getRecords(patientHealthRecordId);
        const applicableVaccines = VACCINATION_SCHEDULE.filter(v => v.ageMonths <= ageMonths);

        if (applicableVaccines.length === 0) return 0;

        const givenVaccineIds = new Set(givenRecords.map(r => r.vaccineId));
        const givenCount = applicableVaccines.filter(v => givenVaccineIds.has(v.id)).length;

        return Math.round((givenCount / applicableVaccines.length) * 100);
    }

    generateCertificate(patientHealthRecordId: string): {
        patientHealthRecordId: string;
        records: VaccinationRecord[];
        completionPercentage: number;
        generatedDate: Date;
    } {
        const records = this.getRecords(patientHealthRecordId);
        return {
            patientHealthRecordId,
            records,
            completionPercentage: 100,
            generatedDate: new Date(),
        };
    }

    async deleteRecord(recordId: string, userId: string): Promise<boolean> {
        if (!this.supabase) {
            console.warn('Supabase not initialized');
            return false;
        }

        try {
            const { error } = await this.supabase
                .from('vaccination_records')
                .delete()
                .eq('id', recordId)
                .eq('user_id', userId);

            if (error) throw error;

            this.records = this.records.filter(r => r.id !== recordId);
            return true;
        } catch (error) {
            console.error('Error deleting vaccination record:', error);
            return false;
        }
    }

    getStatistics(patientHealthRecordId: string, ageMonths: number): {
        totalGiven: number;
        dueNow: number;
        overdue: number;
        upcoming: number;
        completionPercentage: number;
    } {
        return {
            totalGiven: this.getRecords(patientHealthRecordId).length,
            dueNow: this.getDueVaccines(patientHealthRecordId, ageMonths).length,
            overdue: this.getOverdueVaccines(patientHealthRecordId, ageMonths).length,
            upcoming: this.getUpcomingVaccines(patientHealthRecordId, ageMonths).length,
            completionPercentage: this.getCompletionPercentage(patientHealthRecordId, ageMonths),
        };
    }
}

export const vaccinationService = new VaccinationService();