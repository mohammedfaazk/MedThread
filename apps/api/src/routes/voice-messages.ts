import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { voiceMessageService } from '../services/voice-message.service';

const router = express.Router();

// Configure multer for voice message uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/voice'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `voice-${uniqueSuffix}.webm`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Upload voice message
router.post('/upload', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { chatId, duration } = req.body;
    const userId = (req as any).userId;

    const voiceMessage = await voiceMessageService.createVoiceMessage({
      userId,
      chatId,
      filePath: req.file.path,
      fileName: req.file.filename,
      duration: parseInt(duration) || 0,
      fileSize: req.file.size
    });

    res.json({ 
      success: true, 
      voiceMessage,
      url: `/uploads/voice/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading voice message:', error);
    res.status(500).json({ error: 'Failed to upload voice message' });
  }
});

// Get voice message
router.get('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const voiceMessage = await voiceMessageService.getVoiceMessage(messageId);

    if (!voiceMessage) {
      return res.status(404).json({ error: 'Voice message not found' });
    }

    res.json({ voiceMessage });
  } catch (error) {
    console.error('Error fetching voice message:', error);
    res.status(500).json({ error: 'Failed to fetch voice message' });
  }
});

// Get chat voice messages
router.get('/chat/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const voiceMessages = await voiceMessageService.getChatVoiceMessages(chatId);

    res.json({ voiceMessages });
  } catch (error) {
    console.error('Error fetching chat voice messages:', error);
    res.status(500).json({ error: 'Failed to fetch voice messages' });
  }
});

// Delete voice message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = (req as any).userId;

    await voiceMessageService.deleteVoiceMessage(messageId, userId);

    res.json({ success: true, message: 'Voice message deleted' });
  } catch (error) {
    console.error('Error deleting voice message:', error);
    res.status(500).json({ error: 'Failed to delete voice message' });
  }
});

export default router;
