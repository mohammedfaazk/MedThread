import { Request, Response, NextFunction } from 'express';
import { prisma, DoctorVerificationStatus, AppointmentStatus } from '@medthread/database';
import { AuthRequest } from './auth';

export interface ChatPermissionRequest extends AuthRequest {
  conversationId?: string;
  appointmentId?: string;
  canAccessChat?: boolean;
}

/**
 * Middleware to validate appointment-gated chat access
 * 
 * Rules:
 * 1. Doctor must be VERIFIED
 * 2. Appointment status must be APPROVED
 * 3. Appointment must be active (not cancelled or expired)
 * 4. User must be either the patient or the assigned doctor
 */
export const validateChatAccess = async (
  req: ChatPermissionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const conversationId = req.params.conversationId || req.body.conversationId;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!conversationId) {
      return res.status(400).json({ 
        error: 'Conversation ID required',
        code: 'CONVERSATION_ID_REQUIRED'
      });
    }

    // Fetch conversation with appointment and participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        appointment: {
          include: {
            patient: {
              select: { id: true, username: true }
            },
            doctor: {
              select: { 
                id: true, 
                username: true, 
                doctorVerificationStatus: true 
              }
            }
          }
        }
      }
    });

    console.log('[ChatPermission] Checking access for:', {
      conversationId,
      userId,
      conversationFound: !!conversation,
      appointmentFound: !!conversation?.appointment
    });

    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation not found',
        code: 'CONVERSATION_NOT_FOUND'
      });
    }

    // Validate appointment exists
    if (!conversation.appointment) {
      return res.status(403).json({ 
        error: 'No appointment associated with this conversation',
        code: 'NO_APPOINTMENT'
      });
    }

    const appointment = conversation.appointment;

    // Rule 1: Check if user is participant
    const isPatient = appointment.patientId === userId;
    const isDoctor = appointment.doctorId === userId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ 
        error: 'You are not authorized to access this conversation',
        code: 'NOT_PARTICIPANT'
      });
    }

    // Rule 2: Validate doctor is verified
    console.log('[ChatPermission] Doctor verification check:', {
      doctorId: appointment.doctor.id,
      status: appointment.doctor.doctorVerificationStatus,
      required: DoctorVerificationStatus.APPROVED
    });
    
    if (appointment.doctor.doctorVerificationStatus !== DoctorVerificationStatus.APPROVED) {
      return res.status(403).json({ 
        error: 'Doctor verification required for chat access',
        code: 'DOCTOR_NOT_VERIFIED',
        details: {
          doctorStatus: appointment.doctor.doctorVerificationStatus
        }
      });
    }

    // Rule 3: Validate appointment is approved
    console.log('[ChatPermission] Appointment status check:', {
      appointmentId: appointment.id,
      status: appointment.status,
      required: AppointmentStatus.APPROVED
    });
    
    if (appointment.status !== AppointmentStatus.APPROVED) {
      return res.status(403).json({ 
        error: 'Chat is only available for approved appointments',
        code: 'APPOINTMENT_NOT_APPROVED',
        details: {
          currentStatus: appointment.status,
          requiredStatus: 'APPROVED'
        }
      });
    }

    // Rule 4: Check if appointment is expired (optional - based on business rules)
    const now = new Date();
    const appointmentEnd = new Date(appointment.endTime);
    
    // Allow chat for 7 days after appointment ends (configurable via env)
    const gracePeriodDays = parseInt(process.env.CHAT_GRACE_PERIOD_DAYS || '7');
    const chatExpiryTime = new Date(appointmentEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
    
    console.log('[ChatPermission] Expiry check:', {
      now: now.toISOString(),
      appointmentEnd: appointmentEnd.toISOString(),
      chatExpiryTime: chatExpiryTime.toISOString(),
      gracePeriodDays,
      isExpired: now > chatExpiryTime,
      isDevelopment: process.env.NODE_ENV === 'development'
    });
    
    // Skip expiry check in development mode
    if (process.env.NODE_ENV !== 'development' && now > chatExpiryTime) {
      return res.status(403).json({ 
        error: 'Chat access has expired for this appointment',
        code: 'APPOINTMENT_EXPIRED',
        details: {
          appointmentEnd: appointment.endTime,
          chatExpiryTime: chatExpiryTime.toISOString(),
          gracePeriodDays
        }
      });
    }

    // Check for blocking
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: appointment.patientId, blockedId: appointment.doctorId },
          { blockerId: appointment.doctorId, blockedId: appointment.patientId }
        ]
      }
    });

    if (isBlocked) {
      return res.status(403).json({ 
        error: 'Chat access blocked',
        code: 'USER_BLOCKED'
      });
    }

    // Attach validated data to request
    req.conversationId = conversationId;
    req.appointmentId = appointment.id;
    req.canAccessChat = true;

    next();
  } catch (error) {
    console.error('Chat permission validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate chat permissions',
      code: 'PERMISSION_CHECK_FAILED'
    });
  }
};

