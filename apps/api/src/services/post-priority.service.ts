import { prisma } from '@medthread/database';
import Groq from 'groq-sdk';// ---------------------------------------------------------------------------
// Symptom chip weights — used when structured chip data is available
// ---------------------------------------------------------------------------
const CHIP_WEIGHTS: Record<string, number> = {
  // HIGH (8-10) - LIFE-THREATENING EMERGENCIES
  'chest pain': 10, 'shortness of breath': 10, 'difficulty breathing': 10,
  'seizure': 10, 'unconscious': 10, 'severe bleeding': 10, 'anaphylaxis': 10,
  'stroke symptoms': 10, 'heart attack': 10, 'choking': 10,
  'cardiac arrest': 10, 'not breathing': 10, 'unresponsive': 10,
  'severe abdominal pain': 9, 'severe allergic reaction': 9, 'diabetic emergency': 9,
  'severe asthma': 9, 'severe injury': 9, 'severe burns': 9,
  'suicidal thoughts': 10, 'overdose': 10, 'poisoning': 10,
  'high fever': 8, 'blood in urine': 8, 'blood in stool': 8,
  'severe vomiting': 8, 'broken bone': 8, 'difficulty swallowing': 8,
  'crushing chest pain': 10, 'radiating pain': 9, 'severe chest pressure': 10,
  
  // MEDIUM (4-7) - URGENT BUT NOT IMMEDIATELY LIFE-THREATENING
  'fever': 6, 'dizziness': 5, 'joint pain': 5, 'back pain': 5,
  'stomach pain': 5, 'swelling': 5, 'depression': 5, 'weight loss': 5,
  'urinary problems': 5, 'memory problems': 5, 'nausea': 4,
  'headache': 4, 'body aches': 4, 'fatigue': 4, 'rash': 4,
  'diarrhea': 4, 'insomnia': 4, 'anxiety': 4, 'muscle pain': 4,
  'ear pain': 4, 'eye pain': 4, 'loss of appetite': 4, 'chills': 4,
  'persistent cough': 5, 'sore throat': 3, 'constipation': 3,
  'bruising': 3, 'weight gain': 4, 'skin problems': 3, 'sweating': 3,
  'infection': 5, 'vomiting': 5, 'bleeding': 6, 'worsening symptoms': 6,
  
  // LOW (1-2) - ROUTINE/WELLNESS
  'cough': 2, 'cold': 2, 'runny nose': 2, 'sneezing': 1,
  'mild headache': 2, 'tiredness': 2, 'stress': 2, 'dry skin': 1,
  'vitamin deficiency': 1, 'supplement question': 1, 'diet advice': 1,
  'exercise question': 1, 'sleep hygiene': 2, 'wellness': 1,
};

// Duration multipliers — longer duration = higher urgency
const DURATION_MULTIPLIERS: Record<string, number> = {
  'less_than_day': 0.8,
  '1-3_days': 1.0,
  '4-7_days': 1.2,
  '1-2_weeks': 1.4,
  'more_than_2_weeks': 1.6,
};

// Keyword scan fallback for free-text posts (no chip data)
const TEXT_KEYWORDS = {
  HIGH: {
    'chest pain': 10, 'difficulty breathing': 10, 'shortness of breath': 10,
    'severe headache': 9, 'sudden numbness': 10, 'heart attack': 10,
    'severe bleeding': 10, 'unconscious': 10, 'seizure': 10,
    'high fever': 8, 'severe abdominal pain': 9, 'anaphylaxis': 10,
    'severe allergic reaction': 9, 'can\'t breathe': 10, 'choking': 10,
    'severe pain': 8, 'emergency': 9, 'critical': 9, 'life threatening': 10,
    'blood in urine': 8, 'blood in stool': 8, 'diabetic emergency': 9,
    'stroke': 10, 'heart failure': 10, 'cardiac arrest': 10, 'myocardial infarction': 10,
    'severe chest pain': 10, 'crushing chest pain': 10, 'radiating pain': 9,
    'loss of consciousness': 10, 'unresponsive': 10, 'not breathing': 10,
    'severe injury': 9, 'major trauma': 9, 'broken bone': 7, 'fracture': 7,
    'suicidal': 10, 'suicide': 10, 'self harm': 9, 'overdose': 10,
    'poisoning': 10, 'allergic reaction': 8, 'anaphylactic': 10,
  },
  MEDIUM: {
    'persistent cough': 5, 'chronic fatigue': 5, 'mild fever': 4,
    'body ache': 4, 'joint pain': 5, 'back pain': 5, 'headache': 4,
    'nausea': 4, 'dizziness': 5, 'skin rash': 4, 'stomach pain': 5,
    'diarrhea': 4, 'constipation': 3, 'insomnia': 4, 'anxiety': 4,
    'depression': 5, 'muscle pain': 4, 'sore throat': 3, 'swelling': 5,
    'weight loss': 5, 'urinary problems': 5, 'memory problems': 5,
    'persistent pain': 5, 'chronic pain': 5, 'worsening': 6, 'getting worse': 6,
    'infection': 5, 'fever': 5, 'vomiting': 5, 'bleeding': 6,
  },
  LOW: {
    'cold': 2, 'sneezing': 1, 'runny nose': 2, 'mild headache': 2,
    'tiredness': 2, 'stress': 2, 'dry skin': 1, 'common cold': 2,
    'seasonal allergies': 2, 'minor ache': 2, 'wellness': 1,
    'vitamin': 1, 'supplement': 1, 'diet': 1, 'exercise': 1, 'fitness': 1,
    'sleep': 2, 'nutrition': 1, 'lifestyle': 1, 'prevention': 1,
  },
};

