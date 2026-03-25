import express from 'express';
import { authenticate } from '../middleware/auth';
import { medicationService } from '../services/medication.service';

const router = express.Router();

// Get medication profile
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const profile = await medicationService.getMedicationProfile(userId);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching medication profile:', error);
    res.status(500).json({ error: 'Failed to fetch medication profile' });
  }
});

// Add medication
router.post('/add', authenticate, async (req, res) => {
  try {
    const { userId, medication } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await medicationService.addMedication(userId, medication);
    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error adding medication:', error);
    res.status(500).json({ error: 'Failed to add medication' });
  }
});

// Remove medication
router.delete('/remove', authenticate, async (req, res) => {
  try {
    const { userId, medicationId } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await medicationService.removeMedication(userId, medicationId);
    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error removing medication:', error);
    res.status(500).json({ error: 'Failed to remove medication' });
  }
});

// Get reminders
router.get('/reminders/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reminders = await medicationService.getReminders(
      userId,
      date ? new Date(date as string) : undefined
    );
    res.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/reminders', authenticate, async (req, res) => {
  try {
    const { userId, reminder } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const created = await medicationService.createReminder(userId, reminder);
    res.json({ success: true, reminder: created });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Mark reminder as taken
router.post('/reminders/:id/taken', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await medicationService.markReminderTaken(id);
    res.json({ success: true, reminder: updated });
  } catch (error) {
    console.error('Error marking reminder:', error);
    res.status(500).json({ error: 'Failed to mark reminder' });
  }
});

// Skip reminder
router.post('/reminders/:id/skip', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await medicationService.skipReminder(id, reason);
    res.json({ success: true, reminder: updated });
  } catch (error) {
    console.error('Error skipping reminder:', error);
    res.status(500).json({ error: 'Failed to skip reminder' });
  }
});

// Check interactions
router.get('/interactions/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const interactions = await medicationService.checkInteractions(userId);
    res.json({ interactions });
  } catch (error) {
    console.error('Error checking interactions:', error);
    res.status(500).json({ error: 'Failed to check interactions' });
  }
});

// Get adherence rate
router.get('/adherence/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const adherenceRate = await medicationService.calculateAdherence(
      userId,
      days ? parseInt(days as string) : 30
    );
    res.json({ adherenceRate });
  } catch (error) {
    console.error('Error calculating adherence:', error);
    res.status(500).json({ error: 'Failed to calculate adherence' });
  }
});

// Report side effect
router.post('/side-effects', authenticate, async (req, res) => {
  try {
    const { userId, medicationName, sideEffect, severity } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await medicationService.reportSideEffect(
      userId,
      medicationName,
      sideEffect,
      severity
    );
    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error reporting side effect:', error);
    res.status(500).json({ error: 'Failed to report side effect' });
  }
});

// Rate effectiveness
router.post('/effectiveness', authenticate, async (req, res) => {
  try {
    const { userId, medicationName, rating, notes } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await medicationService.rateEffectiveness(
      userId,
      medicationName,
      rating,
      notes
    );
    res.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error rating effectiveness:', error);
    res.status(500).json({ error: 'Failed to rate effectiveness' });
  }
});

export default router;
