/**
 * Analytics tracking utilities for the frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SymptomReport {
  sessionId: string;
  symptoms: Array<{ name: string; severity: string }>;
  location?: {
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  age?: number;
  gender?: string;
  temperature?: number;
  duration?: string;
}

interface DoctorRating {
  doctorId: string;
  appointmentId?: string;
  threadId?: string;
  rating: number;
  helpfulness?: number;
  communication?: number;
  expertise?: number;
  feedback?: string;
}

export class AnalyticsTracker {
  private static sessionId: string;

  /**
   * Initialize session ID
   */
  static initSession() {
    if (typeof window === 'undefined') return;
    
    this.sessionId = localStorage.getItem('analytics_session_id') || this.generateSessionId();
    localStorage.setItem('analytics_session_id', this.sessionId);
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Track page view
   */
  static trackPageView(url: string) {
    if (typeof window === 'undefined') return;
    console.log('Page view tracked:', url);
  }

  /**
   * Track post view
   */
  static trackPostView(postId: string) {
    if (typeof window === 'undefined') return;
    console.log('Post view tracked:', postId);
  }

  /**
   * Track generic event
   */
  static trackEvent(eventName: string, category: string, data?: any) {
    if (typeof window === 'undefined') return;
    console.log('Event tracked:', { eventName, category, data });
  }

  /**
   * Track comment conversion (profile visit or message click)
   */
  static async trackCommentConversion(data: {
    commentId: string;
    doctorId: string;
    patientId: string;
    postId: string;
    action: 'profile_visit' | 'message_click';
  }, token?: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/enhanced-analytics/track-conversion`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to track comment conversion:', error);
      return null;
    }
  }

  /**
   * Track clinic visit (appointment booking)
   */
  static async trackClinicVisit(doctorId: string, patientId: string, token?: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/enhanced-analytics/track-clinic-visit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ doctorId, patientId })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to track clinic visit:', error);
      return null;
    }
  }

  /**
   * Track share action
   */
  static trackShare(type: string, id: string, method: string) {
    if (typeof window === 'undefined') return;
    console.log('Share tracked:', { type, id, method });
  }

  /**
   * Track symptom report
   */
  static async trackSymptomReport(data: Omit<SymptomReport, 'sessionId'>) {
    if (!this.sessionId) this.initSession();

    try {
      const response = await fetch(`${API_URL}/api/health-analytics/symptom-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sessionId: this.sessionId
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to track symptom report:', error);
      return null;
    }
  }

  /**
   * Rate a doctor
   */
  static async rateDoctor(data: DoctorRating, token: string) {
    try {
      const response = await fetch(`${API_URL}/api/doctor-analytics/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to rate doctor:', error);
      return null;
    }
  }

  /**
   * Get trending symptoms
   */
  static async getTrendingSymptoms(timeWindow: string = 'daily', limit: number = 10) {
    try {
      const response = await fetch(
        `${API_URL}/api/health-analytics/trending?timeWindow=${timeWindow}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get trending symptoms:', error);
      return null;
    }
  }

  /**
   * Get geographic health alerts
   */
  static async getGeographicAlerts(region?: string) {
    try {
      const url = region
        ? `${API_URL}/api/health-analytics/geographic-alerts?region=${region}`
        : `${API_URL}/api/health-analytics/geographic-alerts`;
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to get geographic alerts:', error);
      return null;
    }
  }

  /**
   * Get doctor leaderboard
   */
  static async getDoctorLeaderboard(sortBy: string = 'helpfulnessScore', limit: number = 10) {
    try {
      const response = await fetch(
        `${API_URL}/api/doctor-analytics/leaderboard?sortBy=${sortBy}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get doctor leaderboard:', error);
      return null;
    }
  }

  /**
   * Get doctor performance
   */
  static async getDoctorPerformance(doctorId: string) {
    try {
      const response = await fetch(
        `${API_URL}/api/doctor-analytics/performance/${doctorId}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get doctor performance:', error);
      return null;
    }
  }
}

// Initialize session on load
if (typeof window !== 'undefined') {
  AnalyticsTracker.initSession();
}

// Export as default and named export for compatibility
export const analytics = AnalyticsTracker;
export default AnalyticsTracker;
