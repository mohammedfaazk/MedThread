import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedRealisticReportsAndModeration() {
  console.log('🛡️ Starting realistic reports and moderation data seeding...\n');

  try {
    // Get existing users
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR', verified: true },
      take: 20
    });

    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 50
    });

    if (doctors.length === 0 || patients.length === 0) {
      console.error('❌ Not enough users. Please run comprehensive seed first.');
      return;
    }

    console.log(`✅ Found ${doctors.length} doctors and ${patients.length} patients\n`);

    // Get existing posts and comments
    const posts = await prisma.post.findMany({ take: 100 });
    const comments = await prisma.comment.findMany({ take: 200 });

    console.log(`✅ Found ${posts.length} posts and ${comments.length} comments\n`);

    // ==================== REALISTIC REPORT REASONS ====================
    const reportReasons = {
      spam: {
        reasons: ['Spam', 'Promotional Content', 'Repetitive Posting', 'Advertisement'],
        details: [
          'This post contains promotional links and advertisements',
          'User is repeatedly posting the same content across multiple communities',
          'This appears to be spam promoting external services',
          'Unsolicited commercial content'
        ]
      },
      harassment: {
        reasons: ['Harassment', 'Bullying', 'Personal Attack', 'Threatening Behavior'],
        details: [
          'This comment contains personal attacks against another user',
          'User is engaging in targeted harassment',
          'Threatening language directed at community members',
          'Repeated bullying behavior in comments'
        ]
      },
      misinformation: {
        reasons: ['Medical Misinformation', 'False Information', 'Dangerous Advice'],
        details: [
          'This post contains medically inaccurate information that could harm patients',
          'User is spreading false health claims without evidence',
          'Dangerous medical advice that contradicts established guidelines',
          'Promoting unproven treatments as cures'
        ]
      },
      inappropriate: {
        reasons: ['Inappropriate Content', 'Off-Topic', 'Explicit Content', 'Violation of Guidelines'],
        details: [
          'Content is not appropriate for a medical community',
          'Post is completely off-topic and unrelated to health',
          'Contains explicit or graphic content without proper warnings',
          'Violates community guidelines regarding respectful discourse'
        ]
      },
      privacy: {
        reasons: ['Privacy Violation', 'Sharing Personal Information', 'Doxxing'],
        details: [
          'User is sharing private medical information without consent',
          'Post contains personally identifiable information of others',
          'Attempting to reveal private details about another user',
          'Sharing confidential patient information'
        ]
      }
    };

    // ==================== CREATE REALISTIC REPORTS ====================
    console.log('📝 Creating realistic reports over the past 12 weeks...\n');

    const reportStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    const allReporters = [...doctors, ...patients];
    let totalReports = 0;
    const weeklyReportCounts: { [key: string]: { filed: number; resolved: number; dismissed: number } } = {};

    // Generate reports for the past 12 weeks
    for (let week = 0; week < 12; week++) {
      const weekLabel = `Week ${12 - week}`;
      const daysAgo = week * 7;
      
      // Realistic pattern: more reports in recent weeks, varying by week
      const baseReports = Math.floor(Math.random() * 15) + 10; // 10-25 reports per week
      const weekMultiplier = week < 4 ? 1.3 : 1.0; // More recent activity
      const reportsThisWeek = Math.floor(baseReports * weekMultiplier);

      let filed = 0;
      let resolved = 0;
      let dismissed = 0;

      for (let i = 0; i < reportsThisWeek; i++) {
        const reportDate = new Date();
        reportDate.setDate(reportDate.getDate() - daysAgo - Math.floor(Math.random() * 7));

        // Select random report category
        const categories = Object.keys(reportReasons);
        const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof reportReasons;
        const categoryData = reportReasons[category];
        
        const reason = categoryData.reasons[Math.floor(Math.random() * categoryData.reasons.length)];
        const details = categoryData.details[Math.floor(Math.random() * categoryData.details.length)];

        // Determine status based on age (older reports more likely to be resolved)
        let status: string;
        if (week > 2) {
          // Older reports: 70% resolved, 20% dismissed, 10% pending
          const rand = Math.random();
          if (rand < 0.7) {
            status = 'APPROVED';
            resolved++;
          } else if (rand < 0.9) {
            status = 'REJECTED';
            dismissed++;
          } else {
            status = 'PENDING';
          }
        } else {
          // Recent reports: 40% resolved, 30% dismissed, 30% pending
          const rand = Math.random();
          if (rand < 0.4) {
            status = 'APPROVED';
            resolved++;
          } else if (rand < 0.7) {
            status = 'REJECTED';
            dismissed++;
          } else {
            status = 'PENDING';
          }
        }

        filed++;

        // Select reporter (patients more likely to report)
        const reporter = Math.random() < 0.7 
          ? patients[Math.floor(Math.random() * patients.length)]
          : doctors[Math.floor(Math.random() * doctors.length)];

        // Decide whether to report a post or comment (60% posts, 40% comments)
        const isPostReport = Math.random() < 0.6;

        try {
          if (isPostReport && posts.length > 0) {
            const post = posts[Math.floor(Math.random() * posts.length)];
            await prisma.report.create({
              data: {
                userId: reporter.id,
                postId: post.id,
                reason,
                details,
                status,
                createdAt: reportDate
              }
            });
          } else if (comments.length > 0) {
            const comment = comments[Math.floor(Math.random() * comments.length)];
            await prisma.report.create({
              data: {
                userId: reporter.id,
                commentId: comment.id,
                reason,
                details,
                status,
                createdAt: reportDate
              }
            });
          }
          totalReports++;
        } catch (error) {
          // Skip if duplicate or constraint violation
          console.log(`   ⚠️ Skipped duplicate report`);
        }
      }

      weeklyReportCounts[weekLabel] = { filed, resolved, dismissed };
      console.log(`   ✅ Week ${12 - week}: ${filed} filed, ${resolved} resolved, ${dismissed} dismissed`);
    }

    console.log(`\n✅ Created ${totalReports} realistic reports\n`);

    // ==================== UPDATE MODERATION ACTIVITY ====================
    console.log('📊 Moderation activity data created from actual reports\n');

    // Note: The API endpoint dynamically calculates moderation activity from Report table
    // No separate ModerationActivity table needed

    // ==================== CREATE CONTENT MODERATION RECORDS ====================
    console.log('🤖 Creating AI content moderation records...\n');

    const moderationActions = ['APPROVED', 'FLAGGED', 'REMOVED', 'REVIEW_REQUIRED'];
    const contentTypes = ['POST', 'COMMENT', 'MESSAGE'];
    
    // Create moderation records for some posts and comments
    let moderationCount = 0;

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 84); // Last 12 weeks
      const moderatedAt = new Date();
      moderatedAt.setDate(moderatedAt.getDate() - daysAgo);

      const isPost = Math.random() < 0.5;
      const content = isPost 
        ? posts[Math.floor(Math.random() * posts.length)]
        : comments[Math.floor(Math.random() * comments.length)];

      if (!content) continue;

      // Generate realistic toxicity scores
      // Most content is safe (low toxicity), some is flagged (medium), few are removed (high)
      let toxicityScore: number;
      let action: string;
      let isAppropriate: boolean;

      const rand = Math.random();
      if (rand < 0.7) {
        // 70% safe content
        toxicityScore = Math.random() * 0.3; // 0-0.3
        action = 'APPROVED';
        isAppropriate = true;
      } else if (rand < 0.9) {
        // 20% flagged for review
        toxicityScore = Math.random() * 0.3 + 0.3; // 0.3-0.6
        action = Math.random() < 0.5 ? 'FLAGGED' : 'REVIEW_REQUIRED';
        isAppropriate = false;
      } else {
        // 10% removed
        toxicityScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
        action = 'REMOVED';
        isAppropriate = false;
      }

      const categories = {
        toxicity: toxicityScore,
        severe_toxicity: toxicityScore * 0.5,
        identity_attack: Math.random() * 0.2,
        insult: Math.random() * 0.3,
        profanity: Math.random() * 0.25,
        threat: Math.random() * 0.15
      };

      try {
        await prisma.contentModeration.create({
          data: {
            content: isPost ? (content as any).title : (content as any).content,
            authorId: content.authorId,
            contentType: isPost ? 'POST' : 'COMMENT',
            isAppropriate,
            toxicityScore,
            categories,
            action,
            confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 confidence
            moderatedAt,
            moderatedBy: action === 'REMOVED' ? 'SYSTEM' : null,
            metadata: {
              contentId: content.id,
              automated: action !== 'REMOVED'
            }
          }
        });
        moderationCount++;
      } catch (error) {
        // Skip duplicates
      }
    }

    console.log(`✅ Created ${moderationCount} AI moderation records\n`);

    // ==================== SUMMARY ====================
    console.log('\n✨ ========================================');
    console.log('✨ REALISTIC REPORTS & MODERATION COMPLETE!');
    console.log('✨ ========================================\n');
    
    console.log('📊 SUMMARY:');
    console.log(`   ✅ Total Reports Created: ${totalReports}`);
    console.log(`   ✅ Moderation Activity: 12 weeks of data`);
    console.log(`   ✅ AI Moderation Records: ${moderationCount}`);
    console.log('\n📈 REPORT BREAKDOWN:');
    
    const statusCounts = await prisma.report.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    statusCounts.forEach(({ status, _count }) => {
      console.log(`   • ${status}: ${_count.status} reports`);
    });

    console.log('\n🎯 REPORT CATEGORIES:');
    Object.keys(reportReasons).forEach(category => {
      console.log(`   • ${category.charAt(0).toUpperCase() + category.slice(1)}: Multiple variations`);
    });

    console.log('\n🎉 Admin dashboard now has realistic moderation data!');
    console.log('🎉 View at: http://localhost:3000/admin/analytics\n');

  } catch (error: any) {
    console.error('❌ Error seeding reports and moderation:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRealisticReportsAndModeration();
