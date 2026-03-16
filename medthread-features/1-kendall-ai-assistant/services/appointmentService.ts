// Doctor appointment booking service for VitaVoice

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
    experience: number;
    rating: number;
    availableSlots: TimeSlot[];
}

export interface TimeSlot {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface Appointment {
    id: string;
    userId: string;
    doctorId: string;
    doctorName: string;
    specialization: string;
    date: Date;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    symptoms?: string;
    notes?: string;
    createdAt: Date;
}

// Mock doctor database
const DOCTORS: Doctor[] = [
    {
        id: 'doc1',
        name: 'Dr. Rajesh Kumar',
        specialization: 'General Physician',
        hospital: 'Primary Health Center',
        experience: 15,
        rating: 4.5,
        availableSlots: [],
    },
    {
        id: 'doc2',
        name: 'Dr. Priya Sharma',
        specialization: 'Pediatrician',
        hospital: 'Community Health Center',
        experience: 10,
        rating: 4.8,
        availableSlots: [],
    },
    {
        id: 'doc3',
        name: 'Dr. Anil Verma',
        specialization: 'Cardiologist',
        hospital: 'District Hospital',
        experience: 20,
        rating: 4.7,
        availableSlots: [],
    },
    {
        id: 'doc4',
        name: 'Dr. Sunita Patel',
        specialization: 'Gynecologist',
        hospital: 'Women\'s Health Clinic',
        experience: 12,
        rating: 4.6,
        availableSlots: [],
    },
    {
        id: 'doc5',
        name: 'Dr. Vikram Singh',
        specialization: 'Orthopedic',
        hospital: 'District Hospital',
        experience: 18,
        rating: 4.4,
        availableSlots: [],
    },
];

class AppointmentService {
    private appointments: Appointment[] = [];

    /**
     * Initialize service
     */
    async init(): Promise<void> {
        const saved = localStorage.getItem('vitavoice_appointments');
        if (saved) {
            this.appointments = JSON.parse(saved, (key, value) => {
                if (key === 'date' || key === 'createdAt') {
                    return value ? new Date(value) : value;
                }
                return value;
            });
        }

        // Generate time slots for doctors
        this.generateTimeSlots();
    }

    /**
     * Get all doctors
     */
    getDoctors(specialization?: string): Doctor[] {
        if (specialization) {
            return DOCTORS.filter(d => d.specialization === specialization);
        }
        return DOCTORS;
    }

    /**
     * Get doctor by ID
     */
    getDoctorById(id: string): Doctor | undefined {
        return DOCTORS.find(d => d.id === id);
    }

    /**
     * Get specializations
     */
    getSpecializations(): string[] {
        return Array.from(new Set(DOCTORS.map(d => d.specialization)));
    }

    /**
     * Get available slots for a doctor
     */
    getAvailableSlots(doctorId: string, date: Date): TimeSlot[] {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return [];

        // Filter slots for the specific date
        return doctor.availableSlots.filter(slot => {
            const slotDate = new Date(slot.date);
            return (
                slotDate.toDateString() === date.toDateString() &&
                slot.available
            );
        });
    }

    /**
     * Book appointment
     */
    bookAppointment(
        userId: string,
        doctorId: string,
        slotId: string,
        symptoms?: string,
        notes?: string
    ): Appointment | null {
        const doctor = this.getDoctorById(doctorId);
        if (!doctor) return null;

        const slot = doctor.availableSlots.find(s => s.id === slotId);
        if (!slot || !slot.available) return null;

        // Mark slot as unavailable
        slot.available = false;

        // Create appointment
        const appointment: Appointment = {
            id: Date.now().toString(),
            userId,
            doctorId,
            doctorName: doctor.name,
            specialization: doctor.specialization,
            date: slot.date,
            time: slot.startTime,
            status: 'scheduled',
            symptoms,
            notes,
            createdAt: new Date(),
        };

        this.appointments.push(appointment);
        this.saveAppointments();

        return appointment;
    }

    /**
     * Get user appointments
     */
    getUserAppointments(userId: string, status?: Appointment['status']): Appointment[] {
        let appointments = this.appointments.filter(a => a.userId === userId);

        if (status) {
            appointments = appointments.filter(a => a.status === status);
        }

        // Sort by date (newest first)
        return appointments.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Get upcoming appointments
     */
    getUpcomingAppointments(userId: string): Appointment[] {
        const now = new Date();
        return this.appointments
            .filter(a => a.userId === userId && a.status === 'scheduled' && a.date >= now)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Cancel appointment
     */
    cancelAppointment(appointmentId: string): boolean {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return false;

        appointment.status = 'cancelled';

        // Make slot available again
        const doctor = this.getDoctorById(appointment.doctorId);
        if (doctor) {
            const slot = doctor.availableSlots.find(
                s => s.date.toDateString() === appointment.date.toDateString() &&
                    s.startTime === appointment.time
            );
            if (slot) {
                slot.available = true;
            }
        }

        this.saveAppointments();
        return true;
    }

    /**
     * Generate time slots for doctors
     */
    private generateTimeSlots(): void {
        const today = new Date();

        DOCTORS.forEach(doctor => {
            doctor.availableSlots = [];

            // Generate slots for next 7 days
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(date.getDate() + day);

                // Morning slots: 9 AM - 12 PM
                const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

                // Evening slots: 4 PM - 7 PM
                const eveningSlots = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];

                const allSlots = [...morningSlots, ...eveningSlots];

                allSlots.forEach(time => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const endTime = `${String(hours).padStart(2, '0')}:${String(minutes + 30).padStart(2, '0')}`;

                    doctor.availableSlots.push({
                        id: `${doctor.id}-${date.toISOString()}-${time}`,
                        date: new Date(date),
                        startTime: time,
                        endTime,
                        available: true,
                    });
                });
            }
        });
    }

    /**
     * Save appointments
     */
    private saveAppointments(): void {
        localStorage.setItem('vitavoice_appointments', JSON.stringify(this.appointments));
    }
}

export const appointmentService = new AppointmentService();
