import express from 'express';
import { medicalLibraryService } from '../services/medical-library.service';

const router = express.Router();

// Get all articles
router.get('/articles', (req, res) => {
  try {
    const articles = medicalLibraryService.getAllArticles();
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get article by ID
router.get('/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const article = medicalLibraryService.getArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ success: true, article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get articles by category
router.get('/categories/:category', (req, res) => {
  try {
    const { category } = req.params;
    const articles = medicalLibraryService.getArticlesByCategory(category as any);
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Search articles
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const articles = medicalLibraryService.searchArticles(q);
    res.json({ success: true, articles, query: q });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});

// Get first aid guides
router.get('/first-aid', (req, res) => {
  try {
    const articles = medicalLibraryService.getFirstAidGuides();
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching first aid guides:', error);
    res.status(500).json({ error: 'Failed to fetch first aid guides' });
  }
});

// Get emergency procedures
router.get('/emergency', (req, res) => {
  try {
    const articles = medicalLibraryService.getEmergencyProcedures();
    res.json({ success: true, articles });
  } catch (error) {
    console.error('Error fetching emergency procedures:', error);
    res.status(500).json({ error: 'Failed to fetch emergency procedures' });
  }
});

export default router;
