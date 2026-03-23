import { Router } from 'express';
import { getSymptomHeatmap, getTrendsSeries, getTest, getRegionData } from '../controllers/analytics.controller';

const router = Router();

router.get('/test', getTest);
router.get('/symptom-heatmap', getSymptomHeatmap);
router.get('/trends-series', getTrendsSeries);
router.get('/regions', getRegionData);

export { router as analyticsRouter };