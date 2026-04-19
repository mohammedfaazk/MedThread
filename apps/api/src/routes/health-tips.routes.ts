import { Router } from 'express';
import { authenticate } from '../middleware/auth.refactored';
import { healthTipsService } from '../services/health-tips.service';
import { parseIntSafe, validateRequiredString } from '../utils/validation';

const router = Router();

/**
 * GET /api/health-tips/daily
 * Get daily health tip for authenticated user
 */
router.get('/daily', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const tip = await healthTipsService.getDailyTipForUser(userId);
    
    res.json({ success: true, data: tip });
  } catch (error: any) {
    console.error('Error getting daily tip:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/health-tips/personalized
 * Get personalized health tips using AI
 */
router.get('/personalized', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const count = parseIntSafe(req.query.count, 3, { min: 1, max: 10, fieldName: 'count' });
    
    const tips = await healthTipsService.getPersonalizedTips(userId, count);
    
    res.json({ success: true, data: tips });
  } catch (error: any) {
    console.error('Error getting personalized tips:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/health-tips/medication-reminders
 * Get medication reminders for user
 */
router.get('/medication-reminders', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const reminders = await healthTipsService.getMedicationReminders(userId);
    
    res.json({ success: false, data: reminders });
  } catch (error: any) {
    console.error('Error getting medication reminders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/health-tips/category/:category
 * Get tips by category
 */
router.get('/category/:category', authenticate, async (req, res) => {
  try {
    const category = validateRequiredString(req.params.category, 'category', { maxLength: 100 });
    const tips = healthTipsService.getTipsByCategory(category);
    
    res.json({ success: true, data: tips });
  } catch (error: any) {
    console.error('Error getting tips by category:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/health-tips/search
 * Search tips by keyword
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const keyword = validateRequiredString(req.query.q, 'search keyword', { 
      minLength: 2, 
      maxLength: 200 
    });
    
    const tips = healthTipsService.searchTips(keyword);
    
    res.json({ success: true, data: tips });
  } catch (error: any) {
    console.error('Error searching tips:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
