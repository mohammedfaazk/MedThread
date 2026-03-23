import { prisma } from '@medthread/database';

export class SearchService {
  /**
   * Search doctors by specialty, location, availability
   */
  async searchDoctors(params: {
    query?: string;
    specialty?: string;
    subSpecialty?: string;
    location?: string;
    pincode?: string;
    availability?: 'available' | 'all';
    sortBy?: 'relevance' | 'rating' | 'experience' | 'responseTime';
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

    // Filter by location
    if (pincode) {
      where.pincode = pincode;
    } else if (location) {
      where.OR = [
        { clinicAddress: { contains: location, mode: 'insensitive' } },
        { hospitalAffiliation: { contains: location, mode: 'insensitive' } }
      ];
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
        orderBy = { createdAt: 'desc' }; // Placeholder
        break;
      default:
        orderBy = { totalKarma: 'desc' };
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
        totalKarma: true,
        verified: true,
        doctorVerificationStatus: true,
        doctorActivityMetrics: {
          select: {
            avgReplyTimeHours: true,
            totalPatientsAcquired: true,
            lastActiveAt: true
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

    return {
      doctors,
      total,
      hasMore: offset + doctors.length < total
    };
  }

  /**
   * Search posts and medical content
   */
  async searchPosts(params: {
    query: string;
    communityId?: string;
    authorRole?: 'DOCTOR' | 'PATIENT' | 'all';
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    dateFrom?: Date;
    dateTo?: Date;
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

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true
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
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    const total = await prisma.post.count({ where });

    return {
      posts,
      total,
      hasMore: offset + posts.length < total
    };
  }

  /**
   * Search symptoms and conditions
   */
  async searchSymptoms(query: string) {
    // Common symptoms database
    const commonSymptoms = [
      'fever', 'headache', 'cough', 'cold', 'sore throat', 'body ache',
      'fatigue', 'nausea', 'vomiting', 'diarrhea', 'constipation',
      'chest pain', 'shortness of breath', 'dizziness', 'rash',
      'abdominal pain', 'back pain', 'joint pain', 'muscle pain',
      'anxiety', 'depression', 'insomnia', 'weight loss', 'weight gain'
    ];

    const matches = commonSymptoms.filter(symptom =>
      symptom.toLowerCase().includes(query.toLowerCase())
    );

    // Also search in actual symptom reports
    const recentSymptoms = await prisma.symptomReport.findMany({
      where: {
        symptoms: {
          path: '$[*].symptom',
          string_contains: query
        }
      },
      select: {
        symptoms: true
      },
      take: 10,
      distinct: ['symptoms']
    });

    return {
      suggestions: matches,
      recentReports: recentSymptoms
    };
  }

  /**
   * Autocomplete search
   */
  async autocomplete(params: {
    query: string;
    type: 'doctors' | 'posts' | 'symptoms' | 'all';
    limit?: number;
  }) {
    const { query, type, limit = 5 } = params;

    const results: any = {};

    if (type === 'doctors' || type === 'all') {
      results.doctors = await prisma.user.findMany({
        where: {
          role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] },
          doctorVerificationStatus: 'APPROVED',
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { specialty: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          specialty: true
        },
        take: limit
      });
    }

    if (type === 'posts' || type === 'all') {
      results.posts = await prisma.post.findMany({
        where: {
          isDraft: false,
          title: { contains: query, mode: 'insensitive' }
        },
        select: {
          id: true,
          title: true
        },
        take: limit
      });
    }

    if (type === 'symptoms' || type === 'all') {
      results.symptoms = await this.searchSymptoms(query);
    }

    return results;
  }
}

export const searchService = new SearchService();
