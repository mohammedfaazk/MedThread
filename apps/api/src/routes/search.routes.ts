import { Router, Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.get('/doctors', async (req: AuthRequest, res: Response) => {
  try {
    const result = await searchService.searchDoctors({
      query: req.query.q as string,
      specialty: req.query.specialty as string,
      location: req.query.location as string,
      minExperience: req.query.minExp ? parseInt(req.query.minExp as string) : undefined,
      maxExperience: req.query.maxExp ? parseInt(req.query.maxExp as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      languages: req.query.languages ? (req.query.languages as string).split(',') : undefined,
      sortBy: (req.query.sortBy as any) || 'relevance',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

router.get('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const result = await searchService.searchPosts({
      query: req.query.q as string,
      authorRole: (req.query.authorRole as any) || 'all',
      sortBy: (req.query.sortBy as any) || 'relevance',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

router.get('/symptoms', async (req: AuthRequest, res: Response) => {
  try {
    const result = await searchService.searchSymptoms(req.query.q as string, {
      includeRelated: req.query.related === 'true',
      includeTreatments: req.query.treatments === 'true'
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

router.get('/autocomplete', async (req: AuthRequest, res: Response) => {
  try {
    const result = await searchService.autocomplete({
      query: req.query.q as string,
      type: (req.query.type as any) || 'all',
      userId: req.userId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 5
    });
    
    // Format response to match frontend expectations
    res.json({
      success: true,
      data: {
        posts: result.posts || [],
        users: result.doctors || [],
        communities: [], // Add communities if needed
        symptoms: result.symptoms || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Autocomplete failed' 
    });
  }
});

router.post('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { query, type } = req.body;
    await searchService.saveSearchHistory(req.userId, query, type);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Save failed' });
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await searchService.getSearchHistory(req.userId, req.query.type as string);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Fetch failed' });
  }
});

export default router;
