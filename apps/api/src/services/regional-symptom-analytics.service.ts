import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pincode to location mapping service
interface LocationData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
}

export class RegionalSymptomAnalyticsService {
  /**
   * Feature 4: Regional Symptom Analytics - Symptom Heatmap by Geography
   * Aggregate and display real-time regional health trends
   */

  /**
   * Resolve pincode to geographic hierarchy (city → district → state)
   */
  private async resolvePincodeToLocation(pincode: string): Promise<LocationData | null> {
    // This is a simplified mapping - in production, you'd use a proper pincode API
    const pincodeMap: Record<string, LocationData> = {
      '600094': { pincode: '600094', city: 'Chennai', district: 'Chennai District', state: 'Tamil Nadu', country: 'India' },
      '110001': { pincode: '110001', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India' },
      '400001': { pincode: '400001', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India' },
      '560001': { pincode: '560001', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', country: 'India' },
      '700001': { pincode: '700001', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
      '500001': { pincode: '500001', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India' },
      '411001': { pincode: '411001', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India' },
      '380001': { pincode: '380001', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      '302001': { pincode: '302001', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', country: 'India' },
      '226001': { pincode: '226001', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', country: 'India' }
    };

    return pincodeMap[pincode] || null;
  }

  /**
   * Extract symptoms from post content using keyword matching
   */
  private extractSymptomsFromPost(title: string, content: string): string[] {
    const combinedText = `${title} ${content}`.toLowerCase();
    
    const symptomKeywords = [
      'cold', 'fever', 'fatigue', 'cough', 'rash', 'nausea', 'chest pain', 
      'headache', 'dizziness', 'sore throat', 'body ache', 'joint pain',
      'back pain', 'stomach pain', 'diarrhea', 'constipation', 'vomiting',
      'shortness of breath', 'difficulty breathing', 'high fever', 'severe headache',
      'abdominal pain', 'muscle pain', 'skin problems', 'eye pain', 'ear pain',
      'swelling', 'bruising', 'weight loss', 'weight gain', 'insomnia',
      'anxiety', 'depression', 'memory problems', 'concentration issues'
    ];

    const detectedSymptoms = symptomKeywords.filter(symptom => 
      combinedText.includes(symptom)
    );

    return detectedSymptoms;
  }

  /**
   * Collect and store symptom reports from patient posts
   */
  async collectSymptomReports() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent posts from patients
    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        author: { role: 'PATIENT' }
      },
      include: {
        author: {
          select: { 
            id: true, 
            pincode: true,
            patientHealthProfile: {
              select: { age: true, gender: true }
            }
          }
        }
      }
    });

    const reports = [];

    for (const post of posts) {
      const symptoms = this.extractSymptomsFromPost(post.title, post.content || '');
      
      if (symptoms.length > 0 && post.author.pincode) {
        const location = await this.resolvePincodeToLocation(post.author.pincode);
        
        if (location) {
          // Create symptom report
          const report = await prisma.symptomReport.create({
            data: {
              userId: post.author.id,
              postId: post.id,
              symptoms: symptoms,
              detectedSymptoms: symptoms.map(s => ({ symptom: s, confidence: 0.8 })),
              location: location,
              pincode: location.pincode,
              city: location.city,
              district: location.district,
              state: location.state,
              country: location.country,
              age: post.author.patientHealthProfile?.age,
              gender: post.author.patientHealthProfile?.gender,
              severity: this.calculateSeverity(symptoms),
              reportedAt: post.createdAt
            }
          });

          reports.push(report);
        }
      }
    }

    return {
      collected: reports.length,
      period: 'Last 30 days',
      reports: reports.slice(0, 10) // Return sample
    };
  }

  /**
   * Calculate symptom severity based on detected symptoms
   */
  private calculateSeverity(symptoms: string[]): string {
    const highSeveritySymptoms = [
      'chest pain', 'difficulty breathing', 'shortness of breath', 
      'severe headache', 'high fever', 'severe pain'
    ];
    
    const mediumSeveritySymptoms = [
      'fever', 'persistent cough', 'fatigue', 'body ache', 'joint pain'
    ];

    const hasHighSeverity = symptoms.some(s => 
      highSeveritySymptoms.some(hs => s.includes(hs))
    );
    
    const hasMediumSeverity = symptoms.some(s => 
      mediumSeveritySymptoms.some(ms => s.includes(ms))
    );

    if (hasHighSeverity) return 'HIGH';
    if (hasMediumSeverity) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Get regional symptom heatmap data with filtering
   */
  async getRegionalSymptomHeatmap(options: {
    locationLevel: 'city' | 'district' | 'state';
    symptomFilter?: string;
    timeWindow?: 'week' | 'month' | 'quarter';
    severityFilter?: 'HIGH' | 'MEDIUM' | 'LOW';
  }) {
    const { locationLevel, symptomFilter, timeWindow = 'month', severityFilter } = options;

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      week: 7,
      month: 30,
      quarter: 90
    };
    const daysBack = timeRanges[timeWindow];
    const since = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Build where clause
    const where: any = {
      reportedAt: { gte: since }
    };

    if (symptomFilter) {
      where.symptoms = { has: symptomFilter };
    }

    if (severityFilter) {
      where.severity = severityFilter;
    }

    // Get symptom reports
    const reports = await prisma.symptomReport.findMany({
      where,
      select: {
        symptoms: true,
        pincode: true,
        city: true,
        district: true,
        state: true,
        severity: true,
        reportedAt: true
      }
    });

    // Group by location level
    const locationGroups: Record<string, {
      location: string,
      count: number,
      symptoms: Record<string, number>,
      severity: Record<string, number>,
      pincodes: Set<string>
    }> = {};

    reports.forEach(report => {
      const locationKey = report[locationLevel] || 'Unknown';
      
      if (!locationGroups[locationKey]) {
        locationGroups[locationKey] = {
          location: locationKey,
          count: 0,
          symptoms: {},
          severity: { HIGH: 0, MEDIUM: 0, LOW: 0 },
          pincodes: new Set()
        };
      }

      const group = locationGroups[locationKey];
      group.count++;
      group.severity[report.severity as keyof typeof group.severity]++;
      if (report.pincode) group.pincodes.add(report.pincode);

      // Count symptoms
      (report.symptoms as string[]).forEach(symptom => {
        group.symptoms[symptom] = (group.symptoms[symptom] || 0) + 1;
      });
    });

    // Format for heatmap
    const heatmapData = Object.values(locationGroups)
      .map(group => ({
        location: group.location,
        totalReports: group.count,
        pincodeCount: group.pincodes.size,
        topSymptoms: Object.entries(group.symptoms)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([symptom, count]) => ({ symptom, count })),
        severityDistribution: group.severity,
        alertLevel: this.calculateAlertLevel(group.count, group.severity),
        coordinates: this.getLocationCoordinates(group.location) // Mock coordinates
      }))
      .sort((a, b) => b.totalReports - a.totalReports);

    return {
      timeWindow,
      locationLevel,
      symptomFilter,
      severityFilter,
      period: `Last ${daysBack} days`,
      totalReports: reports.length,
      heatmapData,
      summary: {
        totalLocations: heatmapData.length,
        topLocation: heatmapData[0]?.location || 'None',
        totalSymptoms: new Set(reports.flatMap(r => r.symptoms as string[])).size
      }
    };
  }
  /**
   * Calculate alert level based on report count and severity
   */
  private calculateAlertLevel(count: number, severity: Record<string, number>): string {
    const highSeverityRatio = severity.HIGH / count;
    
    if (count >= 50 && highSeverityRatio >= 0.3) return 'CRITICAL';
    if (count >= 20 && highSeverityRatio >= 0.2) return 'HIGH';
    if (count >= 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Mock coordinates for locations (in production, use proper geocoding)
   */
  private getLocationCoordinates(location: string): { lat: number, lng: number } {
    const coordinates: Record<string, { lat: number, lng: number }> = {
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'New Delhi': { lat: 28.6139, lng: 77.2090 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
      'Maharashtra': { lat: 19.7515, lng: 75.7139 },
      'Karnataka': { lat: 15.3173, lng: 75.7139 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'West Bengal': { lat: 22.9868, lng: 87.8550 }
    };

    return coordinates[location] || { lat: 20.5937, lng: 78.9629 }; // Default to India center
  }

  /**
   * Get trending symptoms across regions
   */
  async getTrendingSymptoms(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reports = await prisma.symptomReport.findMany({
      where: { reportedAt: { gte: since } },
      select: {
        symptoms: true,
        city: true,
        state: true,
        severity: true
      }
    });

    // Aggregate symptoms
    const symptomStats: Record<string, {
      count: number,
      regions: Set<string>,
      states: Set<string>,
      severity: Record<string, number>
    }> = {};

    reports.forEach(report => {
      (report.symptoms as string[]).forEach(symptom => {
        if (!symptomStats[symptom]) {
          symptomStats[symptom] = {
            count: 0,
            regions: new Set(),
            states: new Set(),
            severity: { HIGH: 0, MEDIUM: 0, LOW: 0 }
          };
        }

        const stats = symptomStats[symptom];
        stats.count++;
        if (report.city) stats.regions.add(report.city);
        if (report.state) stats.states.add(report.state);
        stats.severity[report.severity as keyof typeof stats.severity]++;
      });
    });

    // Format trending symptoms
    const trending = Object.entries(symptomStats)
      .map(([symptom, stats]) => ({
        symptom,
        totalReports: stats.count,
        affectedCities: stats.regions.size,
        affectedStates: stats.states.size,
        severityBreakdown: stats.severity,
        trendDirection: 'stable', // Could calculate based on historical data
        alertLevel: this.calculateAlertLevel(stats.count, stats.severity)
      }))
      .sort((a, b) => b.totalReports - a.totalReports)
      .slice(0, 15);

    return {
      period: `Last ${days} days`,
      totalReports: reports.length,
      uniqueSymptoms: Object.keys(symptomStats).length,
      trending
    };
  }

  /**
   * Get symptom reports for specific location
   */
  async getLocationSymptomDetails(location: string, locationLevel: 'city' | 'district' | 'state') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where: any = {
      reportedAt: { gte: thirtyDaysAgo }
    };
    where[locationLevel] = location;

    const reports = await prisma.symptomReport.findMany({
      where,
      include: {
        user: {
          select: { username: true, patientHealthProfile: true }
        }
      },
      orderBy: { reportedAt: 'desc' },
      take: 50
    });

    // Aggregate data
    const symptomCounts: Record<string, number> = {};
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const ageGroups: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};

    reports.forEach(report => {
      // Count symptoms
      (report.symptoms as string[]).forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });

      // Count severity
      severityCounts[report.severity as keyof typeof severityCounts]++;

      // Demographics
      if (report.age) {
        const ageGroup = this.getAgeGroup(report.age);
        ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
      }

      if (report.gender) {
        genderCounts[report.gender] = (genderCounts[report.gender] || 0) + 1;
      }
    });

    return {
      location,
      locationLevel,
      period: 'Last 30 days',
      totalReports: reports.length,
      topSymptoms: Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([symptom, count]) => ({ symptom, count })),
      severityDistribution: severityCounts,
      demographics: {
        ageGroups,
        genderDistribution: genderCounts
      },
      recentReports: reports.slice(0, 10).map(report => ({
        id: report.id,
        symptoms: report.symptoms,
        severity: report.severity,
        reportedAt: report.reportedAt,
        age: report.age,
        gender: report.gender
      }))
    };
  }

  /**
   * Get age group classification
   */
  private getAgeGroup(age: number): string {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 45) return '30-44';
    if (age < 60) return '45-59';
    return '60+';
  }

  /**
   * Generate health alerts for regions with concerning trends
   */
  async generateRegionalHealthAlerts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent high-severity reports grouped by state
    const reports = await prisma.symptomReport.findMany({
      where: {
        reportedAt: { gte: sevenDaysAgo },
        severity: { in: ['HIGH', 'MEDIUM'] }
      },
      select: {
        state: true,
        city: true,
        symptoms: true,
        severity: true
      }
    });

    // Group by state
    const stateAlerts: Record<string, {
      state: string,
      totalReports: number,
      highSeverityCount: number,
      topSymptoms: Record<string, number>,
      affectedCities: Set<string>
    }> = {};

    reports.forEach(report => {
      if (!report.state) return;

      if (!stateAlerts[report.state]) {
        stateAlerts[report.state] = {
          state: report.state,
          totalReports: 0,
          highSeverityCount: 0,
          topSymptoms: {},
          affectedCities: new Set()
        };
      }

      const alert = stateAlerts[report.state];
      alert.totalReports++;
      if (report.severity === 'HIGH') alert.highSeverityCount++;
      if (report.city) alert.affectedCities.add(report.city);

      (report.symptoms as string[]).forEach(symptom => {
        alert.topSymptoms[symptom] = (alert.topSymptoms[symptom] || 0) + 1;
      });
    });

    // Generate alerts for states with concerning trends
    const alerts = Object.values(stateAlerts)
      .filter(alert => alert.totalReports >= 5 || alert.highSeverityCount >= 2)
      .map(alert => ({
        state: alert.state,
        alertLevel: alert.highSeverityCount >= 5 ? 'CRITICAL' : 
                   alert.highSeverityCount >= 2 ? 'HIGH' : 'MEDIUM',
        totalReports: alert.totalReports,
        highSeverityCount: alert.highSeverityCount,
        affectedCities: alert.affectedCities.size,
        topSymptoms: Object.entries(alert.topSymptoms)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([symptom, count]) => ({ symptom, count })),
        message: this.generateAlertMessage(alert)
      }))
      .sort((a, b) => b.totalReports - a.totalReports);

    return {
      period: 'Last 7 days',
      totalAlerts: alerts.length,
      alerts
    };
  }

  /**
   * Generate alert message based on data
   */
  private generateAlertMessage(alert: any): string {
    const topSymptom = Object.entries(alert.topSymptoms)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (topSymptom) {
      return `${alert.totalReports} patients in ${alert.state} have reported ${topSymptom[0]} symptoms this week`;
    }

    return `${alert.totalReports} health reports from ${alert.state} this week`;
  }
}

export const regionalSymptomAnalyticsService = new RegionalSymptomAnalyticsService();