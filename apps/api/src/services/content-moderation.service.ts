import { prisma } from '@medthread/database';
import { notificationService } from './notification.service';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Emergency keywords that trigger immediate alerts
const EMERGENCY_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die',
  'overdose', 'self harm', 'cutting myself',
  'chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing',
  'severe bleeding', 'unconscious', 'seizure',
  'stroke symptoms', 'paralysis', 'severe headache',
  'poisoning', 'swallowed', 'ingested'
];

// Medical misinformation patterns
const MISINFORMATION_PATTERNS = [
  'cure cancer with',
  'vaccines cause autism',
  'covid is fake',
  'don\'t trust doctors',
  'miracle cure',
  'big pharma conspiracy',
  'natural remedy cures all'
];

interface ModerationResult {
  flagged: boolean;
  reasons: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresReview: boolean;
  autoAction?: 'NONE' | 'HIDE' | 'DELETE' | 'EMERGENCY_ALERT';
}

export class ContentModerationService {
  /**
   * Moderate content (text)
   */
  async moderateContent(content: string, contentType: string, authorId: string): Promise<ModerationResult> {
    try {
      const result: ModerationResult = {
        flagged: false,
        reasons: [],
        severity: 'LOW',
        requiresReview: false,
        autoAction: 'NONE'
      };

      // Check for emergency keywords
      const emergencyCheck = this.checkEmergencyKeywords(content);
      if (emergencyCheck.detected) {
        result.flagged = true;
        result.reasons.push(...emergencyCheck.keywords);
        result.severity = 'CRITICAL';
        result.autoAction = 'EMERGENCY_ALERT';
        result.requiresReview = true;

        // Trigger emergency alert
        await this.handleEmergencyContent(content, contentType, authorId, emergencyCheck.keywords);
        return result;
      }

      // Check for medical misinformation
      const misinfoCheck = this.checkMisinformation(content);
      if (misinfoCheck.detected) {
        result.flagged = true;
        result.reasons.push('Potential medical misinformation');
        result.severity = 'HIGH';
        result.requiresReview = true;
        result.autoAction = 'HIDE';
      }

      // Check for profanity and inappropriate content
      const profanityCheck = this.checkProfanity(content);
      if (profanityCheck.detected) {
        result.flagged = true;
        result.reasons.push('Inappropriate language');
        result.severity = result.severity === 'HIGH' ? 'HIGH' : 'MEDIUM';
        result.requiresReview = true;
      }

      // AI-based moderation (if available)
      if (openai && result.flagged) {
        const aiCheck = await this.aiModeration(content);
        if (aiCheck.flagged) {
          result.reasons.push(...aiCheck.reasons);
          result.severity = this.getHighestSeverity(result.severity, aiCheck.severity);
        }
      }

      // Log moderation result
      if (result.flagged) {
        await this.logModerationAction(content, contentType, authorId, result);
      }

      return result;
    } catch (error) {
      console.error('[ContentModeration] Error moderating content:', error);
      return {
        flagged: false,
        reasons: [],
        severity: 'LOW',
        requiresReview: false,
        autoAction: 'NONE'
      };
    }
  }

  /**
   * Check for emergency keywords
   */
  private checkEmergencyKeywords(content: string): { detected: boolean; keywords: string[] } {
    const lowerContent = content.toLowerCase();
    const detectedKeywords: string[] = [];

    for (const keyword of EMERGENCY_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        detectedKeywords.push(keyword);
      }
    }

