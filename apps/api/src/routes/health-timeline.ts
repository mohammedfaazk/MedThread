import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { healthTimelineService } from '../services/health-timeline.service';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, eventTypes } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (eventTypes) filters.eventTypes = (eventTypes as string).split(',');

    const timeline = await healthTimelineService.getTimeline(userId, filters);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const event = await healthTimelineService.addEvent(userId, req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await healthTimelineService.updateEvent(id, userId, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await healthTimelineService.deleteEvent(id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const stats = await healthTimelineService.getStats(userId, start, end);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
