import express from 'express';
import { authenticate } from '../middleware/auth';
import { symptomDiaryService } from '../services/symptom-diary.service';

const router = express.Router();

// Create entry
router.post('/entries', authenticate, async (req, res) => {
  try {
    const { userId, entry } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const created = await symptomDiaryService.createEntry(userId, entry);
    res.json({ success: true, entry: created });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Get entries
router.get('/entries/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = req.query;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const entries = await symptomDiaryService.getEntries(userId, filters);
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Get single entry
router.get('/entries/detail/:entryId', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await symptomDiaryService.getEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ entry });
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Update entry
router.put('/entries/:entryId', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { updates } = req.body;
    
    const updated = await symptomDiaryService.updateEntry(entryId, updates);
    res.json({ success: true, entry: updated });
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Add photo
router.post('/entries/:entryId/photos', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;
    const { photoUrl } = req.body;
    
    // Analyze photo
    const analysis = await symptomDiaryService.analyzePhoto(photoUrl);
    
    // Add to entry
    const updated = await symptomDiaryService.addPhoto(entryId, photoUrl, analysis);
    
    res.json({ success: true, entry: updated, analysis });
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

// Get healing progress
router.get('/entries/:entryId/progress', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;
    const progress = await symptomDiaryService.calculateHealingProgress(entryId);
    res.json({ progress });
  } catch (error) {
    console.error('Error calculating progress:', error);
    res.status(500).json({ error: 'Failed to calculate progress' });
  }
});

// Mark resolved
router.post('/entries/:entryId/resolve', authenticate, async (req, res) => {
  try {
    const { entryId } = req.params;
    const updated = await symptomDiaryService.markResolved(entryId);
    res.json({ success: true, entry: updated });
  } catch (error) {
    console.error('Error marking resolved:', error);
    res.status(500).json({ error: 'Failed to mark resolved' });
  }
});

// Get statistics
router.get('/statistics/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = await symptomDiaryService.getStatistics(userId);
    res.json({ statistics: stats });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
