/**
 * 🚨 OUTBREAK DETECTION SERVICE
 * 
 * This is a UNIQUE feature that sets MedThread apart from competitors.
 * Analyzes symptom patterns to detect and predict disease outbreaks in real-time.
 */

import { prisma } from '@medthread/database';

interface SymptomData {
  symptoms: string[];
  location: string;
  pincode?: string;
  city?: string;
  district?: string;
  state?: string;
  severity?: string;
  userId?: string;
}

interface OutbreakDetectionResult {
  isOutbreak: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCount: number;
  growthRate: number;
  predictedDisease?: string;
  confidence: number;
  alertMessage: string;
  actionItems: string[];
}

export class OutbreakDetectionService {
  
  /**
   * Analyze symptom clusters to detect potential outbreaks
   */
  async analyzeSymptomClusters(timeWindow: '7_DAYS' | '30_DAYS' = '7_DAYS'): Promise<void> {
    const daysAgo = timeWindow === '7_DAYS' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all symptom reports in the time window
    const symptomReports = await prisma.symptomReport.findMany({
      where: {
        reportedAt: {
          gte: startDate
        }
      },
      select: {
        symptoms: true,
        location: true,
        pincode: true,
        city: true,
        district: true,
        state: true,
        severity: true,
        reportedAt: true
      }
    });

    // Group by location and symptoms
    const clusters = this.groupSymptomsByLocation(symptomReports);

    // Analyze each cluster for outbreak patterns
    for (const [location, data] of Object.entries(clusters)) {
      await this.analyzeCluster(location, data, timeWindow);
    }
  }

  /**
   * Group symptoms by geographic location
   */
  private groupSymptomsByLocation(reports: any[]): Map<string, any[]> {
    const clusters = new Map<string, any[]>();

    for (const report of reports) {
      const location = report.city || report.district || report.state || 'Unknown';
      
      if (!clusters.has(location)) {
        clusters.set(location, []);
      }
      
      clusters.get(location)!.push(report);
    }

    return clusters;
  }

  /**
   * Analyze a specific cluster for outbreak patterns
   */
  private async analyzeCluster(location: string, reports: any[], timeWindow: string): Promise<void> {
    // Count symptom frequencies
    const symptomFrequency = new Map<string, number>();
    
    for (const report of reports) {
      const symptoms = Array.isArray(report.symptoms) ? report.symptoms : 
                      (typeof report.symptoms === 'object' ? Object.keys(report.symptoms) : []);
      
      for (const symptom of symptoms) {
        const normalizedSymptom = String(symptom).toLowerCase().trim();
        symptomFrequency.set(
          normalizedSymptom,
          (symptomFrequency.get(normalizedSymptom) || 0) + 1
        );
      }
    }

    // Find significant clusters (symptoms reported by multiple people)
    const significantSymptoms = Array.from(symptomFrequency.entries())
      .filter(([_, count]) => count >= 3) // At least 3 reports
      .sort((a, b) => b[1] - a[1]);

    if (significantSymptoms.length === 0) return;

    // Check for disease patterns
    const diseaseMatch = this.matchDiseasePattern(significantSymptoms.map(([s]) => s));
    
    // Calculate growth rate (compare with previous period)
    const growthRate = await this.calculateGrowthRate(location, timeWindow);

    // Determine severity
    const severity = this.determineSeverity(reports.length, growthRate, diseaseMatch.confidence);

    // Create or update symptom cluster
    await prisma.symptomCluster.upsert({
      where: {
        id: `${location}-${timeWindow}` // Composite key
      },
      create: {
        id: `${location}-${timeWindow}`,
        symptoms: Object.fromEntries(symptomFrequency),
        location,
        pincode: reports[0]?.pincode,
        city: reports[0]?.city,
        district: reports[0]?.district,
        state: reports[0]?.state,
        patientCount: reports.length,
        timeWindow,
        severity,
        predictedDisease: diseaseMatch.disease,
        confidence: diseaseMatch.confidence,
        growthRate
      },
      update: {
        symptoms: Object.fromEntries(symptomFrequency),
        patientCount: reports.length,
        severity,
        predictedDisease: diseaseMatch.disease,
        confidence: diseaseMatch.confidence,
        growthRate,
        updatedAt: new Date()
      }
    });

    // Create outbreak alert if severity is high
    if (severity === 'OUTBREAK' || severity === 'WARNING') {
      await this.createOutbreakAlert(location, reports, diseaseMatch, growthRate, severity);
    }
  }

