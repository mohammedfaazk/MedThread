import { prisma } from '@medthread/database';

// Pincode to location mapping service
interface LocationData {
  pincode: string;
  area: string;   // locality / neighbourhood
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
    const pincodeMap: Record<string, LocationData> = {
      // Tamil Nadu — Chennai
      '600001': { pincode: '600001', area: 'Parrys', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600002': { pincode: '600002', area: 'Sowcarpet', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600003': { pincode: '600003', area: 'Triplicane', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600010': { pincode: '600010', area: 'Kilpauk', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600017': { pincode: '600017', area: 'Nungambakkam', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600020': { pincode: '600020', area: 'Adyar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600094': { pincode: '600094', area: 'Choolaimedu', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600095': { pincode: '600095', area: 'Anna Nagar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600096': { pincode: '600096', area: 'Mogappair', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600040': { pincode: '600040', area: 'T. Nagar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600042': { pincode: '600042', area: 'Velachery', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600100': { pincode: '600100', area: 'Porur', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      // Delhi
      '110001': { pincode: '110001', area: 'Connaught Place', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India' },
      '110005': { pincode: '110005', area: 'Karol Bagh', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi', country: 'India' },
      '110019': { pincode: '110019', area: 'Kalkaji', city: 'New Delhi', district: 'South Delhi', state: 'Delhi', country: 'India' },
      // Mumbai
      '400001': { pincode: '400001', area: 'Fort', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India' },
      '400050': { pincode: '400050', area: 'Bandra', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
      '400069': { pincode: '400069', area: 'Andheri', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', country: 'India' },
      // Bangalore
      '560001': { pincode: '560001', area: 'MG Road', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', country: 'India' },
      '560034': { pincode: '560034', area: 'Koramangala', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', country: 'India' },
      '560037': { pincode: '560037', area: 'Indiranagar', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', country: 'India' },
      // Kolkata
      '700001': { pincode: '700001', area: 'BBD Bagh', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
      '700019': { pincode: '700019', area: 'Ballygunge', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India' },
      // Hyderabad
      '500001': { pincode: '500001', area: 'Abids', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India' },
      '500034': { pincode: '500034', area: 'Banjara Hills', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India' },
      // Pune
      '411001': { pincode: '411001', area: 'Shivajinagar', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India' },
      '411004': { pincode: '411004', area: 'Kothrud', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India' },
      // Ahmedabad
      '380001': { pincode: '380001', area: 'Lal Darwaja', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      // Jaipur
      '302001': { pincode: '302001', area: 'Badi Chaupar', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', country: 'India' },
      // Lucknow
      '226001': { pincode: '226001', area: 'Hazratganj', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },

      // Tamil Nadu — Chennai (extended)
      '600006': { pincode: '600006', area: 'Egmore', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600007': { pincode: '600007', area: 'Park Town', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600008': { pincode: '600008', area: 'Vepery', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600011': { pincode: '600011', area: 'Chetpet', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600014': { pincode: '600014', area: 'Mylapore', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600015': { pincode: '600015', area: 'Mandaveli', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600018': { pincode: '600018', area: 'Kodambakkam', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600024': { pincode: '600024', area: 'Guindy', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600025': { pincode: '600025', area: 'Saidapet', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600026': { pincode: '600026', area: 'Sholinganallur', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600028': { pincode: '600028', area: 'Perungudi', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600041': { pincode: '600041', area: 'Pallikaranai', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600045': { pincode: '600045', area: 'Medavakkam', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600097': { pincode: '600097', area: 'Ambattur', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600099': { pincode: '600099', area: 'Avadi', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600119': { pincode: '600119', area: 'Perumbakkam', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      '600130': { pincode: '600130', area: 'Siruseri', city: 'Chennai', district: 'Kanchipuram', state: 'Tamil Nadu', country: 'India' },
    };

    if (pincodeMap[pincode]) return pincodeMap[pincode];

    // Prefix-based fallback — derive state/city from first 3 digits
    return this.fallbackFromPrefix(pincode);
  }

  /**
   * Derive a partial location from pincode prefix when exact match is missing.
   * Indian pincode zones: 1xx=Delhi/HP/UP, 2xx=UP/Uttarakhand, 3xx=Rajasthan/Gujarat,
   * 4xx=Maharashtra/MP/CG, 5xx=AP/Telangana/Karnataka, 6xx=Tamil Nadu/Kerala,
   * 7xx=West Bengal/Odisha/NE, 8xx=Odisha/Bihar/Jharkhand, 9xx=Army PO
   */
  private fallbackFromPrefix(pincode: string): LocationData | null {
    if (!/^\d{6}$/.test(pincode)) return null;

    const first = pincode[0];
    const first3 = pincode.slice(0, 3);

    // Fine-grained 3-digit prefix overrides
    const prefix3Map: Record<string, { city: string; district: string; state: string }> = {
      '600': { city: 'Chennai',   district: 'Chennai',   state: 'Tamil Nadu' },
      '601': { city: 'Chennai',   district: 'Kanchipuram', state: 'Tamil Nadu' },
      '602': { city: 'Chennai',   district: 'Tiruvallur', state: 'Tamil Nadu' },
      '603': { city: 'Chennai',   district: 'Kanchipuram', state: 'Tamil Nadu' },
      '604': { city: 'Villupuram', district: 'Villupuram', state: 'Tamil Nadu' },
      '605': { city: 'Puducherry', district: 'Puducherry', state: 'Puducherry' },
      '606': { city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu' },
      '607': { city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu' },
      '608': { city: 'Cuddalore', district: 'Cuddalore', state: 'Tamil Nadu' },
      '609': { city: 'Nagapattinam', district: 'Nagapattinam', state: 'Tamil Nadu' },
      '610': { city: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu' },
      '620': { city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu' },
      '625': { city: 'Madurai',   district: 'Madurai',   state: 'Tamil Nadu' },
      '641': { city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu' },
      '682': { city: 'Kochi',     district: 'Ernakulam', state: 'Kerala' },
      '695': { city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala' },
      '110': { city: 'New Delhi', district: 'Central Delhi', state: 'Delhi' },
      '400': { city: 'Mumbai',    district: 'Mumbai City', state: 'Maharashtra' },
      '411': { city: 'Pune',      district: 'Pune',      state: 'Maharashtra' },
      '560': { city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka' },
      '500': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' },
      '700': { city: 'Kolkata',   district: 'Kolkata',   state: 'West Bengal' },
      '380': { city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat' },
      '302': { city: 'Jaipur',    district: 'Jaipur',    state: 'Rajasthan' },
      '226': { city: 'Lucknow',   district: 'Lucknow',   state: 'Uttar Pradesh' },
    };

    // Broad 1-digit zone fallback
    const zone1Map: Record<string, { state: string; city: string }> = {
      '1': { state: 'Delhi / Uttar Pradesh', city: 'Unknown' },
      '2': { state: 'Uttar Pradesh',         city: 'Unknown' },
      '3': { state: 'Rajasthan / Gujarat',   city: 'Unknown' },
      '4': { state: 'Maharashtra',           city: 'Unknown' },
      '5': { state: 'Andhra Pradesh / Karnataka', city: 'Unknown' },
      '6': { state: 'Tamil Nadu / Kerala',   city: 'Unknown' },
      '7': { state: 'West Bengal',           city: 'Unknown' },
      '8': { state: 'Bihar / Odisha',        city: 'Unknown' },
    };

    if (prefix3Map[first3]) {
      const p = prefix3Map[first3];
      return {
        pincode,
        area: `Area ${pincode}`,
        city: p.city,
        district: p.district,
        state: p.state,
        country: 'India',
      };
    }

    if (zone1Map[first]) {
      const z = zone1Map[first];
      return {
        pincode,
        area: `Area ${pincode}`,
        city: z.city,
        district: 'Unknown',
        state: z.state,
        country: 'India',
      };
    }

    return null;
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
   * Get symptom heatmap scoped to a user's pincode geography
   * Supports: area | city | district | state | country
   */
  async getSymptomsByPincode(pincode: string, scope: 'area' | 'city' | 'district' | 'state' | 'country', timeWindow: 'week' | 'month' | 'quarter' = 'month') {
    const location = await this.resolvePincodeToLocation(pincode);
    if (!location) {
      return { success: false, error: 'Pincode not found in our database', location: null, symptoms: [], totalReports: 0 };
    }

    const daysBack = { week: 7, month: 30, quarter: 90 }[timeWindow];
    const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Build filter based on scope
    const where: any = { reportedAt: { gte: since } };
    if (scope === 'area') where.pincode = pincode;
    else if (scope === 'city') where.city = location.city;
    else if (scope === 'district') where.district = location.district;
    else if (scope === 'state') where.state = location.state;
    else if (scope === 'country') where.country = location.country;

    const reports = await prisma.symptomReport.findMany({
      where,
      select: { symptoms: true, severity: true, city: true, district: true, state: true, pincode: true }
    });

    // Aggregate symptom frequencies
    const symptomCounts: Record<string, { count: number; high: number; medium: number; low: number }> = {};
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    reports.forEach(report => {
      severityCounts[report.severity as keyof typeof severityCounts]++;
      (report.symptoms as string[]).forEach(symptom => {
        if (!symptomCounts[symptom]) symptomCounts[symptom] = { count: 0, high: 0, medium: 0, low: 0 };
        symptomCounts[symptom].count++;
        if (report.severity === 'HIGH') symptomCounts[symptom].high++;
        else if (report.severity === 'MEDIUM') symptomCounts[symptom].medium++;
        else symptomCounts[symptom].low++;
      });
    });

    const symptoms = Object.entries(symptomCounts)
      .map(([symptom, stats]) => ({
        symptom,
        count: stats.count,
        severity: { high: stats.high, medium: stats.medium, low: stats.low },
        // Heatmap intensity 0–100
        intensity: Math.min(100, Math.round((stats.count / Math.max(reports.length, 1)) * 100 + (stats.high * 10)))
      }))
      .sort((a, b) => b.count - a.count);

    return {
      success: true,
      location: {
        pincode,
        area: location.area,
        city: location.city,
        district: location.district,
        state: location.state,
        country: location.country,
        scopeLabel: scope === 'area' ? location.area
          : scope === 'city' ? location.city
          : scope === 'district' ? location.district
          : scope === 'state' ? location.state
          : location.country
      },
      scope,
      period: `Last ${daysBack} days`,
      totalReports: reports.length,
      severityDistribution: severityCounts,
      symptoms,
    };
  }

  /**
   * Resolve a pincode to its full geographic hierarchy (for display)
   */
  async resolveLocation(pincode: string) {
    const loc = await this.resolvePincodeToLocation(pincode);
    return loc;
  }

  /**
   * Create a SymptomReport directly from a patient post using explicitly selected symptom chips.
   * Called immediately after post creation — no keyword scanning needed.
   */
  async collectFromPatientPost(postId: string, userId: string, symptoms: string[], duration?: string) {
    if (!symptoms || symptoms.length === 0) return null;

    // Get user's pincode
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        pincode: true,
        patientHealthProfile: { select: { ageGroup: true, biologicalSex: true } }
      }
    });

    if (!user?.pincode) return null;

    const location = await this.resolvePincodeToLocation(user.pincode);
    if (!location) return null;

    const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
    const severity = this.calculateSeverity(normalizedSymptoms);

    // Parse ageGroup string into a representative integer (midpoint of range)
    const ageGroupToInt: Record<string, number> = {
      '18-25': 21, '26-35': 30, '36-45': 40, '46-60': 53, '60+': 65
    };
    const ageInt = user.patientHealthProfile?.ageGroup
      ? (ageGroupToInt[user.patientHealthProfile.ageGroup] ?? null)
      : null;

    // Upsert — one report per post (avoid duplicates on retry)
    const existing = await prisma.symptomReport.findFirst({ where: { postId } });
    if (existing) {
      return prisma.symptomReport.update({
        where: { id: existing.id },
        data: {
          symptoms: normalizedSymptoms,
          detectedSymptoms: normalizedSymptoms.map(s => ({ symptom: s, confidence: 1.0, source: 'chip' })),
          severity,
          duration,
        }
      });
    }

    return prisma.symptomReport.create({
      data: {
        userId,
        postId,
        symptoms: normalizedSymptoms,
        detectedSymptoms: normalizedSymptoms.map(s => ({ symptom: s, confidence: 1.0, source: 'chip' })),
        location,
        pincode: location.pincode,
        city: location.city,
        district: location.district,
        state: location.state,
        country: location.country,
        age: ageInt,
        gender: user.patientHealthProfile?.biologicalSex ?? null,
        severity,
        duration,
        reportedAt: new Date(),
      }
    });
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