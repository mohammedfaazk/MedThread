import { Router } from 'express';
import { searchService } from '../services/search.service';

const router = Router();

// Search doctors
router.get('/doctors', async (req, res, next) => {
  try {
    const {
      q,
      specialty,
      subSpecialty,
      location,
      pincode,
      availability,
      sortBy,
      limit,
      offset
    } = req.query;

    const results = await searchService.searchDoctors({
      query: q as string,
      specialty: specialty as string,
      subSpecialty: subSpecialty as string,
      location: location as string,
      pincode: pincode as string,
      availability: availability as 'available' | 'all',
      sortBy: sortBy as any,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Search posts
router.get('/posts', async (req, res, next) => {
  try {
    const {
      q,
      communityId,
      authorRole,
      priority,
      dateFrom,
      dateTo,
      limit,
      offset
    } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchService.searchPosts({
      query: q as string,
      communityId: communityId as string,
      authorRole: authorRole as any,
      priority: priority as any,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Search symptoms
router.get('/symptoms', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchService.searchSymptoms(q as string);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Autocomplete
router.get('/autocomplete', async (req, res, next) => {
  try {
    const { q, type = 'all', limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await searchService.autocomplete({
      query: q as string,
      type: type as any,
      limit: limit ? Number(limit) : undefined
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Global search (all types)
router.get('/', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const [doctors, posts, symptoms] = await Promise.all([
      searchService.searchDoctors({
        query: q as string,
        limit: Number(limit)
      }),
      searchService.searchPosts({
        query: q as string,
        limit: Number(limit)
      }),
      searchService.searchSymptoms(q as string)
    ]);

    res.json({
      doctors: doctors.doctors,
      posts: posts.posts,
      symptoms: symptoms.suggestions,
      totals: {
        doctors: doctors.total,
        posts: posts.total,
        symptoms: symptoms.suggestions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
