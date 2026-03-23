import { EMERGENCY_KEYWORDS, EmergencyLevel, EmergencyDetectionResult } from '../constants/emergency-keywords';
import { prisma } from '@medthread/database';

export class EmergencyDetectionService {
  /**
   * Detect emergency keywords in content
   */
  detectEmergency(content: string): EmergencyDetectionResult {
    if (!content || content.trim().length === 0) {
      return { isEmergency: false, level: null, matchedKeywords: [], confidence: 0 };
    }

    const lowerContent = content.toLowerCase();
    
    // Check immediate danger keywords
    const immediateMatches = EMERGENCY_KEYWORDS.IMMEDIATE_DANGER
      .filter(keyword => lowerContent.includes(keyword.toLowerCase()));
    
    if (immediateMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'IMMEDIATE',
        matchedKeywords: immediateMatches,
        confidence: Math.min(immediateMatches.length * 0.3 + 0.7, 1.0)
      };
    }
    
    // Check mental health crisis keywords
    const mentalHealthMatches = EMERGENCY_KEYWORDS.MENTAL_HEALTH_CRISIS
      .filter(keyword => lowerContent.includes(keyword.toLowerCase()));
    
    if (mentalHealthMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'MENTAL_HEALTH',
        matchedKeywords: mentalHealthMatches,
        confidence: Math.min(mentalHealthMatches.length * 0.25 + 0.6, 1.0)
      };
    }
    
    // Check high urgency keywords
    const highUrgencyMatches = EMERGENCY_KEYWORDS.HIGH_URGENCY
      .filter(keyword => lowerContent.includes(keyword.toLowerCase()));
    
    if (highUrgencyMatches.length > 0) {
      return {
        isEmergency: true,
        level: 'HIGH',
        matchedKeywords: highUrgencyMatches,
        confidence: Math.min(highUrgencyMatches.length * 0.2 + 0.5, 1.0)
      };
    }
    
    return { isEmergency: false, level: null, matchedKeywords: [], confidence: 0 };
  }

  /**
   * Log emergency detection to audit trail
   */
  async logEmergencyDetection(params: {
    userId: string;
    contentType: 'POST' | 'COMMENT' | 'MESSAGE';
    contentId: string;
    level: EmergencyLevel;
    keywords: string[];
    confidence: number;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'EMERGENCY_DETECTED' as any,
          adminId: 'SYSTEM',
          targetType: params.contentType,
          targetId: params.contentId,
          details: {
            userId: params.userId,
            level: params.level,
            keywords: params.keywords,
            confidence: params.confidence,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to log emergency detection:', error);
    }
  }

  /**
   * Check if content should trigger emergency alert
   */
  shouldShowEmergencyAlert(result: EmergencyDetectionResult): boolean {
    return result.isEmergency && 
           (result.level === 'IMMEDIATE' || result.level === 'MENTAL_HEALTH') &&
           result.confidence >= 0.6;
  }
}

export const emergencyDetectionService = new EmergencyDetectionService();