    return {
      detected: detectedKeywords.length > 0,
      keywords: detectedKeywords.map(k => `Emergency keyword: "${k}"`)
    };
  }

  /**
   * Check for medical misinformation
   */
  private checkMisinformation(content: string): { detected: boolean } {
    const lowerContent = content.toLowerCase();

    for (const pattern of MISINFORMATION_PATTERNS) {
      if (lowerContent.includes(pattern)) {
        return { detected: true };
      }
    }

    return { detected: false };
  }

  /**
   * Check for profanity
   */
  private checkProfanity(content: string): { detected: boolean } {
    const profanityList = [
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'crap',
      'bastard', 'dick', 'pussy', 'cock', 'whore', 'slut'
    ];

    const lowerContent = content.toLowerCase();

    for (const word of profanityList) {
      if (lowerContent.includes(word)) {
        return { detected: true };
      }
    }

    return { detected: false };
  }

  /**
   * AI-based content moderation
   */
  private async aiModeration(content: string): Promise<{ flagged: boolean; reasons: string[]; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> {
    try {
      if (!openai) {
        return { flagged: false, reasons: [], severity: 'LOW' };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a medical content moderator. Analyze the following content for: 1) Medical misinformation, 2) Harmful advice, 3) Inappropriate content. Respond with JSON: {flagged: boolean, reasons: string[], severity: "LOW"|"MEDIUM"|"HIGH"}'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content || '{"flagged":false,"reasons":[],"severity":"LOW"}');
      return result;
    } catch (error) {
      console.error('[ContentModeration] AI moderation error:', error);
      return { flagged: false, reasons: [], severity: 'LOW' };
    }
  }

  /**
   * Handle emergency content
   */
  private async handleEmergencyContent(content: string, contentType: string, authorId: string, keywords: string[]) {
    try {
      // Create emergency alert
      await prisma.emergencyAlert.create({
        data: {
          userId: authorId,
          content: content.substring(0, 500),
          contentType,
          detectedKeywords: keywords,
          status: 'PENDING',
          severity: 'CRITICAL'
        }
      });

      // Notify admins immediately
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      for (const admin of admins) {
        await notificationService.sendNotification(admin.id, {
          title: '🚨 EMERGENCY ALERT',
          body: `User may be in crisis. Keywords detected: ${keywords.join(', ')}`,
          urgent: true,
          type: 'EMERGENCY_ALERT',
          data: {
            userId: authorId,
            keywords: keywords.join(', ')
          }
        });
      }

      // Send crisis resources to user
      await notificationService.sendNotification(authorId, {
        title: 'Crisis Support Resources',
        body: 'If you\'re in crisis, please contact: National Suicide Prevention Lifeline: 988 or Emergency Services: 911',
        urgent: true,
        type: 'CRISIS_RESOURCES',
        data: {
          resources: JSON.stringify({
            suicide: '988',
            emergency: '911',
            crisis: '1-800-273-8255'
          })
        }
      });

      console.log(`[ContentModeration] Emergency alert created for user ${authorId}`);
    } catch (error) {
      console.error('[ContentModeration] Error handling emergency content:', error);
    }
  }

  /**
   * Log moderation action
   */
  private async logModerationAction(content: string, contentType: string, authorId: string, result: ModerationResult) {
    try {
      await prisma.moderationLog.create({
        data: {
          contentType,
          content: content.substring(0, 1000),
          authorId,
          flagged: result.flagged,
          reasons: result.reasons,
          severity: result.severity,
          autoAction: result.autoAction || 'NONE',
          requiresReview: result.requiresReview
        }
      });
    } catch (error) {
      console.error('[ContentModeration] Error logging moderation:', error);
    }
  }

  /**
   * Get highest severity
   */
  private getHighestSeverity(s1: string, s2: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const order = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const severity1 = order[s1 as keyof typeof order] || 1;
    const severity2 = order[s2 as keyof typeof order] || 1;
    
    const highest = Math.max(severity1, severity2);
    return Object.keys(order).find(k => order[k as keyof typeof order] === highest) as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }

  /**
   * Fact-check medical content
   */
  async factCheckMedicalContent(content: string): Promise<{
    needsReview: boolean;
    confidence: number;
    concerns: string[];
    suggestions: string[];
  }> {
    try {
      if (!openai) {
        return {
          needsReview: false,
          confidence: 0,
          concerns: [],
          suggestions: []
        };
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical fact-checker. Analyze the medical content for accuracy. Respond with JSON: {needsReview: boolean, confidence: 0-100, concerns: string[], suggestions: string[]}'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{"needsReview":false,"confidence":0,"concerns":[],"suggestions":[]}');
      
      // Log fact-check
      if (result.needsReview) {
        await prisma.factCheckLog.create({
          data: {
            content: content.substring(0, 1000),
            needsReview: result.needsReview,
            confidence: result.confidence,
            concerns: result.concerns,
            suggestions: result.suggestions
          }
        });
      }

      return result;
    } catch (error) {
      console.error('[ContentModeration] Fact-check error:', error);
      return {
        needsReview: false,
        confidence: 0,
        concerns: [],
        suggestions: []
      };
    }
  }

  /**
   * Get content pending review
   */
  async getPendingReviews(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.moderationLog.findMany({
          where: {
            requiresReview: true,
            reviewedAt: null
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: [
            { severity: 'desc' },
            { createdAt: 'asc' }
          ],
          skip,
          take: limit
        }),
        prisma.moderationLog.count({
          where: {
            requiresReview: true,
            reviewedAt: null
          }
        })
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[ContentModeration] Error getting pending reviews:', error);
      throw error;
    }
  }

  /**
   * Review flagged content
   */
  async reviewContent(logId: string, moderatorId: string, action: 'APPROVE' | 'DELETE' | 'WARN', notes?: string) {
    try {
      const log = await prisma.moderationLog.update({
        where: { id: logId },
        data: {
          reviewedAt: new Date(),
          reviewedBy: moderatorId,
          reviewAction: action,
          reviewNotes: notes
        }
      });

      // Take action based on review
      if (action === 'WARN') {
        await notificationService.sendNotification(log.authorId, {
          title: 'Content Warning',
          body: 'Your content was flagged for review. Please follow community guidelines.',
          type: 'CONTENT_WARNING',
          data: {
            reasons: log.reasons.join(', '),
            notes: notes || ''
          }
        });
      }

      return log;
    } catch (error) {
      console.error('[ContentModeration] Error reviewing content:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment of text (for reviews, feedback, etc.)
   */
  async analyzeSentiment(text: string): Promise<{
    score: number;
    category: string;
    confidence: number;
  }> {
    try {
      if (!openai) {
        return this.basicSentimentAnalysis(text);
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following text. Respond with JSON: {score: <-1 to 1>, category: "POSITIVE"|"NEUTRAL"|"NEGATIVE", confidence: <0 to 1>}'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      const result = JSON.parse(response.choices[0].message.content || '{"score":0,"category":"NEUTRAL","confidence":0.5}');
      return result;
    } catch (error) {
      console.error('[ContentModeration] Sentiment analysis error:', error);
      return this.basicSentimentAnalysis(text);
    }
  }

  /**
   * Basic sentiment analysis fallback
   */
  private basicSentimentAnalysis(text: string): { score: number; category: string; confidence: number } {
    // Simple keyword-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.2;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    const category = score > 0.2 ? 'POSITIVE' : score < -0.2 ? 'NEGATIVE' : 'NEUTRAL';
    
    return {
      score,
      category,
      confidence: 0.6
    };
  }
}

export const contentModerationService = new ContentModerationService();
