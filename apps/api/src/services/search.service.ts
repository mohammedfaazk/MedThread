import { prisma } from '@medthread/database';
import { cacheService } from './cache.service';

export class SearchService {
  /**
   * Search doctors by specialty, location, availability with advanced filters
   */
  async searchDoctors(params: {
    query?: string;
    specialty?: string;
    subSpecialty?: string;
    location?: string;
    pincode?: string;
    availability?: 'available' | 'all';
    sortBy?: 'relevance' | 'rating' | 'experience' | 'responseTime';
    minExperience?: number;
    maxExperience?: number;
    minRating?: number;
    languages?: string[];
    consultationFee?: { min?: number; max?: number };
    limit?: number;
    offset?: number;
  }) {
    // Cache key based on search params
    const cacheKey = `search:doctors:${JSON.stringify(params)}`;
    
    return cacheService.cacheQuery(cacheKey, async () => {
      return this.performDoctorSearch(params);
    }, 2 * 60 * 1000); // 2 minutes cache
  }

  private async performDoctorSearch(params: {
    query?: string;
    specialty?: string;
    subSpecialty?: string;
    location?: string;
    pincode?: string;
    availability?: 'available' | 'all';
    sortBy?: 'relevance' | 'rating' | 'experience' | 'responseTime';
    minExperience?: number;
    maxExperience?: number;
    minRating?: number;
    languages?: string[];
    consultationFee?: { min?: number; max?: number };
    limit?: number;
    offset?: number;
  }) {
    const {
      query,
      specialty,
      subSpecialty,
      location,
      pincode,
      availability = 'all',
      sortBy = 'relevance',
      minExperience,
      maxExperience,
      minRating,
      languages,
      consultationFee,
      limit = 20,
      offset = 0
    } = params;

    const where: any = {
      role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
      doctorVerificationStatus: 'APPROVED',
      isSuspended: false
    };

    // Text search in username, bio, specialty
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { specialty: { contains: query, mode: 'insensitive' } },
        { subSpecialty: { contains: query, mode: 'insensitive' } },
        { hospitalAffiliation: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Filter by specialty
    if (specialty) {
      where.specialty = specialty;
    }

    if (subSpecialty) {
      where.subSpecialty = { contains: subSpecialty, mode: 'insensitive' };
    }

    // Experience filters
    if (minExperience !== undefined || maxExperience !== undefined) {
      where.yearsOfExperience = {};
      if (minExperience !== undefined) where.yearsOfExperience.gte = minExperience;
      if (maxExperience !== undefined) where.yearsOfExperience.lte = maxExperience;
    }

    // Rating filter
    if (minRating !== undefined) {
      where.totalKarma = { gte: minRating * 100 }; // Assuming karma correlates with rating
    }

    // Location filters
    if (pincode) {
      where.pincode = pincode;
    } else if (location) {
      where.OR = [
        { clinicAddress: { contains: location, mode: 'insensitive' } },
        { hospitalAffiliation: { contains: location, mode: 'insensitive' } },
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } }
      ];
    }

    // Languages filter
    if (languages && languages.length > 0) {
      where.languages = {
        hasSome: languages
      };
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'experience':
        orderBy = { yearsOfExperience: 'desc' };
        break;
      case 'rating':
        orderBy = { totalKarma: 'desc' };
        break;
      case 'responseTime':
        orderBy = { 
          doctorActivityMetrics: {
            avgReplyTimeHours: 'asc'
          }
        };
        break;
      default:
        orderBy = [
          { totalKarma: 'desc' },
          { yearsOfExperience: 'desc' }
        ];
    }

    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        specialty: true,
        subSpecialty: true,
        yearsOfExperience: true,
        hospitalAffiliation: true,
        clinicAddress: true,
        pincode: true,
        city: true,
        state: true,
        totalKarma: true,
        verified: true,
        doctorVerificationStatus: true,
        languages: true,
        consultationFee: true,
        doctorActivityMetrics: {
          select: {
            avgReplyTimeHours: true,
            totalPatientsAcquired: true,
            lastActiveAt: true
          }
        },
        doctorPerformance: {
          select: {
            helpfulnessScore: true,
            portfolioScore: true,
            curedPatientCount: true
          }
        },
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    // Get total count
    const total = await prisma.user.count({ where });

    // Calculate relevance scores
    const doctorsWithScores = doctors.map(doctor => ({
      ...doctor,
      relevanceScore: this.calculateRelevanceScore(doctor, query),
      averageRating: this.calculateAverageRating(doctor),
      responseTimeHours: doctor.doctorActivityMetrics?.avgReplyTimeHours || 24,
    }));

