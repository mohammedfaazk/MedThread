import { Router } from 'express';
import {
  getDiseaseStatistics,
  getMultipleDiseaseStatistics,
  getDiseaseGeographicData,
  getAllCountriesCovidData,
  getUSStatesCovidData,
  getComprehensiveTrends
} from '../controllers/trends.controller';

const router = Router();

// Get statistics for a specific disease using Tavily API
router.get('/disease-stats', getDiseaseStatistics);

// Get statistics for multiple diseases
router.get('/multiple-diseases', getMultipleDiseaseStatistics);

// Get geographic distribution for a disease
router.get('/geographic-data', getDiseaseGeographicData);

// Get all countries COVID-19 data
router.get('/covid/countries', getAllCountriesCovidData);

// Get US states COVID-19 data
router.get('/covid/states', getUSStatesCovidData);

// Get comprehensive trends (all diseases)
router.get('/comprehensive', getComprehensiveTrends);

export { router as trendsRouter };
