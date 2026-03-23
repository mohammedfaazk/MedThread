import { prisma } from '@medthread/database';

export class HealthTimelineService {
  async getTimeline(userId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: string[];
  }) {
    const where: any = { userId };
    
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }
    
    if (filters?.eventTypes && filters.eventTypes.length > 0) {
      where.eventType = { in: filters.eventTypes };
    }

    const events = await prisma.healthTimelineEvent.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                profilePicture: true
              }
            }
          }
        },
        medication: true,
        symptomEntry: true
      }
    });

    return this.groupEventsByDate(events);
  }

  private groupEventsByDate(events: any[]) {
    const grouped: Record<string, any[]> = {};
    
    events.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return Object.entries(grouped).map(([date, events]) => ({
      date,
      events: events.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }));
  }

  async addEvent(userId: string, data: {
    eventType: string;
    title: string;
    description?: string;
    date: Date;
    metadata?: any;
    appointmentId?: string;
    medicationId?: string;
    symptomEntryId?: string;
  }) {
    return prisma.healthTimelineEvent.create({
      data: {
        userId,
        ...data
      }
    });
  }

  async updateEvent(eventId: string, userId: string, data: {
    title?: string;
    description?: string;
    date?: Date;
    metadata?: any;
  }) {
    return prisma.healthTimelineEvent.updateMany({
      where: { id: eventId, userId },
      data
    });
  }

  async deleteEvent(eventId: string, userId: string) {
    return prisma.healthTimelineEvent.deleteMany({
      where: { id: eventId, userId }
    });
  }

  async getStats(userId: string, startDate: Date, endDate: Date) {
    const events = await prisma.healthTimelineEvent.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const stats = {
      total: events.length,
      byType: {} as Record<string, number>,
      byMonth: {} as Record<string, number>
    };

    events.forEach(event => {
      // Count by type
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;
      
      // Count by month
      const month = event.date.toISOString().substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
  }
}

export const healthTimelineService = new HealthTimelineService();
