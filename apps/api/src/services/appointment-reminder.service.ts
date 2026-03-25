import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';

export const appointmentReminderService = {
  /**
   * Schedule reminders for an appointment
   */
  async scheduleReminders(appointmentId: string) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true
        }
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const appointmentTime = new Date(appointment.startTime);
      const now = new Date();

      // Calculate reminder times
      const oneDayBefore = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
      const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);

      // Schedule 24-hour reminder
      if (oneDayBefore > now) {
        await this.createReminderNotification(appointment, '24 hours');
      }

      // Schedule 1-hour reminder
      if (oneHourBefore > now) {
        await this.createReminderNotification(appointment, '1 hour');
      }

      return { success: true, message: 'Reminders scheduled' };
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
    }
  },

  /**
   * Create reminder notification
   */
  async createReminderNotification(appointment: any, timeframe: string) {
    try {
      // Create notification for patient
      await notificationService.createNotification({
        type: 'APPOINTMENT_UPDATE',
        recipientId: appointment.patientId,
        actorId: appointment.doctorId,
        contentId: appointment.id,
        contentType: 'APPOINTMENT',
        metadata: {
          message: `Reminder: Your appointment with Dr. ${appointment.doctor.fullName} is in ${timeframe}`,
          appointmentTime: appointment.startTime,
          doctorName: appointment.doctor.fullName,
          timeframe
        }
      });

      // Create notification for doctor
      await notificationService.createNotification({
        type: 'APPOINTMENT_UPDATE',
        recipientId: appointment.doctorId,
        actorId: appointment.patientId,
        contentId: appointment.id,
        contentType: 'APPOINTMENT',
        metadata: {
          message: `Reminder: Appointment with ${appointment.patient.fullName} is in ${timeframe}`,
          appointmentTime: appointment.startTime,
          patientName: appointment.patient.fullName,
          timeframe
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating reminder notification:', error);
      throw error;
    }
  },

  /**
   * Check and send due reminders (to be called by cron job)
   */
  async sendDueReminders() {
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find appointments in the next 24 hours
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          startTime: {
            gte: now,
            lte: oneDayFromNow
          },
          status: 'APPROVED'
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      let remindersSent = 0;

      for (const appointment of upcomingAppointments) {
        const appointmentTime = new Date(appointment.startTime);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const hoursUntil = timeDiff / (1000 * 60 * 60);

        // Send 24-hour reminder
        if (hoursUntil <= 24 && hoursUntil > 23) {
          await this.createReminderNotification(appointment, '24 hours');
          remindersSent++;
        }

        // Send 1-hour reminder
        if (hoursUntil <= 1 && hoursUntil > 0.5) {
          await this.createReminderNotification(appointment, '1 hour');
          remindersSent++;
        }
      }

      return {
        success: true,
        remindersSent,
        appointmentsChecked: upcomingAppointments.length
      };
    } catch (error) {
      console.error('Error sending due reminders:', error);
      throw error;
    }
  },

  /**
   * Get upcoming appointments for a user
   */
  async getUpcomingAppointments(userId: string, role: 'patient' | 'doctor') {
    try {
      const where = role === 'patient'
        ? { patientId: userId }
        : { doctorId: userId };

      const appointments = await prisma.appointment.findMany({
        where: {
          ...where,
          startTime: {
            gte: new Date()
          },
          status: 'APPROVED'
        },
        include: {
          patient: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePicture: true
            }
          },
          doctor: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePicture: true,
              specialty: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 10
      });

      return appointments;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }
};
