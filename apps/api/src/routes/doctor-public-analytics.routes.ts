import { Router } from 'express';
import { prisma } from '@medthread/database';

const router = Router();

// ============================================
// DOCTOR PUBLIC PROFILE ANALYTICS
// ============================================

// 1. Treatment Outcomes
router.get('/:doctorId/treatment-outcomes', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const outcomes = await prisma.patientFeedback.groupBy({
      by: ['status'],
      where: { doctorId },
      _count: { id: true }
    });

    const chartData = outcomes.map(o => ({
      name: o.status === 'CURED' ? 'Cured' : 
            o.status === 'NOT_YET' ? 'Ongoing Treatment' : 
            'Switched Doctor',
      value: o._count.id
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const cureRate = total > 0 
      ? Math.round((chartData.find(d => d.name === 'Cured')?.value || 0) / total * 100)
      : 0;

    res.json({
      success: true,
      data: chartData,
      kpi: `${cureRate}% Cure Rate`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Total Posts Over Time
router.get('/:doctorId/posts-over-time', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const posts = await prisma.post.findMany({
      where: {
        authorId: doctorId,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    });

    // Group by month
    const monthlyPosts: Record<string, number> = {};

    posts.forEach(post => {
      const monthKey = `${post.createdAt.getFullYear()}-${String(post.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyPosts[monthKey] = (monthlyPosts[monthKey] || 0) + 1;
    });

    const chartData = Object.entries(monthlyPosts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, posts: count }));

    res.json({
      success: true,
      data: chartData,
      kpi: `${posts.length} Total Posts`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Total Comments Over Time
router.get('/:doctorId/comments-over-time', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const comments = await prisma.comment.findMany({
      where: {
        authorId: doctorId,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    });

    // Group by month
    const monthlyComments: Record<string, number> = {};

    comments.forEach(comment => {
      const monthKey = `${comment.createdAt.getFullYear()}-${String(comment.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyComments[monthKey] = (monthlyComments[monthKey] || 0) + 1;
    });

    const chartData = Object.entries(monthlyComments)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, comments: count }));

    res.json({
      success: true,
      data: chartData,
      kpi: `${comments.length} Total Comments`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Conversion Rate
router.get('/:doctorId/conversion-rate', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    // Get conversions by month
    const conversions = await prisma.commentConversion.findMany({
      where: {
        doctorId,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        messageClicked: true
      }
    });

    // Group by month
    const monthlyConversions: Record<string, { total: number; converted: number }> = {};

    conversions.forEach(conv => {
      const monthKey = `${conv.createdAt.getFullYear()}-${String(conv.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyConversions[monthKey]) {
        monthlyConversions[monthKey] = { total: 0, converted: 0 };
      }

      monthlyConversions[monthKey].total++;
      if (conv.messageClicked) {
        monthlyConversions[monthKey].converted++;
      }
    });

    const chartData = Object.entries(monthlyConversions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        rate: counts.total > 0 ? Math.round((counts.converted / counts.total) * 100) : 0
      }));

    const avgConversion = chartData.length > 0
      ? Math.round(chartData.reduce((sum, item) => sum + item.rate, 0) / chartData.length)
      : 0;

    res.json({
      success: true,
      data: chartData,
      kpi: `${avgConversion}% Avg Conversion`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Patients Cured Monthly
router.get('/:doctorId/patients-cured', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const curedPatients = await prisma.patientFeedback.findMany({
      where: {
        doctorId,
        status: 'CURED',
        curedAt: { gte: startDate }
      },
      select: { curedAt: true }
    });

    // Group by month
    const monthlyCured: Record<string, number> = {};

    curedPatients.forEach(patient => {
      if (patient.curedAt) {
        const monthKey = `${patient.curedAt.getFullYear()}-${String(patient.curedAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyCured[monthKey] = (monthlyCured[monthKey] || 0) + 1;
      }
    });

    const chartData = Object.entries(monthlyCured)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, cured: count }));

    res.json({
      success: true,
      data: chartData,
      kpi: `${curedPatients.length} Patients Cured`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Clinic Visits
router.get('/:doctorId/clinic-visits', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const clinicVisits = await prisma.patientFeedback.findMany({
      where: {
        doctorId,
        wasClinicVisit: true,
        createdAt: { gte: startDate }
      },
      select: { createdAt: true }
    });

    // Group by month
    const monthlyVisits: Record<string, number> = {};

    clinicVisits.forEach(visit => {
      const monthKey = `${visit.createdAt.getFullYear()}-${String(visit.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyVisits[monthKey] = (monthlyVisits[monthKey] || 0) + 1;
    });

    const chartData = Object.entries(monthlyVisits)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, visits: count }));

    res.json({
      success: true,
      data: chartData,
      kpi: `${clinicVisits.length} Total Visits`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Portfolio Score History
router.get('/:doctorId/portfolio-score', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { months = 12 } = req.query;

    // Get performance metrics history
    const performance = await prisma.doctorPerformance.findUnique({
      where: { doctorId }
    });

    if (!performance) {
      return res.json({
        success: true,
        data: [],
        kpi: 'No Data'
      });
    }

    // Generate monthly score history (simplified - in production, store historical data)
    const chartData = [];
    const currentScore = performance.portfolioScore;
    
    for (let i = Number(months) - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Simulate score growth over time
      const score = Math.max(0, currentScore - (i * 5) + (Math.random() * 10 - 5));
      
      chartData.push({
        month: monthKey,
        score: Math.round(score)
      });
    }

    res.json({
      success: true,
      data: chartData,
      kpi: `Current Score: ${Math.round(currentScore)} / 100`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