/**
 * Lightweight permission check for WebSocket connections
 * Returns boolean instead of throwing errors
 */
export const canAccessConversation = async (
  userId: string,
  conversationId: string
): Promise<{ allowed: boolean; reason?: string; code?: string }> => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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
      return { allowed: false, reason: 'Conversation not found', code: 'CONVERSATION_NOT_FOUND' };
    }

    if (!conversation.appointment) {
      return { allowed: false, reason: 'No appointment', code: 'NO_APPOINTMENT' };
    }

    const appointment = conversation.appointment;
    const isParticipant = appointment.patientId === userId || appointment.doctorId === userId;

    if (!isParticipant) {
      return { allowed: false, reason: 'Not a participant', code: 'NOT_PARTICIPANT' };
    }

    if (appointment.doctor.doctorVerificationStatus !== DoctorVerificationStatus.APPROVED) {
      return { allowed: false, reason: 'Doctor not verified', code: 'DOCTOR_NOT_VERIFIED' };
    }

    if (appointment.status !== AppointmentStatus.APPROVED) {
      return { allowed: false, reason: 'Appointment not approved', code: 'APPOINTMENT_NOT_APPROVED' };
    }

    // Check expiry (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const now = new Date();
      const appointmentEnd = new Date(appointment.endTime);
      const gracePeriodDays = parseInt(process.env.CHAT_GRACE_PERIOD_DAYS || '7');
      const chatExpiryTime = new Date(appointmentEnd.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
      
      if (now > chatExpiryTime) {
        return { allowed: false, reason: 'Appointment expired', code: 'APPOINTMENT_EXPIRED' };
      }
    }

    // Check blocking
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: appointment.patientId, blockedId: appointment.doctorId },
          { blockerId: appointment.doctorId, blockedId: appointment.patientId }
        ]
      }
    });

    if (isBlocked) {
      return { allowed: false, reason: 'User blocked', code: 'USER_BLOCKED' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Permission check error:', error);
    return { allowed: false, reason: 'Permission check failed', code: 'CHECK_FAILED' };
  }
};

/**
 * Rate limiting for messages
 * Max 30 messages per minute per user per conversation
 */
export const checkMessageRateLimit = async (
  userId: string,
  conversationId: string
): Promise<{ allowed: boolean; remaining?: number; resetAt?: Date }> => {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - 1); // 1 minute window

    // Count messages in the last minute
    const messageCount = await prisma.message.count({
      where: {
        senderId: userId,
        conversationId,
        createdAt: {
          gte: windowStart
        }
      }
    });

    const limit = 30;
    const remaining = Math.max(0, limit - messageCount);
    const resetAt = new Date(windowStart.getTime() + 60000); // Reset in 1 minute

    if (messageCount >= limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return { allowed: true, remaining, resetAt };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow message if rate limit check fails
    return { allowed: true };
  }
};
