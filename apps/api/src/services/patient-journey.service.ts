/**
 * Patient Journey Service
 * Manages the complete patient journey from discovery to follow-up
 */

import { prisma } from '@medthread/database';
import { emailService } from './email.service';

export class PatientJourneyService {
  /**
   * Track patient discovery (profile view)
   */
  async trackDiscovery(data: {
    patientId: string;
    doctorId: string;
    source: string;
    keyword?: string;
  }) {
    const { patientId, doctorId, source, keyword } = data;

    // Check if journey already exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PatientJourney"
      WHERE patient_id = ${patientId}
        AND doctor_id = ${doctorId}
        AND is_completed = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing journey
      await prisma.$executeRaw`
        UPDATE "PatientJourney"
        SET profile_view_count = profile_view_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
      return existing[0];
    }

    // Create new journey
    const journey = await prisma.$queryRaw<any[]>`
      INSERT INTO "PatientJourney" (
        patient_id, doctor_id, current_stage, discovery_source,
        discovery_keyword, profile_viewed_at, profile_view_count
      ) VALUES (
        ${patientId}, ${doctorId}, 'discovery', ${source},
        ${keyword || null}, CURRENT_TIMESTAMP, 1
      )
      RETURNING *
    `;

    return journey[0];
  }

  /**
   * Track booking initiation
   */
  async trackBookingInitiation(patientId: string, doctorId: string, appointmentId: string) {
    await prisma.$executeRaw`
      UPDATE "PatientJourney"
      SET booking_initiated_at = CURRENT_TIMESTAMP,
          appointment_id = ${appointmentId},
          updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = ${patientId}
        AND doctor_id = ${doctorId}
        AND is_completed = false
    `;

    // Link journey to appointment
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET journey_id = (
        SELECT id FROM "PatientJourney"
        WHERE patient_id = ${patientId}
          AND doctor_id = ${doctorId}
          AND appointment_id = ${appointmentId}
        LIMIT 1
      )
      WHERE id = ${appointmentId}
    `;
  }

