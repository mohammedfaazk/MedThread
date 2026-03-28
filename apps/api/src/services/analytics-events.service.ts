import { EventEmitter } from 'events';

export interface AnalyticsEvent {
  type: 'user:registered' | 'user:active' | 'user:inactive' | 'post:created' | 'appointment:booked' | 'report:filed';
  data: any;
  timestamp: Date;
}

class AnalyticsEventsService extends EventEmitter {
  private static instance: AnalyticsEventsService;

  private constructor() {
    super();
    this.setMaxListeners(100); // Allow many SSE connections
  }

  static getInstance(): AnalyticsEventsService {
    if (!AnalyticsEventsService.instance) {
      AnalyticsEventsService.instance = new AnalyticsEventsService();
    }
    return AnalyticsEventsService.instance;
  }

  emitUserRegistered(data: { role: string; registeredAt: Date; city?: string; communityIds?: string[] }) {
    const event: AnalyticsEvent = {
      type: 'user:registered',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }

  emitUserActive(data: { userId: string; role: string }) {
    const event: AnalyticsEvent = {
      type: 'user:active',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }

  emitUserInactive(data: { userId: string; role: string }) {
    const event: AnalyticsEvent = {
      type: 'user:inactive',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }

  emitPostCreated(data: { postId: string; authorRole: string; communityId: string; priority: string }) {
    const event: AnalyticsEvent = {
      type: 'post:created',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }

  emitAppointmentBooked(data: { appointmentId: string; doctorId: string; patientId: string }) {
    const event: AnalyticsEvent = {
      type: 'appointment:booked',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }

  emitReportFiled(data: { reportId: string; reason: string }) {
    const event: AnalyticsEvent = {
      type: 'report:filed',
      data,
      timestamp: new Date()
    };
    this.emit('analytics', event);
  }
}

export const analyticsEvents = AnalyticsEventsService.getInstance();
