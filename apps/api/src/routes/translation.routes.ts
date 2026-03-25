import express from 'express';
import { authenticate } from '../middleware/auth';
import { translationService } from '../services/translation.service';

const router = express.Router();

// Translate text
router.post('/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const result = await translationService.translateText({
      text,
      targetLanguage,
      sourceLanguage
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Translation error:', error);
    const errorMessage = error.message || 'Failed to translate text';
    res.status(500).json({ error: errorMessage });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();
    res.json({ success: true, languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

export default router;