  /**
   * Create pre-consultation questionnaire
   */
  async createQuestionnaire(data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint: string;
    symptoms?: string[];
    symptomDuration?: string;
    symptomSeverity?: string;
    currentMedications?: string[];
    allergies?: string[];
    customQuestions?: any;
  }) {
    const questionnaire = await prisma.$queryRaw<any[]>`
      INSERT INTO "PreConsultationQuestionnaire" (
        appointment_id, patient_id, doctor_id, chief_complaint,
        symptoms, symptom_duration, symptom_severity,
        current_medications, allergies, custom_questions
      ) VALUES (
        ${data.appointmentId}, ${data.patientId}, ${data.doctorId},
        ${data.chiefComplaint},
        ${data.symptoms ? `{${data.symptoms.join(',')}}` : null}::TEXT[],
        ${data.symptomDuration || null}, ${data.symptomSeverity || null},
        ${data.currentMedications ? `{${data.currentMedications.join(',')}}` : null}::TEXT[],
        ${data.allergies ? `{${data.allergies.join(',')}}` : null}::TEXT[],
        ${data.customQuestions ? JSON.stringify(data.customQuestions) : null}::jsonb
      )
      RETURNING *
    `;

    return questionnaire[0];
  }

  /**
   * Complete questionnaire
   */
  async completeQuestionnaire(appointmentId: string, answers: any) {
    await prisma.$executeRaw`
      UPDATE "PreConsultationQuestionnaire"
      SET custom_answers = ${JSON.stringify(answers)}::jsonb,
          is_completed = true,
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${appointmentId}
    `;

    // Update appointment
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET questionnaire_completed = true
      WHERE id = ${appointmentId}
    `;

    // Update journey
    await prisma.$executeRaw`
      UPDATE "PatientJourney"
      SET questionnaire_completed_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${appointmentId}
    `;
  }

  /**
   * Schedule appointment reminders
   */
  async scheduleReminders(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return;

    const scheduledAt = new Date(appointment.scheduledAt);
    const now = new Date();

    // 24 hours before
    const reminder24h = new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      await prisma.$executeRaw`
        INSERT INTO "AppointmentReminder" (
          appointment_id, patient_id, doctor_id, reminder_type,
          reminder_channel, scheduled_for, subject, message
        ) VALUES (
          ${appointmentId}, ${appointment.patientId}, ${appointment.doctorId},
          '24h_before', 'email', ${reminder24h},
          'Appointment Reminder - Tomorrow',
          'Your appointment is scheduled for tomorrow.'
        )
      `;
    }

    // 1 hour before
    const reminder1h = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
    if (reminder1h > now) {
      await prisma.$executeRaw`
        INSERT INTO "AppointmentReminder" (
          appointment_id, patient_id, doctor_id, reminder_type,
          reminder_channel, scheduled_for, subject, message
        ) VALUES (
          ${appointmentId}, ${appointment.patientId}, ${appointment.doctorId},
          '1h_before', 'email', ${reminder1h},
          'Appointment Reminder - In 1 Hour',
          'Your appointment is in 1 hour.'
        )
      `;
    }

    // Update reminder count
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET reminder_count = 2
      WHERE id = ${appointmentId}
    `;
  }

  /**
   * Send pending reminders
   */
  async sendPendingReminders() {
    const reminders = await prisma.$queryRaw<any[]>`
      SELECT ar.*, u.email as patient_email, u.username as patient_name
      FROM "AppointmentReminder" ar
      INNER JOIN "User" u ON ar.patient_id = u.id
      WHERE ar.status = 'pending'
        AND ar.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY ar.scheduled_for ASC
      LIMIT 100
    `;

    for (const reminder of reminders) {
      try {
        await emailService.sendNotificationEmail({
          username: reminder.patient_email.split('@')[0],
          email: reminder.patient_email,
          title: reminder.subject,
          content: reminder.message
        });

        await prisma.$executeRaw`
          UPDATE "AppointmentReminder"
          SET status = 'sent',
              sent_at = CURRENT_TIMESTAMP
          WHERE id = ${reminder.id}
        `;
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await prisma.$executeRaw`
          UPDATE "AppointmentReminder"
          SET status = 'failed',
              error_message = ${errorMessage}
          WHERE id = ${reminder.id}
        `;
      }
    }

    return reminders.length;
  }

  /**
   * Issue prescription
   */
  async issuePrescription(data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    diagnosis: string;
    medications: any[];
    generalInstructions?: string;
    followUpInstructions?: string;
    validUntil?: Date;
  }) {
    const prescriptionNumber = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const prescription = await prisma.$queryRaw<any[]>`
      INSERT INTO "Prescription" (
        appointment_id, patient_id, doctor_id, prescription_number,
        diagnosis, medications, general_instructions, follow_up_instructions,
        valid_until, status
      ) VALUES (
        ${data.appointmentId}, ${data.patientId}, ${data.doctorId},
        ${prescriptionNumber}, ${data.diagnosis},
        ${JSON.stringify(data.medications)}::jsonb,
        ${data.generalInstructions || null}, ${data.followUpInstructions || null},
        ${data.validUntil || null}, 'active'
      )
      RETURNING *
    `;

    // Update appointment
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET prescription_issued = true
      WHERE id = ${data.appointmentId}
    `;

    // Update journey
    await prisma.$executeRaw`
      UPDATE "PatientJourney"
      SET prescription_issued_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${data.appointmentId}
    `;

    return prescription[0];
  }

  /**
   * Request post-consultation review
   */
  async requestReview(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) return;

    // Schedule review request for 24 hours after consultation
    const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const request = await prisma.$executeRaw`
      INSERT INTO "ReviewRequest" (
        appointment_id, patient_id, doctor_id, request_type,
        scheduled_for, status
      ) VALUES (
        ${appointmentId}, ${appointment.patientId}, ${appointment.doctorId},
        'post_consultation', ${scheduledFor}, 'pending'
      )
      RETURNING *
    `;

    // Update appointment
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET review_requested = true
      WHERE id = ${appointmentId}
    `;

    // Update journey
    await prisma.$executeRaw`
      UPDATE "PatientJourney"
      SET review_requested_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${appointmentId}
    `;

    return request;
  }

  /**
   * Send pending review requests
   */
  async sendPendingReviewRequests() {
    const requests = await prisma.$queryRaw<any[]>`
      SELECT rr.*, u.email as patient_email, u.username as patient_name,
             d.username as doctor_name
      FROM "ReviewRequest" rr
      INNER JOIN "User" u ON rr.patient_id = u.id
      INNER JOIN "User" d ON rr.doctor_id = d.id
      WHERE rr.status = 'pending'
        AND rr.scheduled_for <= CURRENT_TIMESTAMP
      ORDER BY rr.scheduled_for ASC
      LIMIT 100
    `;

    for (const request of requests) {
      try {
        await emailService.sendNotificationEmail({
          username: request.patient_name,
          email: request.patient_email,
          title: `How was your consultation with Dr. ${request.doctor_name}?`,
          content: `We hope your consultation went well! We'd love to hear about your experience.`,
          actionUrl: `${process.env.FRONTEND_URL}/review/${request.appointment_id}`,
          actionText: 'Leave a Review'
        });

        await prisma.$executeRaw`
          UPDATE "ReviewRequest"
          SET status = 'sent',
              sent_at = CURRENT_TIMESTAMP
          WHERE id = ${request.id}
        `;
      } catch (error) {
        console.error(`Failed to send review request ${request.id}:`, error);
      }
    }

    return requests.length;
  }

  /**
   * Schedule follow-up appointment
   */
  async scheduleFollowUp(data: {
    originalAppointmentId: string;
    patientId: string;
    doctorId: string;
    recommendedDate?: Date;
    recommendedReason?: string;
    recommendedByDoctor?: boolean;
  }) {
    const followUp = await prisma.$queryRaw<any[]>`
      INSERT INTO "FollowUpAppointment" (
        original_appointment_id, patient_id, doctor_id,
        recommended_by_doctor, recommended_date, recommended_reason, status
      ) VALUES (
        ${data.originalAppointmentId}, ${data.patientId}, ${data.doctorId},
        ${data.recommendedByDoctor || false}, ${data.recommendedDate || null},
        ${data.recommendedReason || null}, 'recommended'
      )
      RETURNING *
    `;

    // Update appointment
    await prisma.$executeRaw`
      UPDATE "Appointment"
      SET follow_up_recommended = true
      WHERE id = ${data.originalAppointmentId}
    `;

    // Update journey
    await prisma.$executeRaw`
      UPDATE "PatientJourney"
      SET follow_up_scheduled_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${data.originalAppointmentId}
    `;

    return followUp[0];
  }

  /**
   * Get patient journey details
   */
  async getJourneyDetails(journeyId: number) {
    const journey = await prisma.$queryRaw<any[]>`
      SELECT 
        pj.*,
        p.username as patient_name,
        p.email as patient_email,
        d.username as doctor_name,
        a.status as appointment_status,
        a."scheduledAt" as appointment_time
      FROM "PatientJourney" pj
      INNER JOIN "User" p ON pj.patient_id = p.id
      INNER JOIN "User" d ON pj.doctor_id = d.id
      LEFT JOIN "Appointment" a ON pj.appointment_id = a.id
      WHERE pj.id = ${journeyId}
    `;

    if (journey.length === 0) return null;

    // Get questionnaire
    const questionnaire = await prisma.$queryRaw<any[]>`
      SELECT * FROM "PreConsultationQuestionnaire"
      WHERE appointment_id = ${journey[0].appointment_id}
    `;

    // Get prescription
    const prescription = await prisma.$queryRaw<any[]>`
      SELECT * FROM "Prescription"
      WHERE appointment_id = ${journey[0].appointment_id}
    `;

    // Get follow-up
    const followUp = await prisma.$queryRaw<any[]>`
      SELECT * FROM "FollowUpAppointment"
      WHERE original_appointment_id = ${journey[0].appointment_id}
    `;

    return {
      journey: journey[0],
      questionnaire: questionnaire[0] || null,
      prescription: prescription[0] || null,
      followUp: followUp[0] || null
    };
  }

  /**
   * Track CTA performance
   */
  async trackCTAImpression(ctaId: number) {
    await prisma.$executeRaw`
      UPDATE "BookingCTA"
      SET impressions = impressions + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ctaId}
    `;
  }

  async trackCTAClick(ctaId: number) {
    await prisma.$executeRaw`
      UPDATE "BookingCTA"
      SET clicks = clicks + 1,
          ctr = CASE 
            WHEN impressions > 0 THEN (clicks + 1)::DECIMAL / impressions * 100
            ELSE 0
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ctaId}
    `;
  }

  async trackCTABooking(ctaId: number) {
    await prisma.$executeRaw`
      UPDATE "BookingCTA"
      SET bookings = bookings + 1,
          conversion_rate = CASE 
            WHEN clicks > 0 THEN (bookings + 1)::DECIMAL / clicks * 100
            ELSE 0
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ctaId}
    `;
  }

  /**
   * Get doctor's booking CTAs
   */
  async getDoctorCTAs(doctorId: string) {
    const ctas = await prisma.$queryRaw<any[]>`
      SELECT * FROM "BookingCTA"
      WHERE doctor_id = ${doctorId}
        AND is_active = true
      ORDER BY display_priority DESC
    `;

    return ctas;
  }
}

export const patientJourneyService = new PatientJourneyService();
