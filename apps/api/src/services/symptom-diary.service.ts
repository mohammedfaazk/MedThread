import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const symptomDiaryService = {
  // Create diary entry
  async createEntry(userId: string, entry: any) {
    return await prisma.symptomDiary.create({
      data: {
        userId,
        symptomType: entry.symptomType,
        bodyPart: entry.bodyPart,
        photos: entry.photos || [],
        userNotes: entry.userNotes,
        severity: entry.severity,
        painLevel: entry.painLevel,
        tags: entry.tags || []
      }
    });
  },

  // Get user's diary entries
  async getEntries(userId: string, filters?: any) {
    const where: any = { userId };

    if (filters?.symptomType) {
      where.symptomType = filters.symptomType;
    }

    if (filters?.isResolved !== undefined) {
      where.isResolved = filters.isResolved;
    }

    return await prisma.symptomDiary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50
    });
  },

  // Get single entry
  async getEntry(entryId: string) {
    return await prisma.symptomDiary.findUnique({
      where: { id: entryId }
    });
  },

  // Update entry
  async updateEntry(entryId: string, updates: any) {
    return await prisma.symptomDiary.update({
      where: { id: entryId },
      data: updates
    });
  },

  // Add photo to entry
  async addPhoto(entryId: string, photoUrl: string, aiAnalysis?: any) {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error('Entry not found');

    const photos = Array.isArray(entry.photos) ? entry.photos : [];
    photos.push({
      url: photoUrl,
      timestamp: new Date().toISOString(),
      aiAnalysis
    });

    // Create photo analysis record
    if (aiAnalysis) {
      await prisma.photoAnalysis.create({
        data: {
          diaryId: entryId,
          photoUrl,
          analysis: aiAnalysis,
          confidence: aiAnalysis.confidence || 0
        }
      });
    }

    return await this.updateEntry(entryId, { photos });
  },

  // Analyze photo with AI
  async analyzePhoto(photoUrl: string) {
    // This would integrate with an AI service
    // For now, return mock analysis
    return {
      detectedFeatures: {
        color: 'reddish',
        size: 'medium',
        texture: 'rough',
        inflammation: true
      },
      possibleConditions: [
        { name: 'Dermatitis', confidence: 0.75 },
        { name: 'Eczema', confidence: 0.65 }
      ],
      recommendations: [
        'Keep area clean and dry',
        'Apply moisturizer',
        'Consult dermatologist if persists'
      ],
      confidence: 0.7
    };
  },

  // Calculate healing progress
  async calculateHealingProgress(entryId: string) {
    const entry = await this.getEntry(entryId);
    if (!entry) throw new Error('Entry not found');

    const analyses = await prisma.photoAnalysis.findMany({
      where: { diaryId: entryId },
      orderBy: { createdAt: 'asc' }
    });

    if (analyses.length < 2) {
      return { healingRate: null, trend: 'INSUFFICIENT_DATA' };
    }

    // Compare first and last analysis
    const first = analyses[0];
    const last = analyses[analyses.length - 1];

    // Calculate improvement (mock calculation)
    const improvement = 20; // percentage
    const healingRate = improvement / analyses.length;

    return {
      healingRate,
      trend: improvement > 0 ? 'IMPROVING' : improvement < 0 ? 'WORSENING' : 'STABLE',
      totalImprovement: improvement,
      daysTracked: analyses.length
    };
  },

  // Mark as resolved
  async markResolved(entryId: string) {
    return await this.updateEntry(entryId, {
      isResolved: true,
      resolvedAt: new Date()
    });
  },

  // Get statistics
  async getStatistics(userId: string) {
    const entries = await this.getEntries(userId);
    
    const total = entries.length;
    const resolved = entries.filter(e => e.isResolved).length;
    const active = total - resolved;
    
    const symptomTypes = entries.reduce((acc: any, entry) => {
      acc[entry.symptomType] = (acc[entry.symptomType] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      resolved,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      mostCommonSymptoms: Object.entries(symptomTypes)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    };
  }
};