    return {
      doctors: doctorsWithScores,
      total,
      hasMore: offset + doctors.length < total,
      filters: {
        specialties: await this.getAvailableSpecialties(),
        locations: await this.getAvailableLocations(),
        languages: await this.getAvailableLanguages(),
      }
    };
  }

  /**
   * Advanced post search with filters
   */
  async searchPosts(params: {
    query: string;
    communityId?: string;
    authorRole?: 'DOCTOR' | 'PATIENT' | 'all';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    dateFrom?: Date;
    dateTo?: Date;
    symptoms?: string[];
    medicalAccuracy?: number;
    sortBy?: 'relevance' | 'date' | 'score' | 'accuracy';
    limit?: number;
    offset?: number;
  }) {
    const {
      query,
      communityId,
      authorRole,
      priority,
      dateFrom,
      dateTo,
      symptoms,
      medicalAccuracy,
      sortBy = 'relevance',
      limit = 20,
      offset = 0
    } = params;

    const where: any = {
      isDraft: false,
      isRemoved: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (communityId) {
      where.communityId = communityId;
    }

    if (authorRole && authorRole !== 'all') {
      where.author = {
        role: authorRole
      };
    }

    if (priority) {
      where.priority = {
        priorityLevel: priority
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Symptom filter
    if (symptoms && symptoms.length > 0) {
      where.symptomReports = {
        some: {
          symptoms: {
            path: '$[*].symptom',
            array_contains: symptoms
          }
        }
      };
    }

    // Medical accuracy filter
    if (medicalAccuracy !== undefined) {
      where.medicalVerification = {
        some: {
          confidenceScore: { gte: medicalAccuracy }
        }
      };
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'date':
        orderBy = { createdAt: 'desc' };
        break;
      case 'score':
        orderBy = { score: 'desc' };
        break;
      case 'accuracy':
        orderBy = {
          medicalVerification: {
            _count: 'desc'
          }
        };
        break;
      default:
        orderBy = [
          { score: 'desc' },
          { createdAt: 'desc' }
        ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
            specialty: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true
          }
        },
        priority: true,
        medicalVerification: {
          select: {
            confidenceScore: true,
            isAccurate: true
          },
          orderBy: { verifiedAt: 'desc' },
          take: 1
        },
        symptomReports: {
          select: {
            symptoms: true
          },
          take: 1
        },
        _count: {
          select: {
            comments: true,
            votes: true,
            endorsements: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    const total = await prisma.post.count({ where });

    // Add search relevance scores
    const postsWithScores = posts.map(post => ({
      ...post,
      relevanceScore: this.calculatePostRelevanceScore(post, query),
      medicalAccuracyScore: post.medicalVerification[0]?.confidenceScore || 0,
      isVerified: post.medicalVerification[0]?.isAccurate || false,
    }));

    return {
      posts: postsWithScores,
      total,
      hasMore: offset + posts.length < total
    };
  }

  /**
   * Enhanced symptom search with medical database
   */
  async searchSymptoms(query: string, options: {
    includeRelated?: boolean;
    includeTreatments?: boolean;
    severity?: 'mild' | 'moderate' | 'severe';
  } = {}) {
    const { includeRelated = true, includeTreatments = false, severity } = options;

    // Enhanced symptoms database with medical information
    const medicalSymptoms = [
      { 
        symptom: 'fever', 
        category: 'general', 
        severity: ['mild', 'moderate', 'severe'],
        relatedSymptoms: ['chills', 'sweating', 'headache'],
        commonCauses: ['infection', 'inflammation', 'medication'],
        urgency: 'moderate'
      },
      { 
        symptom: 'chest pain', 
        category: 'cardiovascular', 
        severity: ['moderate', 'severe'],
        relatedSymptoms: ['shortness of breath', 'dizziness', 'nausea'],
        commonCauses: ['heart attack', 'angina', 'muscle strain'],
        urgency: 'high'
      },
      { 
        symptom: 'headache', 
        category: 'neurological', 
        severity: ['mild', 'moderate', 'severe'],
        relatedSymptoms: ['nausea', 'sensitivity to light', 'dizziness'],
        commonCauses: ['tension', 'migraine', 'dehydration'],
        urgency: 'low'
      },
      // Add more comprehensive symptom data...
    ];

    const matches = medicalSymptoms.filter(item =>
      item.symptom.toLowerCase().includes(query.toLowerCase()) ||
      item.relatedSymptoms.some(related => 
        related.toLowerCase().includes(query.toLowerCase())
      )
    );

    // Filter by severity if specified
    const filteredMatches = severity 
      ? matches.filter(item => item.severity.includes(severity))
      : matches;

    // Get recent symptom reports from database
    const recentSymptoms = await prisma.symptomReport.findMany({
      where: {
        symptoms: {
          path: '$[*].symptom',
          string_contains: query
        }
      },
      select: {
        symptoms: true,
        severity: true,
        location: true,
        reportedAt: true
      },
      take: 10,
      orderBy: { reportedAt: 'desc' }
    });

    return {
      suggestions: filteredMatches,
      recentReports: recentSymptoms,
      relatedSymptoms: includeRelated ? this.getRelatedSymptoms(query) : [],
      treatments: includeTreatments ? this.getCommonTreatments(query) : []
    };
  }

  /**
   * Search history management
   */
  async saveSearchHistory(userId: string, query: string, type: 'doctors' | 'posts' | 'symptoms') {
    try {
      await prisma.searchHistory.upsert({
        where: {
          userId_query_type: {
            userId,
            query,
            type
          }
        },
        update: {
          searchCount: { increment: 1 },
          lastSearchedAt: new Date()
        },
        create: {
          userId,
          query,
          type,
          searchCount: 1,
          lastSearchedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  async getSearchHistory(userId: string, type?: string) {
    return await prisma.searchHistory.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: [
        { searchCount: 'desc' },
        { lastSearchedAt: 'desc' }
      ],
      take: 10
    });
  }

  /**
   * Autocomplete with enhanced suggestions
   */
  async autocomplete(params: {
    query: string;
    type: 'doctors' | 'posts' | 'symptoms' | 'all';
    userId?: string;
    limit?: number;
  }) {
    const { query, type, userId, limit = 5 } = params;

    const results: any = {};

    // Include search history for personalization
    if (userId) {
      const history = await this.getSearchHistory(userId, type === 'all' ? undefined : type);
      results.history = history.slice(0, 3);
    }

    if (type === 'doctors' || type === 'all') {
      results.doctors = await prisma.user.findMany({
        where: {
          role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
          doctorVerificationStatus: 'APPROVED',
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { specialty: { contains: query, mode: 'insensitive' } },
            { subSpecialty: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          specialty: true,
          subSpecialty: true,
          totalKarma: true
        },
        orderBy: { totalKarma: 'desc' },
        take: limit
      });
    }

    if (type === 'posts' || type === 'all') {
      results.posts = await prisma.post.findMany({
        where: {
          isDraft: false,
          isRemoved: false,
          title: { contains: query, mode: 'insensitive' }
        },
        select: {
          id: true,
          title: true,
          score: true,
          createdAt: true
        },
        orderBy: { score: 'desc' },
        take: limit
      });
    }

    if (type === 'symptoms' || type === 'all') {
      results.symptoms = await this.searchSymptoms(query);
    }

    return results;
  }

  // Helper methods
  private calculateRelevanceScore(doctor: any, query?: string): number {
    let score = 0;
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      if (doctor.username.toLowerCase().includes(lowerQuery)) score += 10;
      if (doctor.specialty?.toLowerCase().includes(lowerQuery)) score += 8;
      if (doctor.bio?.toLowerCase().includes(lowerQuery)) score += 5;
    }
    
    // Factor in karma and experience
    score += (doctor.totalKarma || 0) / 100;
    score += (doctor.yearsOfExperience || 0) * 0.5;
    
    return score;
  }

  private calculatePostRelevanceScore(post: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (post.title.toLowerCase().includes(lowerQuery)) score += 10;
    if (post.content?.toLowerCase().includes(lowerQuery)) score += 5;
    
    score += post.score || 0;
    score += (post._count?.comments || 0) * 0.5;
    
    return score;
  }

  private calculateAverageRating(doctor: any): number {
    // Calculate based on karma and performance metrics
    const karma = doctor.totalKarma || 0;
    const helpfulness = doctor.doctorPerformance?.helpfulnessScore || 0;
    
    return Math.min(5, (karma / 200) + helpfulness);
  }

  private async getAvailableSpecialties(): Promise<string[]> {
    const specialties = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
        specialty: { not: null }
      },
      select: { specialty: true },
      distinct: ['specialty']
    });
    
    return specialties.map(s => s.specialty!).filter(Boolean);
  }

  private async getAvailableLocations(): Promise<string[]> {
    const locations = await prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
        city: { not: null }
      },
      select: { city: true, state: true },
      distinct: ['city']
    });
    
    return locations.map(l => `${l.city}, ${l.state}`).filter(Boolean);
  }

  private async getAvailableLanguages(): Promise<string[]> {
    // This would need to be implemented based on your language storage
    return ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];
  }

  private getRelatedSymptoms(query: string): string[] {
    // Simple related symptoms mapping
    const relatedMap: Record<string, string[]> = {
      'fever': ['chills', 'sweating', 'headache', 'fatigue'],
      'headache': ['nausea', 'dizziness', 'sensitivity to light'],
      'chest pain': ['shortness of breath', 'dizziness', 'nausea'],
      'cough': ['sore throat', 'runny nose', 'fever'],
    };
    
    return relatedMap[query.toLowerCase()] || [];
  }

  private getCommonTreatments(query: string): string[] {
    // Simple treatment suggestions
    const treatmentMap: Record<string, string[]> = {
      'fever': ['Rest', 'Hydration', 'Paracetamol', 'Cool compress'],
      'headache': ['Rest', 'Hydration', 'Pain relievers', 'Cold compress'],
      'cough': ['Honey', 'Warm liquids', 'Cough drops', 'Steam inhalation'],
    };
    
    return treatmentMap[query.toLowerCase()] || [];
  }
}

export const searchService = new SearchService();
