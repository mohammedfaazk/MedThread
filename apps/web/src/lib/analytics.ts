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
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
