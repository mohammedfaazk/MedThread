import express from 'express';
import { authenticate } from '../middleware/auth';
import { messageCacheService } from '../services/message-cache.service';
import { typingIndicatorService } from '../services/typing-indicator.service';
import { translationService, SUPPORTED_LANGUAGES } from '../services/translation.service';
import { voiceToTextService } from '../services/voice-to-text.service';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|mp4|mpeg|mpga|m4a|wav|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid audio file type'));
  }
});

// ============ MESSAGE CACHING ============

// Cache conversation messages
router.post('/cache/messages/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await messageCacheService.cacheConversationMessages(
      req.params.conversationId,
      req.user.id
    );
    res.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('Error caching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cached messages
router.get('/cache/messages/:conversationId', authenticate, async (req, res) => {
  try {
    const messages = await messageCacheService.getCachedMessages(
      req.params.conversationId,
      req.user.id
    );
    res.json({ success: true, data: messages });
  } catch (error: any) {
    console.error('Error getting cached messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cache user conversations
router.post('/cache/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await messageCacheService.cacheUserConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error('Error caching conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cached conversations
router.get('/cache/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await messageCacheService.getCachedConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (error: any) {
    console.error('Error getting cached conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Prefetch for offline
router.post('/cache/prefetch', authenticate, async (req, res) => {
  try {
    const { conversationIds } = req.body;
    
    if (!Array.isArray(conversationIds)) {
      return res.status(400).json({ success: false, error: 'conversationIds must be an array' });
    }

    const result = await messageCacheService.prefetchForOffline(req.user.id, conversationIds);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error prefetching for offline:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get cache stats
router.get('/cache/stats', authenticate, async (req, res) => {
  try {
    const stats = await messageCacheService.getCacheStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ TYPING INDICATORS ============

// Start typing
router.post('/typing/:conversationId/start', authenticate, async (req, res) => {
  try {
    await typingIndicatorService.startTyping(
      req.params.conversationId,
      req.user.id,
      req.user.username
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error starting typing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop typing
router.post('/typing/:conversationId/stop', authenticate, async (req, res) => {
  try {
    await typingIndicatorService.stopTyping(req.params.conversationId, req.user.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error stopping typing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get typing users
router.get('/typing/:conversationId', authenticate, async (req, res) => {
  try {
    const users = await typingIndicatorService.getTypingUsers(req.params.conversationId);
    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Error getting typing users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ TRANSLATION ============

// Translate text
router.post('/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLang, sourceLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ success: false, error: 'text and targetLang required' });
    }

    const translated = await translationService.translateText(text, targetLang, sourceLang);
    res.json({ success: true, data: { translatedText: translated } });
  } catch (error: any) {
    console.error('Error translating text:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Translate batch
router.post('/translate/batch', authenticate, async (req, res) => {
  try {
    const { texts, targetLang, sourceLang } = req.body;
    
    if (!Array.isArray(texts) || !targetLang) {
      return res.status(400).json({ success: false, error: 'texts array and targetLang required' });
    }

    const translations = await translationService.translateBatch(texts, targetLang, sourceLang);
    res.json({ success: true, data: { translations } });
  } catch (error: any) {
    console.error('Error translating batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Detect language
router.post('/translate/detect', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'text required' });
    }

    const language = await translationService.detectLanguage(text);
    res.json({ success: true, data: { language } });
  } catch (error: any) {
    console.error('Error detecting language:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get supported languages
router.get('/translate/languages', (req, res) => {
  res.json({ success: true, data: SUPPORTED_LANGUAGES });
});

// Get user language
router.get('/translate/user-language', authenticate, async (req, res) => {
  try {
    const language = await translationService.getUserLanguage(req.user.id);
    res.json({ success: true, data: { language } });
  } catch (error: any) {
    console.error('Error getting user language:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Set user language
router.post('/translate/user-language', authenticate, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({ success: false, error: 'language required' });
    }

    await translationService.setUserLanguage(req.user.id, language);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error setting user language:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Translate medical term
router.post('/translate/medical-term', authenticate, async (req, res) => {
  try {
    const { term, targetLang } = req.body;
    
    if (!term || !targetLang) {
      return res.status(400).json({ success: false, error: 'term and targetLang required' });
    }

    const result = await translationService.translateMedicalTerm(term, targetLang);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error translating medical term:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get translation stats
router.get('/translate/stats', authenticate, async (req, res) => {
  try {
    const stats = await translationService.getTranslationStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting translation stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ VOICE TO TEXT ============

// Transcribe audio
router.post('/voice-to-text/transcribe', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Audio file required' });
    }

    const language = req.body.language || 'en';
    const result = await voiceToTextService.transcribeAudio(req.file.path, language);

    // Save transcription
    await voiceToTextService.saveTranscription(
      req.user.id,
      req.file.path,
      result.text,
      result.language,
      result.duration
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transcribe and translate
router.post('/voice-to-text/transcribe-translate', authenticate, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Audio file required' });
    }

    const targetLanguage = req.body.targetLanguage || 'en';
    const result = await voiceToTextService.transcribeAndTranslate(req.file.path, targetLanguage);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error transcribing and translating:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user transcriptions
router.get('/voice-to-text/history', authenticate, async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await voiceToTextService.getUserTranscriptions(req.user.id, page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error getting transcriptions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get supported languages
router.get('/voice-to-text/languages', (req, res) => {
  const languages = voiceToTextService.getSupportedLanguages();
  res.json({ success: true, data: languages });
});

// Get transcription stats
router.get('/voice-to-text/stats', authenticate, async (req, res) => {
  try {
    const stats = await voiceToTextService.getTranscriptionStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting transcription stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
