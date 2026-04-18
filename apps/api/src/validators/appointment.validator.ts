import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters')
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const setAvailabilitySchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format')
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime']
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  doctorId: z.string().min(1, 'Doctor ID is required')
});

export const cancelAppointmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters')
});

export const rescheduleAppointmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newStartTime: z.string().datetime('Invalid start time format'),
  newEndTime: z.string().datetime('Invalid end time format'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters')
}).refine(data => new Date(data.newEndTime) > new Date(data.newStartTime), {
  message: 'End time must be after start time',
  path: ['newEndTime']
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
