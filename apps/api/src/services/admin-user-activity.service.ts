import { prisma } from '@medthread/database';

export class AdminUserActivityService {
  /**
   * Feature 3: Get user activity time graphs for admin dashboard
   * Shows when during day/week user is most active
   */
  async getUserActivityTimeGraphs(userId: string, timeframe: 'hourly' | 'weekly' = 'hourly') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all user activities in last 30 days
    const [posts, comments, messages, votes] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.comment.findMany({
        where: { authorId: userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.message.findMany({
        where: { senderId: userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.vote.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      })
    ]);

    // Combine all activities with type labels
    const allActivities = [
      ...posts.map(p => ({ type: 'post', createdAt: p.createdAt })),
      ...comments.map(c => ({ type: 'comment', createdAt: c.createdAt })),
      ...messages.map(m => ({ type: 'message', createdAt: m.createdAt })),
      ...votes.map(v => ({ type: 'vote', createdAt: v.createdAt }))
    ];

    if (timeframe === 'hourly') {
      return this.generateHourlyActivityGraph(user, allActivities);
    } else {
      return this.generateWeeklyActivityGraph(user, allActivities);
    }
  }
  /**
   * Generate hourly activity pattern (0-23 hours)
   */
  private generateHourlyActivityGraph(user: any, activities: any[]) {
    // Initialize 24-hour array
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      totalActivity: 0,
      posts: 0,
      comments: 0,
      messages: 0,
      votes: 0
    }));

    // Group activities by hour
    activities.forEach(activity => {
      const hour = activity.createdAt.getHours();
      hourlyData[hour].totalActivity++;
      hourlyData[hour][activity.type + 's']++;
    });

    // Find peak activity hour
    const peakHour = hourlyData.reduce((max, current) => 
      current.totalActivity > max.totalActivity ? current : max
    );

    // Calculate activity distribution
    const totalActivities = activities.length;
    const activityByType = {
      posts: activities.filter(a => a.type === 'post').length,
      comments: activities.filter(a => a.type === 'comment').length,
      messages: activities.filter(a => a.type === 'message').length,
      votes: activities.filter(a => a.type === 'vote').length
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        memberSince: user.createdAt
      },
      timeframe: 'hourly',
      period: 'Last 30 days',
      hourlyPattern: hourlyData,
      peakActivity: {
        hour: peakHour.hour,
        hourLabel: peakHour.hourLabel,
        activityCount: peakHour.totalActivity
      },
      summary: {
        totalActivities,
        averagePerDay: (totalActivities / 30).toFixed(1),
        activityByType,
        mostActiveHours: hourlyData
          .filter(h => h.totalActivity > 0)
          .sort((a, b) => b.totalActivity - a.totalActivity)
          .slice(0, 3)
          .map(h => ({ hour: h.hour, label: h.hourLabel, count: h.totalActivity }))
      }
    };
  }

  /**
   * Generate weekly activity pattern (0-6 days, Sunday=0)
   */
  private generateWeeklyActivityGraph(user: any, activities: any[]) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize 7-day array
    const weeklyData = Array.from({ length: 7 }, (_, day) => ({
      day,
      dayName: dayNames[day],
      dayShort: dayNames[day].substring(0, 3),
      totalActivity: 0,
      posts: 0,
      comments: 0,
      messages: 0,
      votes: 0
    }));

    // Group activities by day of week
    activities.forEach(activity => {
      const day = activity.createdAt.getDay(); // 0 = Sunday
      weeklyData[day].totalActivity++;
      weeklyData[day][activity.type + 's']++;
    });

    // Find peak activity day
    const peakDay = weeklyData.reduce((max, current) => 
      current.totalActivity > max.totalActivity ? current : max
    );

    const totalActivities = activities.length;
    const activityByType = {
      posts: activities.filter(a => a.type === 'post').length,
      comments: activities.filter(a => a.type === 'comment').length,
      messages: activities.filter(a => a.type === 'message').length,
      votes: activities.filter(a => a.type === 'vote').length
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        memberSince: user.createdAt
      },
      timeframe: 'weekly',
      period: 'Last 30 days',
      weeklyPattern: weeklyData,
      peakActivity: {
        day: peakDay.day,
        dayName: peakDay.dayName,
        activityCount: peakDay.totalActivity
      },
      summary: {
        totalActivities,
        averagePerWeek: (totalActivities / 4.3).toFixed(1), // ~4.3 weeks in 30 days
        activityByType,
        mostActiveDays: weeklyData
          .filter(d => d.totalActivity > 0)
          .sort((a, b) => b.totalActivity - a.totalActivity)
          .slice(0, 3)
          .map(d => ({ day: d.day, name: d.dayName, count: d.totalActivity }))
      }
    };
  }

  /**
   * Get activity comparison between multiple users
   */
  async compareUserActivities(userIds: string[], timeframe: 'hourly' | 'weekly' = 'hourly') {
    const comparisons = [];
    
    for (const userId of userIds) {
      try {
        const activity = await this.getUserActivityTimeGraphs(userId, timeframe);
        comparisons.push(activity);
      } catch (error) {
        console.error(`Failed to get activity for user ${userId}:`, error);
      }
    }

    return {
      timeframe,
      userCount: comparisons.length,
      comparisons,
      aggregated: this.aggregateUserActivities(comparisons, timeframe)
    };
  }

  /**
   * Aggregate multiple user activities for comparison
   */
  private aggregateUserActivities(activities: any[], timeframe: 'hourly' | 'weekly') {
    if (activities.length === 0) return null;

    const patternKey = timeframe === 'hourly' ? 'hourlyPattern' : 'weeklyPattern';
    const timeSlots = timeframe === 'hourly' ? 24 : 7;

    // Initialize aggregated data
    const aggregated = Array.from({ length: timeSlots }, (_, index) => ({
      [timeframe === 'hourly' ? 'hour' : 'day']: index,
      totalActivity: 0,
      userCount: 0,
      averageActivity: 0
    }));

    // Sum activities across all users
    activities.forEach(userActivity => {
      const pattern = userActivity[patternKey];
      pattern.forEach((slot: any, index: number) => {
        if (slot.totalActivity > 0) {
          aggregated[index].totalActivity += slot.totalActivity;
          aggregated[index].userCount++;
        }
      });
    });

    // Calculate averages
    aggregated.forEach(slot => {
      slot.averageActivity = slot.userCount > 0 ? 
        (slot.totalActivity / slot.userCount) : 0;
    });

    return {
      timeSlots: aggregated,
      totalUsers: activities.length,
      totalActivities: activities.reduce((sum, a) => sum + a.summary.totalActivities, 0)
    };
  }
}

export const adminUserActivityService = new AdminUserActivityService();