// ---------------------------------------------------------------------------
// Groq LLM client (lazy init)
// ---------------------------------------------------------------------------
let groqClient: Groq | null = null;
function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StructuredSymptomInput {
  symptoms: string[];          // chip-selected symptom labels
  duration?: string;           // DURATION_OPTIONS value key
  age?: number | null;
  gender?: string | null;
  existingConditions?: string; // free text from modal
  description?: string;        // free-text description field
}

interface PriorityResult {
  postId: string;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  urgencyScore: number;
  detectedSymptoms: Array<{ symptom: string; weight: number; category: string }>;
  llmReasoning?: string;
  badge: ReturnType<PostPriorityService['getPriorityBadge']>;
}

// ---------------------------------------------------------------------------
export class PostPriorityService {

  // ── PUBLIC: analyze from structured chip data (PatientCreatePostModal) ──
  async analyzeFromChips(postId: string, input: StructuredSymptomInput): Promise<PriorityResult> {
    const detectedSymptoms: Array<{ symptom: string; weight: number; category: string }> = [];
    let chipScore = 0;

    // 1. Score each selected chip
    for (const chip of input.symptoms) {
      const key = chip.toLowerCase();
      const weight = CHIP_WEIGHTS[key] ?? 3; // default 3 for unknown chips
      const category = weight >= 8 ? 'HIGH' : weight >= 4 ? 'MEDIUM' : 'LOW';
      detectedSymptoms.push({ symptom: chip, weight, category });
      chipScore += weight;
    }

    // 2. Duration multiplier
    const durationMult = DURATION_MULTIPLIERS[input.duration ?? ''] ?? 1.0;
    chipScore = Math.round(chipScore * durationMult);

    // 3. Context boost
    let contextBoost = 0;
    if (input.age && (input.age >= 60 || input.age <= 5)) contextBoost += 2;
    const highRiskConditions = ['diabetes', 'heart', 'kidney', 'asthma', 'hypertension', 'cancer', 'copd'];
    if (input.existingConditions) {
      const lower = input.existingConditions.toLowerCase();
      if (highRiskConditions.some(c => lower.includes(c))) contextBoost += 2;
    }

    // 4. Optional LLM boost on free-text description
    let llmScore = 0;
    let llmReasoning: string | undefined;
    if (input.description && input.description.trim().length > 20) {
      const llmResult = await this.scoreFreeText(input.description, input.symptoms);
      llmScore = llmResult.score;
      llmReasoning = llmResult.reasoning;
    }

    // 5. Final score — cap at 100
    const urgencyScore = Math.min(100, chipScore + contextBoost + llmScore);

    // 6. Priority thresholds (chip-based scoring is additive so thresholds are higher)
    let priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    if (urgencyScore >= 25 || detectedSymptoms.some(s => s.category === 'HIGH')) {
      priorityLevel = 'HIGH';
    } else if (urgencyScore >= 10) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    detectedSymptoms.sort((a, b) => b.weight - a.weight);
    await this.upsertPriority(postId, priorityLevel, urgencyScore, detectedSymptoms);

    return { postId, priorityLevel, urgencyScore, detectedSymptoms, llmReasoning, badge: this.getPriorityBadge(priorityLevel) };
  }

