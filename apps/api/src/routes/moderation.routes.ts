import express from 'express';
import { authenticate } from '../middleware/auth';
import { contentModerationService } from '../services/content-moderation.service';
import { reportingBlockingService } from '../services/reporting-blocking.service';

const router = express.Router();

// ============ CONTENT MODERATION ============

// Moderate content (internal use)
router.post('/moderate', authenticate, async (req, res) => {
  try {
    const { content, contentType } = req.body;
    
    if (!content || !contentType) {
      return res.status(400).json({ success: false, error: 'Content and contentType required' });
    }

    const result = await contentModerationService.moderateContent(content, contentType, req.user.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error moderating content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fact-check medical content
router.post('/fact-check', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content required' });
    }

    const result = await contentModerationService.factCheckMedicalContent(content);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fact-checking content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending reviews (moderator only)
router.get('/pending-reviews', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const result = await contentModerationService.getPendingReviews(page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching pending reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Review flagged content (moderator only)
router.post('/review/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { action, notes } = req.body;
    
    if (!['APPROVE', 'DELETE', 'WARN'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const result = await contentModerationService.reviewContent(req.params.id, req.user.id, action, notes);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error reviewing content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ REPORTING & BLOCKING ============

// Create report
router.post('/reports', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      reporterId: req.user.id
    };

    const report = await reportingBlockingService.createReport(data);
    res.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all reports (moderator only)
router.get('/reports', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      priority: req.query.priority as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await reportingBlockingService.getReports(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Review report (moderator only)
router.post('/reports/:id/review', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { action, notes } = req.body;
    
    if (!['DISMISS', 'WARN', 'SUSPEND', 'BAN', 'DELETE_CONTENT'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const report = await reportingBlockingService.reviewReport(req.params.id, req.user.id, action, notes);
    res.json({ success: true, data: report });
  } catch (error: any) {
    console.error('Error reviewing report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get report statistics (moderator only)
router.get('/reports/stats', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await reportingBlockingService.getReportStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block user
router.post('/block/:userId', authenticate, async (req, res) => {
  try {
    const block = await reportingBlockingService.blockUser(req.user.id, req.params.userId);
    res.json({ success: true, data: block });
  } catch (error: any) {
    console.error('Error blocking user:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Unblock user
router.delete('/block/:userId', authenticate, async (req, res) => {
  try {
    await reportingBlockingService.unblockUser(req.user.id, req.params.userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error unblocking user:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get blocked users
router.get('/blocked-users', authenticate, async (req, res) => {
  try {
    const users = await reportingBlockingService.getBlockedUsers(req.user.id);
    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check if user is blocked
router.get('/is-blocked/:userId', authenticate, async (req, res) => {
  try {
    const isBlocked = await reportingBlockingService.isBlocked(req.user.id, req.params.userId);
    res.json({ success: true, data: { isBlocked } });
  } catch (error: any) {
    console.error('Error checking block status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
