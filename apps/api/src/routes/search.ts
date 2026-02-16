import { Router } from 'express';
import { searchService } from '../services/search.service';

const router = Router();

/**
 * Universal search endpoint
 * GET /api/v1/search?q=query&type=all|posts|users|communities&limit=20&offset=0
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      q: query,
      type = 'all',
      limit = '20',
      offset = '0'
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const results = await searchService.search({
      query,
      type: type as 'all' | 'posts' | 'users' | 'communities',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: results,
      query
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search posts
 * GET /api/v1/search/posts?q=query&community=slug&limit=20&offset=0
 */
router.get('/posts', async (req, res, next) => {
  try {
    const {
      q: query,
      community,
      limit = '20',
      offset = '0'
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const posts = await searchService.searchPosts({
      query,
      community: community as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search users
 * GET /api/v1/search/users?q=query&role=doctor&limit=20&offset=0
 */
router.get('/users', async (req, res, next) => {
  try {
    const {
      q: query,
      role,
      limit = '20',
      offset = '0'
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const users = await searchService.searchUsers({
      query,
      role: role as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search communities
 * GET /api/v1/search/communities?q=query&limit=20&offset=0
 */
router.get('/communities', async (req, res, next) => {
  try {
    const {
      q: query,
      limit = '20',
      offset = '0'
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const communities = await searchService.searchCommunities({
      query,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: communities,
      count: communities.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search doctors by specialty
 * GET /api/v1/search/doctors?specialty=cardiology&limit=20&offset=0
 */
router.get('/doctors', async (req, res, next) => {
  try {
    const {
      specialty,
      limit = '20',
      offset = '0'
    } = req.query;

    const doctors = await searchService.searchDoctors(
      specialty as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get autocomplete suggestions
 * GET /api/v1/search/autocomplete?q=query&limit=5
 */
router.get('/autocomplete', async (req, res, next) => {
  try {
    const {
      q: query,
      limit = '5'
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.json({
        success: true,
        data: { posts: [], users: [], communities: [] }
      });
    }

    const suggestions = await searchService.getAutocompleteSuggestions(
      query,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get popular searches
 * GET /api/v1/search/popular?limit=10
 */
router.get('/popular', async (req, res, next) => {
  try {
    const { limit = '10' } = req.query;

    const popularSearches = searchService.getPopularSearches(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    next(error);
  }
});

export default router;