  // ── PUBLIC: analyze from raw post text (legacy / bulk backfill) ──
  async analyzePostPriority(postId: string, title: string, content: string): Promise<PriorityResult> {
    const combinedText = `${title} ${content}`.toLowerCase();
    const detectedSymptoms: Array<{ symptom: string; weight: number; category: string }> = [];
    let maxScore = 0;

    for (const [symptom, weight] of Object.entries(TEXT_KEYWORDS.HIGH)) {
      if (combinedText.includes(symptom)) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'HIGH' });
      }
    }
    for (const [symptom, weight] of Object.entries(TEXT_KEYWORDS.MEDIUM)) {
      if (combinedText.includes(symptom)) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'MEDIUM' });
      }
    }
    for (const [symptom, weight] of Object.entries(TEXT_KEYWORDS.LOW)) {
      if (combinedText.includes(symptom)) {
        maxScore = Math.max(maxScore, weight);
        detectedSymptoms.push({ symptom, weight, category: 'LOW' });
      }
    }

    // LLM boost on full text
    let llmScore = 0;
    let llmReasoning: string | undefined;
    const textToScore = `${title}. ${content}`.slice(0, 500);
    if (textToScore.trim().length > 20) {
      const llmResult = await this.scoreFreeText(textToScore, []);
      llmScore = llmResult.score;
      llmReasoning = llmResult.reasoning;
    }

    const urgencyScore = Math.min(100, maxScore + llmScore);

    let priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    if (urgencyScore >= 8 || detectedSymptoms.some(s => s.category === 'HIGH')) {
      priorityLevel = 'HIGH';
    } else if (urgencyScore >= 4) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    detectedSymptoms.sort((a, b) => b.weight - a.weight);
    await this.upsertPriority(postId, priorityLevel, urgencyScore, detectedSymptoms);

    return { postId, priorityLevel, urgencyScore, detectedSymptoms, llmReasoning, badge: this.getPriorityBadge(priorityLevel) };
  }

  // ── PRIVATE: call Groq to score free-text description ──
  private async scoreFreeText(text: string, knownSymptoms: string[]): Promise<{ score: number; reasoning: string }> {
    const groq = getGroq();
    if (!groq) return { score: 0, reasoning: '' };

    const knownCtx = knownSymptoms.length
      ? `The patient has already reported these symptoms via checkboxes: ${knownSymptoms.join(', ')}.`
      : '';

    const prompt = `You are a medical triage assistant. Analyze the following patient description and rate its medical urgency.

${knownCtx}

Patient description: "${text.slice(0, 400)}"

Rules:
- Score 0-10 based on urgency (10 = life-threatening, 0 = routine wellness)
- Consider: symptom severity, red-flag phrases, duration cues, negation ("no chest pain" = 0 not 10)
- Do NOT be influenced by dramatic language alone — focus on clinical indicators

Respond with ONLY valid JSON, no markdown:
{"score": <number 0-10>, "reasoning": "<one sentence>", "flags": [<red flag phrases if any>]}`;

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 150,
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? '';
      // Strip markdown code fences if present
      const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        score: Math.min(10, Math.max(0, Number(parsed.score) || 0)),
        reasoning: parsed.reasoning || '',
      };
    } catch (e) {
      console.warn('[PostPriority] LLM scoring failed, using 0:', e);
      return { score: 0, reasoning: '' };
    }
  }

  // ── PRIVATE: upsert PostPriority record ──
  private async upsertPriority(
    postId: string,
    priorityLevel: string,
    urgencyScore: number,
    detectedSymptoms: any[]
  ) {
    await prisma.postPriority.upsert({
      where: { postId },
      create: { postId, priorityLevel, urgencyScore, detectedSymptoms, calculatedAt: new Date() },
      update: { priorityLevel, urgencyScore, detectedSymptoms, calculatedAt: new Date() },
    });
  }

  // ── Badge config ──
  getPriorityBadge(priorityLevel: string) {
    const badges = {
      HIGH:   { emoji: '🔴', label: 'High',   color: 'red',    bgColor: 'bg-red-100',    textColor: 'text-red-800' },
      MEDIUM: { emoji: '🟡', label: 'Medium', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      LOW:    { emoji: '🟢', label: 'Low',    color: 'green',  bgColor: 'bg-green-100',  textColor: 'text-green-800' },
    };
    return badges[priorityLevel as keyof typeof badges] || badges.LOW;
  }

  // ── Doctor prioritized feed ──
  async getDoctorPrioritizedFeed(doctorId: string, options: {
    page?: number; limit?: number;
    priorityFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
    communityId?: string;
  }) {
    const { page = 1, limit = 20, priorityFilter = 'ALL', communityId } = options;
    const skip = (page - 1) * limit;

    const where: any = { 
      author: { role: 'PATIENT' }
    };
    if (communityId) where.communityId = communityId;
    
    // Add priority filter to where clause - must check if priority exists first
    if (priorityFilter !== 'ALL') {
      where.priority = {
        is: {
          priorityLevel: priorityFilter
        }
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatar: true, role: true, verified: true } },
          community: { select: { id: true, name: true, icon: true } },
          priority: true,
          _count: { select: { comments: true, votes: true } },
        },
        orderBy: [{ priority: { urgencyScore: 'desc' } }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    const postsWithoutPriority = posts.filter(p => !p.priority);
    for (const post of postsWithoutPriority) {
      this.analyzePostPriority(post.id, post.title, post.content || '').catch(console.error);
    }

    return {
      posts: posts.map(post => ({
        ...post,
        priorityBadge: post.priority ? this.getPriorityBadge(post.priority.priorityLevel) : null,
        urgencyScore: post.priority?.urgencyScore || 0,
        detectedSymptoms: post.priority?.detectedSymptoms || [],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
      priorityStats: await this.getPriorityStats(communityId),
    };
  }

  async getPriorityStats(communityId?: string) {
    const where: any = {};
    if (communityId) where.post = { communityId };

    const stats = await prisma.postPriority.groupBy({
      by: ['priorityLevel'],
      where,
      _count: { priorityLevel: true },
      _avg: { urgencyScore: true },
    });

    const total = stats.reduce((sum, s) => sum + s._count.priorityLevel, 0);
    return {
      total,
      distribution: stats.map(s => ({
        priority: s.priorityLevel,
        count: s._count.priorityLevel,
        percentage: total > 0 ? ((s._count.priorityLevel / total) * 100).toFixed(1) : '0',
        avgUrgencyScore: s._avg.urgencyScore?.toFixed(1) || '0',
        badge: this.getPriorityBadge(s.priorityLevel),
      })),
    };
  }

  async bulkAnalyzePosts(limit = 100) {
    const posts = await prisma.post.findMany({
      where: { priority: null },
      select: { id: true, title: true, content: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const results = [];
    for (const post of posts) {
      try {
        results.push(await this.analyzePostPriority(post.id, post.title, post.content || ''));
      } catch (e) {
        console.error(`Failed to analyze post ${post.id}:`, e);
      }
    }
    return { analyzed: results.length, total: posts.length, results };
  }

  async getTrendingSymptoms(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const priorities = await prisma.postPriority.findMany({
      where: { calculatedAt: { gte: since }, priorityLevel: { in: ['HIGH', 'MEDIUM'] } },
      select: {
        detectedSymptoms: true, priorityLevel: true,
        post: { select: { createdAt: true, author: { select: { pincode: true } } } },
      },
    });

    const symptomCounts: Record<string, { count: number; regions: Set<string>; severity: string[] }> = {};
    priorities.forEach(p => {
      const symptoms = p.detectedSymptoms as Array<{ symptom: string; weight: number; category: string }>;
      symptoms.forEach(s => {
        if (!symptomCounts[s.symptom]) symptomCounts[s.symptom] = { count: 0, regions: new Set(), severity: [] };
        symptomCounts[s.symptom].count++;
        symptomCounts[s.symptom].severity.push(p.priorityLevel);
        if (p.post.author?.pincode) symptomCounts[s.symptom].regions.add(p.post.author.pincode);
      });
    });

    const trending = Object.entries(symptomCounts)
      .map(([symptom, data]) => ({
        symptom,
        count: data.count,
        regions: data.regions.size,
        severity: data.severity.includes('HIGH') ? 'HIGH' : 'MEDIUM',
        badge: this.getPriorityBadge(data.severity.includes('HIGH') ? 'HIGH' : 'MEDIUM'),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { period: `Last ${days} days`, trending, totalAnalyzed: priorities.length };
  }
}

export const postPriorityService = new PostPriorityService();
