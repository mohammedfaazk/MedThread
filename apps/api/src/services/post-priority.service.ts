import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive symptom keyword dictionary with severity weights
const SYMPTOM_KEYWORDS = {
  // HIGH PRIORITY (Critical/Acute symptoms)
  HIGH: {
    'chest pain': 10,
    'difficulty breathing': 10,
    'shortness of breath': 10,
    'severe headache': 9,
    'sudden numbness': 10,
    'stroke symptoms': 10,
    'heart attack': 10,
    'severe bleeding': 10,
    'unconscious': 10,
    'seizure': 10,
    'high fever': 8,
    'severe abdominal pain': 9,
    'difficulty swallowing': 8,
    'severe allergic reaction': 9,
    'anaphylaxis': 10,
    'severe burns': 9,
    'broken bone': 8,
    'severe injury': 9,
    'blood in urine': 8,
    'blood in stool': 8,
    'severe vomiting': 8,
    'dehydration': 7,
    'diabetic emergency': 9,
    'severe asthma': 9,
    'can\'t breathe': 10,
    'choking': 10,
    'severe pain': 8,
    'emergency': 9,
    'urgent': 7,
    'critical': 9,
    'life threatening': 10
  },
  
  // MEDIUM PRIORITY (Moderate symptoms)
  MEDIUM: {
    'persistent cough': 5,
    'chronic fatigue': 5,
    'mild fever': 4,
    'body ache': 4,
    'joint pain': 5,
    'back pain': 5,
    'headache': 4,
    'nausea': 4,
    'dizziness': 5,
    'skin rash': 4,
    'stomach pain': 5,
    'diarrhea': 4,
    'constipation': 3,
    'insomnia': 4,
    'anxiety': 4,
    'depression': 5,
    'muscle pain': 4,
    'sore throat': 3,
    'ear pain': 4,
    'eye pain': 4,
    'swelling': 5,
    'bruising': 3,
    'weight loss': 5,
    'weight gain': 4,
    'irregular periods': 4,
    'urinary problems': 5,
    'digestive issues': 4,
    'skin problems': 3,
    'hair loss': 3,
    'memory problems': 5,
    'concentration issues': 4
  },
  
  // LOW PRIORITY (Minor symptoms)
  LOW: {
    'cold': 2,
    'sneezing': 1,
    'runny nose': 2,
    'mild headache': 2,
    'general wellness': 1,
    'vitamin deficiency': 2,
    'dry skin': 1,
    'minor cut': 1,
    'bruise': 1,
    'common cold': 2,
    'seasonal allergies': 2,
    'minor ache': 2,
    'tiredness': 2,
    'stress': 2,
    'minor discomfort': 1,
    'wellness check': 1,
    'prevention': 1,
    'health tips': 1,
    'diet advice': 1,
    'exercise': 1,
    'lifestyle': 1,
    'nutrition': 1,
    'supplements': 1,
    'minor concern': 1
  }
};

