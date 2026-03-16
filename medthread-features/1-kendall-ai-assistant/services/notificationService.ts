// Browser notification service for VitaVoice

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
}

class NotificationService {
    private permission: NotificationPermission = 'default';

    /**
     * Initialize notification service
     */
    async init(): Promise<void> {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    /**
     * Check if notifications are supported
     */
    isSupported(): boolean {
        return 'Notification' in window;
    }

    /**
     * Check if permission is granted
     */
    isGranted(): boolean {
        return this.permission === 'granted';
    }

    /**
     * Show notification
     */
    async show(options: NotificationOptions): Promise<void> {
        if (!this.isSupported()) {
            console.warn('Notifications not supported');
            return;
        }

        if (!this.isGranted()) {
            const granted = await this.requestPermission();
            if (!granted) {
                console.warn('Notification permission denied');
                return;
            }
        }

        try {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/icon.png',
                tag: options.tag,
                data: options.data,
                requireInteraction: options.requireInteraction || false,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Schedule medication reminder
     */
    scheduleMedicationReminder(medicationName: string, time: string): void {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime < now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            this.show({
                title: '💊 Medication Reminder',
                body: `Time to take ${medicationName}`,
                tag: `medication-${medicationName}`,
                requireInteraction: true,
            });
        }, delay);
    }

    /**
     * Schedule vaccination reminder
     */
    scheduleVaccinationReminder(vaccineName: string, daysUntilDue: number): void {
        if (daysUntilDue <= 0) {
            this.show({
                title: '💉 Vaccination Due',
                body: `${vaccineName} is due now. Please visit your health center.`,
                tag: `vaccination-${vaccineName}`,
                requireInteraction: true,
            });
        } else if (daysUntilDue <= 7) {
            this.show({
                title: '💉 Vaccination Reminder',
                body: `${vaccineName} is due in ${daysUntilDue} days`,
                tag: `vaccination-${vaccineName}`,
            });
        }
    }

    /**
     * Show appointment reminder
     */
    showAppointmentReminder(doctorName: string, time: string): void {
        this.show({
            title: '👨‍⚕️ Appointment Reminder',
            body: `Your appointment with Dr. ${doctorName} is at ${time}`,
            tag: 'appointment',
            requireInteraction: true,
        });
    }
}

export const notificationService = new NotificationService();
