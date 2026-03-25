import { prisma } from '@medthread/database';

interface SpamCheckResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
  confidence: number;
}

class SpamDetectionService {
  private spamKeywords = [
    'buy now', 'click here', 'limited offer', 'act now', 'free money',
    'weight loss miracle', 'cure all', 'guaranteed results', 'no side effects',
    'doctors hate this', 'one weird trick', 'lose weight fast'
  ];

  private suspiciousPatterns = [
    /\b(viagra|cialis|pharmacy)\b/i,
    /\b(casino|poker|gambling)\b/i,
    /\b(loan|credit|debt)\b/i,
    /https?:\/\/[^\s]+/g, // Multiple URLs
    /(.)\1{4,}/, // Repeated characters
    /[A-Z]{10,}/, // Excessive caps
  ];

  async checkSpam(content: string, userId: string, contentType: 'post' | 'comment'): Promise<SpamCheckResult> {
    const reasons: string[] = [];
    let score = 0;

    // Check spam keywords
    const lowerContent = content.toLowerCase();
    const keywordMatches = this.spamKeywords.filter(keyword => lowerContent.includes(keyword));
    if (keywordMatches.length > 0) {
      score += keywordMatches.length * 15;
      reasons.push(`Contains spam keywords: ${keywordMatches.join(', ')}`);
    }

    // Check suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 2) {
        score += 20;
        reasons.push('Contains suspicious patterns');
        break;
      }
    }

    // Check URL count
    const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (urlCount > 3) {
      score += urlCount * 10;
      reasons.push(`Too many URLs: ${urlCount}`);
    }

    // Check user posting frequency
    const recentPosts = await this.getUserRecentActivity(userId, contentType);
    if (recentPosts > 10) {
      score += 25;
      reasons.push('High posting frequency');
    }

    // Check content length
    if (content.length < 20) {
      score += 10;
      reasons.push('Very short content');
    }

    // Check for duplicate content
    const isDuplicate = await this.checkDuplicateContent(content, userId);
    if (isDuplicate) {
      score += 40;
      reasons.push('Duplicate content detected');
    }

    const isSpam = score >= 50;
    const confidence = Math.min(score / 100, 1);

    return { isSpam, score, reasons, confidence };
  }

  private async getUserRecentActivity(userId: string, contentType: 'post' | 'comment'): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (contentType === 'post') {
      return await prisma.post.count({
        where: {
          authorId: userId,
          createdAt: { gte: oneHourAgo }
        }
      });
    } else {
      return await prisma.comment.count({
        where: {
          authorId: userId,
          createdAt: { gte: oneHourAgo }
        }
      });
    }
  }

  private async checkDuplicateContent(content: string, userId: string): Promise<boolean> {
    const recentPosts = await prisma.post.findMany({
      where: {
        authorId: userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      },
      select: { content: true }
    });

    return recentPosts.some(post => post.content === content);
  }

  async autoRemoveSpam(contentId: string, contentType: 'post' | 'comment'): Promise<void> {
    if (contentType === 'post') {
      await prisma.post.update({
        where: { id: contentId },
        data: { isDeleted: true }
      });
    } else {
      await prisma.comment.update({
        where: { id: contentId },
        data: { isDeleted: true }
      });
    }
  }

  async getSpamStats(userId?: string): Promise<any> {
    const where = userId ? { authorId: userId } : {};
    
    const [spamPosts, spamComments] = await Promise.all([
      prisma.post.count({ where: { ...where, isDeleted: true } }),
      prisma.comment.count({ where: { ...where, isDeleted: true } })
    ]);

    return {
      totalSpamPosts: spamPosts,
      totalSpamComments: spamComments,
      total: spamPosts + spamComments
    };
  }
}

export const spamDetectionService = new SpamDetectionService();
