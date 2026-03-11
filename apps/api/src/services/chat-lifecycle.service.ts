import { prisma, AppointmentStatus, DoctorVerificationStatus } from '@medthread/database';
import { chatService } from './chat.service';

/**
 * Service to handle chat lifecycle events based on appointment and doctor status changes
 */
class ChatLifecycleService {
  /**
   * Handle appointment status change
   * Deactivate chat if appointment is cancelled or rejected
   */
  async handleAppointmentStatusChange(appointmentId: string, newStatus: AppointmentStatus) {
    try {
      // Find conversation for this appointment
      const conversation = await prisma.conversation.findUnique({
        where: { appointmentId }
      });

      if (!conversation) {
        return; // No conversation exists yet
      }

      // Deactivate chat if appointment is cancelled, rejected, or completed
      if ([
        AppointmentStatus.CANCELLED,
        AppointmentStatus.REJECTED,
        AppointmentStatus.COMPLETED
      ].includes(newStatus)) {
        const reasons = {
          [AppointmentStatus.CANCELLED]: 'Appointment was cancelled',
          [AppointmentStatus.REJECTED]: 'Appointment was rejected',
          [AppointmentStatus.COMPLETED]: 'Appointment has been completed'
        };

        await chatService.deactivateConversation(
          conversation.id,
          reasons[newStatus]
        );

        console.log(`[ChatLifecycle] Deactivated conversation ${conversation.id} due to appointment ${newStatus}`);
      }
    } catch (error) {
      console.error('[ChatLifecycle] Error handling appointment status change:', error);
    }
  }

  /**
   * Handle doctor verification status change
   * Deactivate all doctor's chats if verification is lost
   */
  async handleDoctorVerificationChange(
    doctorId: string,
    newStatus: DoctorVerificationStatus
  ) {
    try {
      // If doctor loses verification, deactivate all their conversations
      if (newStatus !== DoctorVerificationStatus.APPROVED) {
        const conversations = await prisma.conversation.findMany({
          where: {
            doctorId,
            isActive: true
          }
        });

        for (const conversation of conversations) {
          await chatService.deactivateConversation(
            conversation.id,
            'Doctor verification status changed'
          );
        }

        console.log(`[ChatLifecycle] Deactivated ${conversations.length} conversations for doctor ${doctorId}`);
      }
    } catch (error) {
      console.error('[ChatLifecycle] Error handling doctor verification change:', error);
    }
  }

  /**
   * Handle user blocking
   * Deactivate conversations between blocked users
   */
  async handleUserBlocked(blockerId: string, blockedId: string) {
    try {
      // Find conversations between these users
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { patientId: blockerId, doctorId: blockedId },
            { patientId: blockedId, doctorId: blockerId }
          ],
          isActive: true
        }
      });

      for (const conversation of conversations) {
        await chatService.deactivateConversation(
          conversation.id,
          'User has been blocked'
        );
      }

      console.log(`[ChatLifecycle] Deactivated ${conversations.length} conversations due to blocking`);
    } catch (error) {
      console.error('[ChatLifecycle] Error handling user block:', error);
    }
  }

  /**
   * Cleanup expired conversations
   * Run as a cron job to deactivate conversations for expired appointments
   */
  async cleanupExpiredConversations() {
    try {
      const now = new Date();
      
      // Find conversations with appointments that ended more than 24 hours ago
      const expiredConversations = await prisma.conversation.findMany({
        where: {
          isActive: true,
          appointment: {
            endTime: {
              lt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            },
            status: AppointmentStatus.APPROVED
          }
        },
        include: {
          appointment: true
        }
      });

      for (const conversation of expiredConversations) {
        await chatService.deactivateConversation(
          conversation.id,
          'Appointment has expired'
        );
      }

      console.log(`[ChatLifecycle] Cleaned up ${expiredConversations.length} expired conversations`);
      return expiredConversations.length;
    } catch (error) {
      console.error('[ChatLifecycle] Error cleaning up expired conversations:', error);
      return 0;
    }
  }

  /**
   * Reactivate conversation if appointment is re-approved
   */
  async reactivateConversation(appointmentId: string) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              doctor: {
                select: { doctorVerificationStatus: true }
              }
            }
          }
        }
      });

      if (!conversation) {
        return;
      }

      // Only reactivate if doctor is still verified and appointment is approved
      if (
        conversation.appointment?.status === AppointmentStatus.APPROVED &&
        conversation.appointment.doctor.doctorVerificationStatus === DoctorVerificationStatus.APPROVED
      ) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { isActive: true }
        });

        console.log(`[ChatLifecycle] Reactivated conversation ${conversation.id}`);
      }
    } catch (error) {
      console.error('[ChatLifecycle] Error reactivating conversation:', error);
    }
  }
}

export const chatLifecycleService = new ChatLifecycleService();