export class PostPriorityService {
  /**
   * Analyze post content and assign priority based on medical urgency
   */
  async analyzePostPriority(postId: string, title: string, content: string) {
    const combinedText = `${title} ${content}`.toLowerCase();
    
    // Scan for symptom keywords and calculate severity score
    let maxScore = 0;
    let detectedSymptoms: Array<{symptom: string, weight: number, category: string}> = [];
    let priorityLevel = 'LOW';

    // Check HIGH priority symptoms
    for (const [symptom, weight] of Object.entries(SYMPTOM_KEYWORDS.HIGH)) {
      if (combinedText.includes(symptom.toLowerCase())) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'HIGH' });
      }
    }

    // Check MEDIUM priority symptoms
    for (const [symptom, weight] of Object.entries(SYMPTOM_KEYWORDS.MEDIUM)) {
      if (combinedText.includes(symptom.toLowerCase())) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'MEDIUM' });
      }
    }

    // Check LOW priority symptoms
    for (const [symptom, weight] of Object.entries(SYMPTOM_KEYWORDS.LOW)) {
      if (combinedText.includes(symptom.toLowerCase())) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'LOW' });
      }
    }

    // Determine priority level based on max score
    if (maxScore >= 8) {
      priorityLevel = 'HIGH';
    } else if (maxScore >= 4) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    // Sort detected symptoms by weight (highest first)
    detectedSymptoms.sort((a, b) => b.weight - a.weight);

    // Store priority analysis in database
    await prisma.postPriority.upsert({
      where: { postId },
      create: {
        postId,
        priorityLevel,
        urgencyScore: maxScore,
        detectedSymptoms: detectedSymptoms,
        calculatedAt: new Date()
      },
      update: {
        priorityLevel,
        urgencyScore: maxScore,
        detectedSymptoms: detectedSymptoms,
        calculatedAt: new Date()
      }
    });

    return {
      postId,
      priorityLevel,
      urgencyScore: maxScore,
      detectedSymptoms,
      badge: this.getPriorityBadge(priorityLevel)
    };
  }

  /**
   * Get priority badge configuration for UI display
   */
  private getPriorityBadge(priorityLevel: string) {
    const badges = {
      HIGH: { emoji: '🔴', label: 'High', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      MEDIUM: { emoji: '🟡', label: 'Medium', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      LOW: { emoji: '🟢', label: 'Low', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' }
    };
    return badges[priorityLevel as keyof typeof badges] || badges.LOW;
  }

  /**
   * Get prioritized feed for doctors with urgency-based sorting
   */
  async getDoctorPrioritizedFeed(doctorId: string, options: {
    page?: number;
    limit?: number;
    priorityFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
    communityId?: string;
  }) {
    const { page = 1, limit = 20, priorityFilter = 'ALL', communityId } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      author: {
        role: 'PATIENT' // Only show patient posts in doctor feed
      }
    };
    if (communityId) where.communityId = communityId;
    
    // Priority filter
    const priorityWhere: any = {};
    if (priorityFilter !== 'ALL') {
      priorityWhere.priorityLevel = priorityFilter;
    }

    // Get posts with priority data
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              role: true,
              verified: true,
            }
          },
          community: {
            select: {
              id: true,
              name: true,
              icon: true,
            }
          },
          priority: priorityWhere.priorityLevel ? {
            where: priorityWhere
          } : true,
          _count: {
            select: {
              comments: true,
              votes: true,
            }
          }
        },
        orderBy: [
          // Primary sort: High priority posts first
          { priority: { urgencyScore: 'desc' } },
          // Secondary sort: Recent posts
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.post.count({ 
        where: {
          ...where,
          ...(priorityFilter !== 'ALL' ? {
            priority: { priorityLevel: priorityFilter }
          } : {})
        }
      })
    ]);

    // Analyze posts that don't have priority data yet
    const postsWithoutPriority = posts.filter(post => !post.priority);
    for (const post of postsWithoutPriority) {
      // Analyze in background (don't await to avoid blocking response)
      this.analyzePostPriority(post.id, post.title, post.content || '').catch(console.error);
    }

    // Format posts with priority badges
    const formattedPosts = posts.map(post => ({
      ...post,
      priorityBadge: post.priority ? this.getPriorityBadge(post.priority.priorityLevel) : null,
      urgencyScore: post.priority?.urgencyScore || 0,
      detectedSymptoms: post.priority?.detectedSymptoms || []
    }));

    return {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      priorityStats: await this.getPriorityStats(communityId)
    };
  }

  /**
   * Get priority distribution statistics
   */
  async getPriorityStats(communityId?: string) {
    const where: any = {};
    if (communityId) {
      where.post = { communityId };
    }

    const stats = await prisma.postPriority.groupBy({
      by: ['priorityLevel'],
      where,
      _count: { priorityLevel: true },
      _avg: { urgencyScore: true }
    });

    const total = stats.reduce((sum, stat) => sum + stat._count.priorityLevel, 0);

    return {
      total,
      distribution: stats.map(stat => ({
        priority: stat.priorityLevel,
        count: stat._count.priorityLevel,
        percentage: total > 0 ? ((stat._count.priorityLevel / total) * 100).toFixed(1) : '0',
        avgUrgencyScore: stat._avg.urgencyScore?.toFixed(1) || '0',
        badge: this.getPriorityBadge(stat.priorityLevel)
      }))
    };
  }

  /**
   * Bulk analyze existing posts for priority (maintenance function)
   */
  async bulkAnalyzePosts(limit = 100) {
    const posts = await prisma.post.findMany({
      where: {
        priority: null
      },
      select: {
        id: true,
        title: true,
        content: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const results = [];
    for (const post of posts) {
      try {
        const analysis = await this.analyzePostPriority(post.id, post.title, post.content || '');
        results.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze post ${post.id}:`, error);
      }
    }

    return {
      analyzed: results.length,
      total: posts.length,
      results
    };
  }

  /**
   * Get trending symptoms from recent high-priority posts
   */
  async getTrendingSymptoms(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const priorities = await prisma.postPriority.findMany({
      where: {
        analyzedAt: { gte: since },
        priorityLevel: { in: ['HIGH', 'MEDIUM'] }
      },
      select: {
        detectedSymptoms: true,
        priorityLevel: true,
        post: {
          select: {
            createdAt: true,
            author: {
              select: { pincode: true }
            }
          }
        }
      }
    });

    // Aggregate symptoms
    const symptomCounts: Record<string, {count: number, regions: Set<string>, severity: string[]}> = {};
    
    priorities.forEach(priority => {
      const symptoms = priority.detectedSymptoms as Array<{symptom: string, weight: number, category: string}>;
      symptoms.forEach(symptom => {
        if (!symptomCounts[symptom.symptom]) {
          symptomCounts[symptom.symptom] = { count: 0, regions: new Set(), severity: [] };
        }
        symptomCounts[symptom.symptom].count++;
        symptomCounts[symptom.symptom].severity.push(priority.priorityLevel);
        if (priority.post.author?.pincode) {
          symptomCounts[symptom.symptom].regions.add(priority.post.author.pincode);
        }
      });
    });

    // Format trending symptoms
    const trending = Object.entries(symptomCounts)
      .map(([symptom, data]) => ({
        symptom,
        count: data.count,
        regions: data.regions.size,
        severity: data.severity.filter(s => s === 'HIGH').length > 0 ? 'HIGH' : 'MEDIUM',
        badge: this.getPriorityBadge(data.severity.filter(s => s === 'HIGH').length > 0 ? 'HIGH' : 'MEDIUM')
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      period: `Last ${days} days`,
      trending,
      totalAnalyzed: priorities.length
    };
  }
}

export const postPriorityService = new PostPriorityService();