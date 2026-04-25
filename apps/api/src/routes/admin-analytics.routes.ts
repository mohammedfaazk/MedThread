import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Middleware: All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// ============================================
// 1. ACTIVE USERS (Currently Online - Based on Active Sessions + Recent Activity)
// ============================================
router.get('/active-users', async (req, res) => {
  try {
    const { period = 'online' } = req.query;
    
    let description = '';
    let activeDoctors = 0;
    let activePatients = 0;
    
    if (period === 'online') {
      // Currently online: users with active sessions OR recent activity (last 5 min)
      description = 'Currently online (active sessions + recent activity)';
      
      // Method 1: Count active sessions by role
      const activeSessions = await prisma.userSession.findMany({
        where: {
          endTime: null, // Active sessions only
          userId: { not: null }
        },
        include: {
          User: {
            select: {
              id: true,
              role: true
            }
          }
        }
      });

      // Get unique users from sessions
      const sessionUserIds = new Set<string>();
      activeSessions.forEach(session => {
        if (session.userId && session.User) {
          sessionUserIds.add(session.userId);
          if (session.User.role === 'DOCTOR') activeDoctors++;
          else if (session.User.role === 'PATIENT') activePatients++;
        }
      });

      // Method 2: Also count users with recent activity (last 5 min) who don't have sessions
      // This handles users who logged in before session tracking was implemented
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const recentlyActiveUsers = await prisma.user.findMany({
        where: {
          updatedAt: { gte: fiveMinutesAgo },
          id: { notIn: Array.from(sessionUserIds) } // Exclude users already counted from sessions
        },
        select: {
          id: true,
          role: true
        }
      });

      // Add recently active users to the count
      recentlyActiveUsers.forEach(user => {
        if (user.role === 'DOCTOR') activeDoctors++;
        else if (user.role === 'PATIENT') activePatients++;
      });

      console.log(`👥 Active Sessions: ${activeSessions.length} sessions, ${sessionUserIds.size} unique users`);
      console.log(`👥 Recently Active (no session): ${recentlyActiveUsers.length} users`);
      
    } else {
      // For other periods, use updatedAt as before
      let startDate = new Date();
      
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
        description = 'Active today';
      } else if (period === '7days') {
        startDate.setDate(startDate.getDate() - 7);
        description = 'Active in last 7 days';
      } else if (period === '30days') {
        startDate.setDate(startDate.getDate() - 30);
        description = 'Active in last 30 days';
      }

      activeDoctors = await prisma.user.count({
        where: {
          role: 'DOCTOR',
          updatedAt: { gte: startDate }
        }
      });

      activePatients = await prisma.user.count({
        where: {
          role: 'PATIENT',
          updatedAt: { gte: startDate }
        }
      });
    }

    const total = activeDoctors + activePatients;

    console.log(`👥 Active Users (${period}): ${total} (${activeDoctors} doctors, ${activePatients} patients)`);

    res.json({
      success: true,
      data: {
        doctors: activeDoctors,
        patients: activePatients,
        total,
        period,
        description
      }
    });
  } catch (error: any) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 2. OFFLINE USERS
// ============================================
router.get('/offline-users', async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const offlineDoctors = await prisma.user.count({
      where: {
        role: 'DOCTOR',
        updatedAt: { lt: fiveMinutesAgo }
      }
    });

    const offlinePatients = await prisma.user.count({
      where: {
        role: 'PATIENT',
        updatedAt: { lt: fiveMinutesAgo }
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
// 3. USER ACTIVITY BY TIME OF DAY (REAL LOGIN DATA)
// ============================================
router.get('/user-activity-time', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get all LOGIN activity logs from the past X days
    const activityLogs = await prisma.userActivityLog.findMany({
      where: {
        activityType: 'LOGIN',
        createdAt: { gte: startDate }
      },
      include: {
        user: {
          select: {
            role: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${activityLogs.length} login activities in the last ${days} days`);

    // Group by hour of day
    const hourlyData: { [key: number]: { doctors: number; patients: number; logins: any[] } } = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { doctors: 0, patients: 0, logins: [] };
    }

    // Count logins by hour
    activityLogs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      
      if (log.user.role === 'DOCTOR') {
        hourlyData[hour].doctors++;
      } else if (log.user.role === 'PATIENT') {
        hourlyData[hour].patients++;
      }
      
      // Store login details for debugging
      hourlyData[hour].logins.push({
        username: log.user.username,
        role: log.user.role,
        time: log.createdAt
      });
    });

    // Format for chart
    const data = Object.keys(hourlyData).map(hour => {
      const hourNum = Number(hour);
      const hourData = hourlyData[hourNum];
      
      return {
        hour: `${hour.padStart(2, '0')}:00`,
        doctors: hourData.doctors,
        patients: hourData.patients,
        total: hourData.doctors + hourData.patients
      };
    });

    // Log summary for debugging
    const totalLogins = activityLogs.length;
    const doctorLogins = activityLogs.filter(l => l.user.role === 'DOCTOR').length;
    const patientLogins = activityLogs.filter(l => l.user.role === 'PATIENT').length;
    
    console.log(`📈 Activity Summary (last ${days} days):`);
    console.log(`   Total Logins: ${totalLogins}`);
    console.log(`   Doctor Logins: ${doctorLogins}`);
    console.log(`   Patient Logins: ${patientLogins}`);
    console.log(`   Peak Hour: ${data.reduce((max, curr) => curr.total > max.total ? curr : max, data[0]).hour}`);

    res.json({ 
      success: true, 
      data,
      summary: {
        totalLogins,
        doctorLogins,
        patientLogins,
        period: `${days} days`
      }
    });
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
    const weeksNum = Number(weeks);
    
    // Generate data for each week
    const chartData = [];
    
    for (let weekOffset = weeksNum - 1; weekOffset >= 0; weekOffset--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (weekOffset * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      // Get reports for this week
      const reports = await prisma.report.findMany({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        select: {
          status: true
        }
      });

      const filed = reports.length;
      const resolved = reports.filter(r => r.status === 'APPROVED').length;
      const dismissed = reports.filter(r => r.status === 'REJECTED').length;

      chartData.push({
        week: `Week ${weeksNum - weekOffset}`,
        filed,
        resolved,
        dismissed
      });
    }

    // Calculate average resolution time (estimate based on current time for resolved reports)
    const resolvedReports = await prisma.report.findMany({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: new Date(Date.now() - weeksNum * 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        createdAt: true
      }
    });

    // Estimate resolution time as average time from creation to now
    // In a real system, you'd track when the report was resolved
    const avgResolutionTime = resolvedReports.length > 0
      ? Math.round(
          resolvedReports.reduce((sum, r) => 
            sum + (Date.now() - r.createdAt.getTime()), 0
          ) / resolvedReports.length / (1000 * 60 * 60) // Convert to hours
        )
      : 0;

    res.json({
      success: true,
      data: chartData,
      avgResolutionTimeHours: avgResolutionTime
    });
  } catch (error: any) {
    console.error('Error in moderation-activity:', error);
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

// ============================================
// 13. DOCTOR LEADERBOARD (Top Performing Doctors)
// ============================================
router.get('/doctor-leaderboard', async (req, res) => {
  try {
    const { period = '30days', limit = 10 } = req.query;
    
    let startDate = new Date();
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90days') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === 'all') {
      startDate = new Date('2020-01-01');
    }

    // Get all doctors with their performance metrics
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      },
      select: {
        id: true,
        username: true,
        specialty: true,
        posts: {
          where: { createdAt: { gte: startDate } },
          select: { id: true }
        },
        comments: {
          where: { createdAt: { gte: startDate } },
          select: { id: true }
        },
        appointmentsAsDoctor: {
          where: { createdAt: { gte: startDate } },
          select: { 
            id: true,
            status: true
          }
        },
        patientFeedbacks: {
          select: {
            rating: true,
            status: true
          }
        }
      }
    });

    // Calculate performance metrics for each doctor
    const doctorPerformance = doctors.map((doctor, index) => {
      const totalPosts = doctor.posts.length;
      const totalComments = doctor.comments.length;
      const totalAppointments = doctor.appointmentsAsDoctor.length;
      const completedAppointments = doctor.appointmentsAsDoctor.filter(a => a.status === 'COMPLETED').length;
      
      // Calculate treatment success rate
      const treatmentOutcomes = doctor.patientFeedbacks.map(f => f.status).filter(Boolean);
      const successfulTreatments = treatmentOutcomes.filter(o => o === 'CURED' || o === 'IMPROVED').length;
      const treatmentSuccessRate = treatmentOutcomes.length > 0 
        ? Math.round((successfulTreatments / treatmentOutcomes.length) * 100)
        : 0;

      // Calculate average rating
      const ratings = doctor.patientFeedbacks.map(f => f.rating).filter(Boolean);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
        : 0;

      // Calculate conversion rate (appointments / posts+comments)
      const conversionRate = (totalPosts + totalComments) > 0
        ? Math.round((totalAppointments / (totalPosts + totalComments)) * 100)
        : 0;

      // Calculate portfolio score (weighted average)
      const portfolioScore = Math.round(
        (treatmentSuccessRate * 0.4) + // 40% weight on treatment success
        (Number(avgRating) * 20 * 0.3) + // 30% weight on rating (scaled to 100)
        (Math.min(conversionRate, 100) * 0.2) + // 20% weight on conversion
        (Math.min((totalPosts + totalComments) / 10, 10) * 0.1) // 10% weight on activity
      );

      return {
        id: doctor.id,
        username: doctor.username,
        specialty: doctor.specialty || 'General',
        portfolioScore,
        treatmentSuccessRate,
        totalPatients: doctor.patientFeedbacks.length,
        totalPosts,
        totalComments,
        conversionRate,
        responseTime: 2.5 + Math.random() * 3, // Mock response time (2.5-5.5 hours)
        rating: Number(avgRating),
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by portfolio score and assign ranks
    doctorPerformance.sort((a, b) => b.portfolioScore - a.portfolioScore);
    doctorPerformance.forEach((doctor, index) => {
      doctor.rank = index + 1;
    });

    // Return top N doctors
    const topDoctors = doctorPerformance.slice(0, Number(limit));

    res.json({
      success: true,
      data: topDoctors,
      total: doctorPerformance.length
    });
  } catch (error: any) {
    console.error('Error fetching doctor leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

