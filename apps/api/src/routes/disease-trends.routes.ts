import { Router } from 'express';
import { DiseaseTrendsService } from '../services/disease-trends.service';

const router = Router();

/**
 * GET /api/v1/disease-trends
 * Get disease trends for a specific disease, location, and year
 */
router.get('/', async (req, res) => {
  try {
    const { disease, location, year } = req.query;

    if (!disease || !location) {
      return res.status(400).json({
        success: false,
        error: 'Disease and location are required'
      });
    }

    const currentYear = new Date().getFullYear();
    const searchYear = year ? parseInt(year as string) : currentYear;

    const trends = await DiseaseTrendsService.getDiseaseTrends(
      disease as string,
      location as string,
      searchYear
    );

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error('Disease trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease trends',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/disease-trends/batch
 * Get trends for multiple diseases/locations at once
 */
router.post('/batch', async (req, res) => {
  try {
    const { requests } = req.body;

    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({
        success: false,
        error: 'Requests array is required with format: [{disease, location, year}]'
      });
    }

    const currentYear = new Date().getFullYear();

    // Fetch trends for all requests
    const trendsPromises = requests.map(request =>
      DiseaseTrendsService.getDiseaseTrends(
        request.disease,
        request.location,
        request.year || currentYear
      )
    );

    const trends = await Promise.all(trendsPromises);

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    console.error('Batch disease trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease trends',
      message: error.message
    });
  }
});

/**
 * DELETE /api/v1/disease-trends/cache
 * Clear expired cache entries (admin only)
 */
router.delete('/cache', async (req, res) => {
  try {
    const cleared = await DiseaseTrendsService.clearExpiredCache();

    res.json({
      success: true,
      message: `Cleared ${cleared} expired cache entries`
    });
  } catch (error: any) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

export default router;