  /**
   * Match symptom patterns to known diseases
   */
  private matchDiseasePattern(symptoms: string[]): { disease: string | null; confidence: number } {
    const diseasePatterns = {
      'Dengue': {
        symptoms: ['fever', 'headache', 'joint pain', 'muscle pain', 'rash', 'nausea'],
        minMatch: 3
      },
      'Malaria': {
        symptoms: ['fever', 'chills', 'sweating', 'headache', 'nausea', 'vomiting'],
        minMatch: 3
      },
      'COVID-19': {
        symptoms: ['fever', 'cough', 'fatigue', 'loss of taste', 'loss of smell', 'shortness of breath'],
        minMatch: 3
      },
      'Influenza': {
        symptoms: ['fever', 'cough', 'sore throat', 'body aches', 'fatigue', 'headache'],
        minMatch: 3
      },
      'Typhoid': {
        symptoms: ['fever', 'weakness', 'stomach pain', 'headache', 'loss of appetite'],
        minMatch: 3
      },
      'Cholera': {
        symptoms: ['diarrhea', 'vomiting', 'dehydration', 'muscle cramps'],
        minMatch: 2
      },
      'Chikungunya': {
        symptoms: ['fever', 'joint pain', 'muscle pain', 'headache', 'rash'],
        minMatch: 3
      }
    };

    let bestMatch = { disease: null as string | null, confidence: 0 };

    for (const [disease, pattern] of Object.entries(diseasePatterns)) {
      const matchCount = symptoms.filter(s => 
        pattern.symptoms.some(ps => s.includes(ps) || ps.includes(s))
      ).length;

      const confidence = matchCount / pattern.symptoms.length;

      if (matchCount >= pattern.minMatch && confidence > bestMatch.confidence) {
        bestMatch = { disease, confidence };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate growth rate compared to previous period
   */
  private async calculateGrowthRate(location: string, timeWindow: string): Promise<number> {
    const daysAgo = timeWindow === '7_DAYS' ? 7 : 30;
    
    // Current period
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - daysAgo);
    
    const currentCount = await prisma.symptomReport.count({
      where: {
        OR: [
          { city: location },
          { district: location },
          { state: location }
        ],
        reportedAt: { gte: currentStart }
      }
    });

    // Previous period
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - daysAgo);
    
    const previousCount = await prisma.symptomReport.count({
      where: {
        OR: [
          { city: location },
          { district: location },
          { state: location }
        ],
        reportedAt: {
          gte: previousStart,
          lt: currentStart
        }
      }
    });

    if (previousCount === 0) return currentCount > 0 ? 100 : 0;
    
    return ((currentCount - previousCount) / previousCount) * 100;
  }

  /**
   * Determine outbreak severity
   */
  private determineSeverity(
    patientCount: number,
    growthRate: number,
    confidence: number
  ): 'OUTBREAK' | 'WARNING' | 'NORMAL' {
    if (patientCount >= 20 && growthRate > 50 && confidence > 0.6) {
      return 'OUTBREAK';
    }
    if (patientCount >= 10 && growthRate > 30) {
      return 'WARNING';
    }
    return 'NORMAL';
  }

  /**
   * Create outbreak alert
   */
  private async createOutbreakAlert(
    location: string,
    reports: any[],
    diseaseMatch: { disease: string | null; confidence: number },
    growthRate: number,
    severity: string
  ): Promise<void> {
    const disease = diseaseMatch.disease || 'Unknown condition';
    const affectedCount = reports.length;

    const alertMessage = this.generateAlertMessage(disease, affectedCount, location, growthRate);
    const actionItems = this.generateActionItems(disease, severity);

    // Check if alert already exists
    const existingAlert = await prisma.outbreakAlert.findFirst({
      where: {
        disease,
        location,
        isActive: true
      }
    });

    if (existingAlert) {
      // Update existing alert
      await prisma.outbreakAlert.update({
        where: { id: existingAlert.id },
        data: {
          affectedCount,
          growthRate,
          severity,
          alertMessage,
          actionItems
        }
      });
    } else {
      // Create new alert
      await prisma.outbreakAlert.create({
        data: {
          disease,
          location,
          pincode: reports[0]?.pincode,
          city: reports[0]?.city,
          district: reports[0]?.district,
          state: reports[0]?.state,
          severity,
          affectedCount,
          growthRate,
          alertMessage,
          actionItems,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
    }
  }

  /**
   * Generate user-friendly alert message
   */
  private generateAlertMessage(
    disease: string,
    count: number,
    location: string,
    growthRate: number
  ): string {
    const trend = growthRate > 0 ? `↑ ${growthRate.toFixed(0)}%` : `↓ ${Math.abs(growthRate).toFixed(0)}%`;
    
    return `⚠️ ${disease} Alert: ${count} cases reported in ${location} (${trend} this week)`;
  }

  /**
   * Generate actionable recommendations
   */
  private generateActionItems(disease: string, severity: string): string[] {
    const commonActions = [
      'Monitor your symptoms closely',
      'Maintain good hygiene practices',
      'Stay hydrated',
      'Consult a doctor if symptoms worsen'
    ];

    const diseaseSpecificActions: Record<string, string[]> = {
      'Dengue': [
        'Use mosquito repellent',
        'Eliminate standing water around your home',
        'Wear long-sleeved clothing',
        'Seek immediate medical attention for severe symptoms'
      ],
      'COVID-19': [
        'Wear a mask in public places',
        'Practice social distancing',
        'Get tested if you have symptoms',
        'Isolate if you test positive'
      ],
      'Influenza': [
        'Get a flu vaccine if not already vaccinated',
        'Avoid close contact with sick people',
        'Cover your cough and sneeze',
        'Rest and stay home if sick'
      ],
      'Cholera': [
        'Drink only safe, treated water',
        'Wash hands frequently with soap',
        'Eat only thoroughly cooked food',
        'Seek immediate medical care for severe diarrhea'
      ]
    };

    const actions = diseaseSpecificActions[disease] || commonActions;

    if (severity === 'OUTBREAK' || severity === 'CRITICAL') {
      actions.unshift('⚠️ URGENT: Seek medical attention immediately if you have symptoms');
    }

    return actions;
  }

  /**
   * Get active outbreak alerts for a location
   */
  async getOutbreakAlertsForLocation(location: string): Promise<any[]> {
    return await prisma.outbreakAlert.findMany({
      where: {
        OR: [
          { city: location },
          { district: location },
          { state: location },
          { pincode: location }
        ],
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: [
        { severity: 'desc' },
        { affectedCount: 'desc' }
      ]
    });
  }

  /**
   * Get outbreak alerts for user based on their location
   */
  async getAlertsForUser(userId: string): Promise<any[]> {
    // Get user's location from their profile or recent posts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pincode: true }
    });

    if (!user?.pincode) {
      return [];
    }

    return await this.getOutbreakAlertsForLocation(user.pincode);
  }

  /**
   * Dismiss alert for a user
   */
  async dismissAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.outbreakAlert.findUnique({
      where: { id: alertId }
    });

    if (!alert) return;

    const dismissedBy = Array.isArray(alert.dismissedBy) ? alert.dismissedBy : [];
    
    if (!dismissedBy.includes(userId)) {
      dismissedBy.push(userId);
      
      await prisma.outbreakAlert.update({
        where: { id: alertId },
        data: { dismissedBy }
      });
    }
  }

  /**
   * Get symptom clusters for analytics dashboard
   */
  async getSymptomClusters(filters?: {
    location?: string;
    severity?: string;
    timeWindow?: string;
  }): Promise<any[]> {
    return await prisma.symptomCluster.findMany({
      where: {
        ...(filters?.location && {
          OR: [
            { city: filters.location },
            { district: filters.location },
            { state: filters.location }
          ]
        }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.timeWindow && { timeWindow: filters.timeWindow })
      },
      orderBy: [
        { severity: 'desc' },
        { patientCount: 'desc' }
      ],
      take: 50
    });
  }
}

export default new OutbreakDetectionService();
