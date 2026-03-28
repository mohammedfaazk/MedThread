import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Middleware: All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// 1. ACTIVE USERS (Real-time / Daily)
// ============================================
router.get('/active-users', async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    }

    const activeDoctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        updatedAt: { gte: startDate }
      }
    });

    const activePatients = await prisma.user.count({
      where: {
        role: 'PATIENT',
        updatedAt: { gte: startDate }
      }
    });

    res.json({
      success: true,
      data: {
        doctors: activeDoctors,
        patients: activePatients,
        total: activeDoctors + activePatients,
        period
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 2. OFFLINE USERS
// ============================================
router.get('/offline-users', async (req, res) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const offlineDoctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        updatedAt: { lt: fifteenMinutesAgo }
      }
    });

    const offlinePatients = await prisma.user.count({
      where: {
        role: 'PATIENT',
        updatedAt: { lt: fifteenMinutesAgo }
      }
    });

    res.json({
      success: true,
      data: {
        doctors: offlineDoctors,
        patients: offlinePatients,
        total: offlineDoctors + offlinePatients
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ============================================
// 3. USER ACTIVITY BY TIME OF DAY
// ============================================
router.get('/user-activity-time', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get all user analytics with recent activity
    const userAnalytics = await prisma.userAnalytics.findMany({
      where: {
        lastActive: { gte: startDate }
      },
      include: {
        User: {
          select: {
            role: true
          }
        }
      }
    });

    // Group by hour of day
    const hourlyData: { [key: number]: { doctors: number; patients: number } } = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { doctors: 0, patients: 0 };
    }

    // Count users by hour
    userAnalytics.forEach(analytics => {
      if (analytics.lastActive) {
        const hour = new Date(analytics.lastActive).getHours();
        if (analytics.User.role === 'DOCTOR') {
          hourlyData[hour].doctors++;
        } else if (analytics.User.role === 'PATIENT') {
          hourlyData[hour].patients++;
        }
      }
    });

    // Format for chart
    const data = Object.keys(hourlyData).map(hour => ({
      hour: `${hour}:00`,
      doctors: hourlyData[Number(hour)].doctors,
      patients: hourlyData[Number(hour)].patients,
      total: hourlyData[Number(hour)].doctors + hourlyData[Number(hour)].patients
    }));

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user activity time:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ============================================
// 4. FEATURE USAGE BY PATIENTS
// ============================================
router.get('/feature-usage', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Count feature usage from activity logs
    const featureUsage = await prisma.userActivityLog.groupBy({
      by: ['activityType'],
      where: {
        createdAt: { gte: startDate },
        user: { role: 'PATIENT' }
      },
      _count: { id: true }
    });

    // Map activity types to features
    const featureMap: Record<string, string> = {
      'POST': 'Feed',
      'COMMENT': 'Community Posts',
      'MESSAGE': 'Chat',
      'PROFILE_VIEW': 'Hospital Finder',
      'LOGIN': 'Notifications'
    };

    const chartData = featureUsage.map(f => ({
      name: featureMap[f.activityType] || f.activityType,
      value: f._count.id,
      percentage: 0
    }));

    // Calculate percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    });

    res.json({
      success: true,
      data: chartData.sort((a, b) => b.value - a.value)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 5. PATIENT TREATMENT OUTCOMES
// ============================================
router.get('/treatment-outcomes', async (req, res) => {
  try {
    const outcomes = await prisma.patientFeedback.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const chartData = outcomes.map(o => ({
      name: o.status === 'CURED' ? 'Cured' : 
            o.status === 'NOT_YET' ? 'Ongoing Treatment' : 
            'Switched Doctor',
      value: o._count.id,
      percentage: 0
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
    });

    res.json({
      success: true,
      data: chartData,
      total
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 6. DOCTOR ACTIVITY BY FORUM/COMMUNITY
// ============================================
router.get('/doctor-activity-by-community', async (req, res) => {
  try {
    // Get all communities
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        displayName: true
      }
    });

    // Get post counts per community (doctors only)
    const postCounts = await prisma.post.groupBy({
      by: ['communityId'],
      where: {
        author: { role: 'DOCTOR' }
      },
      _count: { id: true }
    });

    // Get comment counts per community (doctors only)
    const commentCounts = await prisma.comment.groupBy({
      by: ['postId'],
      where: {
        author: { role: 'DOCTOR' }
      },
      _count: { id: true }
    });

    // Map comment counts by community
    const commentsByPost = await prisma.post.findMany({
      where: {
        id: { in: commentCounts.map(c => c.postId) }
      },
      select: {
        id: true,
        communityId: true
      }
    });

    const commentsByCommunity: Record<string, number> = {};
    commentCounts.forEach(cc => {
      const post = commentsByPost.find(p => p.id === cc.postId);
      if (post && post.communityId) {
        commentsByCommunity[post.communityId] = (commentsByCommunity[post.communityId] || 0) + cc._count.id;
      }
    });

    // Build chart data
    const chartData = communities.map(community => {
      const posts = postCounts.find(pc => pc.communityId === community.id)?._count.id || 0;
      const comments = commentsByCommunity[community.id] || 0;
      
      return {
        name: community.displayName,
        posts,
        comments,
        total: posts + comments
      };
    });

    // Sort by total activity and take top 10
    chartData.sort((a, b) => b.total - a.total);
    const topCommunities = chartData.slice(0, 10);

    res.json({
      success: true,
      data: topCommunities
    });
  } catch (error: any) {
    console.error('Error in doctor-activity-by-community:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 7. DEAD FORUMS (Low Engagement)
// ============================================
router.get('/dead-forums', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const communities = await prisma.community.findMany({
      include: {
        activity: true,
        _count: {
          select: {
            posts: {
              where: { createdAt: { gte: thirtyDaysAgo } }
            },
            members: true
          }
        }
      }
    });

    const chartData = communities.map(community => {
      const recentPosts = community._count.posts;
      const members = community._count.members;
      
      // Calculate engagement score (0-100)
      const postScore = Math.min((recentPosts / 30) * 50, 50); // Max 50 points
      const memberScore = Math.min((members / 100) * 50, 50); // Max 50 points
      const engagementScore = Math.round(postScore + memberScore);

      return {
        name: community.displayName,
        engagementScore,
        recentPosts,
        members,
        status: engagementScore < 30 ? 'critical' : engagementScore < 50 ? 'warning' : 'healthy'
      };
    });

    // Sort by engagement score (lowest first)
    chartData.sort((a, b) => a.engagementScore - b.engagementScore);

    res.json({
      success: true,
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 8. NEW USER REGISTRATIONS OVER TIME
// ============================================
router.get('/user-registrations', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    // Get registrations by month
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        role: true,
        createdAt: true
      }
    });

    // Group by month
    const monthlyData: Record<string, { doctors: number; patients: number }> = {};

    users.forEach(user => {
      const monthKey = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { doctors: 0, patients: 0 };
      }

      if (user.role === 'DOCTOR') {
        monthlyData[monthKey].doctors++;
      } else if (user.role === 'PATIENT') {
        monthlyData[monthKey].patients++;
      }
    });

    // Format for chart
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        doctors: counts.doctors,
        patients: counts.patients,
        total: counts.doctors + counts.patients
      }));

    // Calculate growth rates
    chartData.forEach((item, index) => {
      if (index > 0) {
        const prev = chartData[index - 1];
        const growth = prev.total > 0 
          ? Math.round(((item.total - prev.total) / prev.total) * 100)
          : 0;
        (item as any).growthRate = growth;
      }
    });

    res.json({
      success: true,
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ============================================
// 9. POST PRIORITY DISTRIBUTION
// ============================================
router.get('/post-priorities', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const priorities = await prisma.postPriority.groupBy({
      by: ['priorityLevel'],
      where: {
        calculatedAt: { gte: startDate }
      },
      _count: { id: true }
    });

    const chartData = priorities.map(p => ({
      name: p.priorityLevel,
      value: p._count.id,
      color: p.priorityLevel === 'HIGH' ? '#DC2626' : 
             p.priorityLevel === 'MEDIUM' ? '#D97706' : '#16A34A'
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 10. APPOINTMENT CONVERSION RATE
// ============================================
router.get('/appointment-conversion', async (req, res) => {
  try {
    const { specialty } = req.query;

    const whereClause: any = {
      doctor: { role: 'DOCTOR' }
    };

    if (specialty) {
      whereClause.doctor.specialty = specialty;
    }

    // Get doctors with their stats
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        ...(specialty && { specialty: specialty as string })
      },
      select: {
        id: true,
        username: true,
        specialty: true,
        _count: {
          select: {
            comments: true,
            appointmentsAsDoctor: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    });

    const chartData = doctors.map(doctor => {
      const comments = doctor._count.comments;
      const appointments = doctor._count.appointmentsAsDoctor;
      const conversionRate = comments > 0 ? Math.round((appointments / comments) * 100) : 0;

      return {
        name: doctor.username,
        specialty: doctor.specialty,
        comments,
        appointments,
        conversionRate
      };
    }).filter(d => d.comments > 0); // Only show doctors with activity

    // Sort by conversion rate
    chartData.sort((a, b) => b.conversionRate - a.conversionRate);

    res.json({
      success: true,
      data: chartData.slice(0, 15) // Top 15
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 11. REPORT & MODERATION ACTIVITY
// ============================================
router.get('/moderation-activity', async (req, res) => {
  try {
    const { weeks = 12 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (Number(weeks) * 7));

    // Get reports by week
    const reports = await prisma.report.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        status: true,
        createdAt: true
      }
    });

    // Group by week
    const weeklyData: Record<string, { filed: number; resolved: number; dismissed: number }> = {};

    reports.forEach(report => {
      const weekStart = new Date(report.createdAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { filed: 0, resolved: 0, dismissed: 0 };
      }

      weeklyData[weekKey].filed++;
      if (report.status === 'RESOLVED') weeklyData[weekKey].resolved++;
      if (report.status === 'DISMISSED') weeklyData[weekKey].dismissed++;
    });

    const chartData = Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, counts]) => ({
        week,
        filed: counts.filed,
        resolved: counts.resolved,
        dismissed: counts.dismissed
      }));

    // Calculate average resolution time
    const resolvedReports = await prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true
      }
    });

    const avgResolutionTime = resolvedReports.length > 0
      ? Math.round(
          resolvedReports.reduce((sum, r) => 
            sum + (new Date().getTime() - r.createdAt.getTime()), 0
          ) / resolvedReports.length / (1000 * 60 * 60) // Convert to hours
        )
      : 0;

    res.json({
      success: true,
      data: chartData,
      avgResolutionTimeHours: avgResolutionTime
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 12. REVENUE OVERVIEW
// ============================================
router.get('/revenue', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    // Get consultation fees by month and specialty
    const fees = await prisma.consultationFee.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'COMPLETED'
      },
      include: {
        User_ConsultationFee_doctorIdToUser: {
          select: { specialty: true }
        }
      }
    });

    // Group by month
    const monthlyRevenue: Record<string, Record<string, number>> = {};

    fees.forEach(fee => {
      const monthKey = `${fee.createdAt.getFullYear()}-${String(fee.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const specialty = fee.User_ConsultationFee_doctorIdToUser.specialty || 'Other';

      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = {};
      }

      if (!monthlyRevenue[monthKey][specialty]) {
        monthlyRevenue[monthKey][specialty] = 0;
      }

      monthlyRevenue[monthKey][specialty] += Number(fee.amount);
    });

    // Get all unique specialties
    const specialties = Array.from(new Set(fees.map(f => f.User_ConsultationFee_doctorIdToUser.specialty || 'Other')));

    // Format for chart
    const chartData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, specialtyRevenue]) => {
        const row: any = { month };
        specialties.forEach(specialty => {
          row[specialty] = specialtyRevenue[specialty] || 0;
        });
        row.total = Object.values(specialtyRevenue).reduce((sum: number, val) => sum + (val as number), 0);
        return row;
      });

    res.json({
      success: true,
      data: chartData,
      specialties
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
