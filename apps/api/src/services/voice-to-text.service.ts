import OpenAI from 'openai';
import { prisma } from '@medthread/database';
import fs from 'fs';
import path from 'path';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export class VoiceToTextService {
  /**
   * Convert voice to text using OpenAI Whisper
   */
  async transcribeAudio(audioFilePath: string, language?: string): Promise<{
    text: string;
    language: string;
    duration: number;
  }> {
    try {
      if (!openai) {
        throw new Error('Voice-to-text service not configured');
      }

      // Read audio file
      const audioFile = fs.createReadStream(audioFilePath);

      // Transcribe using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language || undefined,
        response_format: 'verbose_json'
      });

      return {
        text: transcription.text,
        language: transcription.language || language || 'en',
        duration: transcription.duration || 0
      };
    } catch (error) {
      console.error('[VoiceToText] Error transcribing audio:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio buffer
   */
  async transcribeBuffer(audioBuffer: Buffer, filename: string, language?: string): Promise<{
    text: string;
    language: string;
  }> {
    try {
      if (!openai) {
        throw new Error('Voice-to-text service not configured');
      }

      // Save buffer to temporary file
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, filename);
      fs.writeFileSync(tempFilePath, audioBuffer);

      // Transcribe
      const result = await this.transcribeAudio(tempFilePath, language);

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      return {
        text: result.text,
        language: result.language
      };
    } catch (error) {
      console.error('[VoiceToText] Error transcribing buffer:', error);
      throw error;
    }
  }

  /**
   * Transcribe and translate
   */
  async transcribeAndTranslate(audioFilePath: string, targetLanguage: string = 'en'): Promise<{
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
  }> {
    try {
      if (!openai) {
        throw new Error('Voice-to-text service not configured');
      }

      // First transcribe
      const transcription = await this.transcribeAudio(audioFilePath);

      // Then translate if needed
      if (transcription.language !== targetLanguage) {
        const audioFile = fs.createReadStream(audioFilePath);
        
        const translation = await openai.audio.translations.create({
          file: audioFile,
          model: 'whisper-1'
        });

        return {
          originalText: transcription.text,
          translatedText: translation.text,
          sourceLanguage: transcription.language
        };
      }

      return {
        originalText: transcription.text,
        translatedText: transcription.text,
        sourceLanguage: transcription.language
      };
    } catch (error) {
      console.error('[VoiceToText] Error transcribing and translating:', error);
      throw error;
    }
  }

  /**
   * Save transcription to database
   */
  async saveTranscription(userId: string, audioUrl: string, transcription: string, language: string, duration: number) {
    try {
      const saved = await prisma.voiceTranscription.create({
        data: {
          userId,
          audioUrl,
          transcription,
          language,
          duration
        }
      });

      return saved;
    } catch (error) {
      console.error('[VoiceToText] Error saving transcription:', error);
      throw error;
    }
  }

  /**
   * Get user's transcription history
   */
  async getUserTranscriptions(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [transcriptions, total] = await Promise.all([
        prisma.voiceTranscription.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.voiceTranscription.count({ where: { userId } })
      ]);

      return {
        transcriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[VoiceToText] Error getting transcriptions:', error);
      throw error;
    }
  }

  /**
   * Get supported languages for transcription
   */
  getSupportedLanguages(): string[] {
    return [
      'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa',
      'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'
    ];
  }

  /**
   * Validate audio file
   */
  validateAudioFile(filename: string, fileSize: number): {
    valid: boolean;
    error?: string;
  } {
    const allowedExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    const ext = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      };
    }

    if (fileSize > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 25MB limit'
      };
    }

    return { valid: true };
  }

  /**
   * Get transcription statistics
   */
  async getTranscriptionStats(userId?: string) {
    try {
      const where = userId ? { userId } : {};

      const [total, byLanguage, totalDuration] = await Promise.all([
        prisma.voiceTranscription.count({ where }),
        prisma.voiceTranscription.groupBy({
          by: ['language'],
          where,
          _count: true
        }),
        prisma.voiceTranscription.aggregate({
          where,
          _sum: { duration: true }
        })
      ]);

      return {
        totalTranscriptions: total,
        byLanguage: byLanguage.reduce((acc, item) => {
          acc[item.language] = item._count;
          return acc;
        }, {} as Record<string, number>),
        totalDuration: totalDuration._sum.duration || 0
      };
    } catch (error) {
      console.error('[VoiceToText] Error getting stats:', error);
      return {
        totalTranscriptions: 0,
        byLanguage: {},
        totalDuration: 0
      };
    }
  }
}

export const voiceToTextService = new VoiceToTextService();
