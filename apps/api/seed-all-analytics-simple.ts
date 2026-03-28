import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedAllAnalytics() {
  console.log('🌱 Seeding comprehensive analytics data for ALL graphs...\n');

  try {
    // Get existing users and communities
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR', verified: true },
      take: 20
    });

    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 50
    });

    const communities = await prisma.community.findMany({ take: 10 });

    if (doctors.length === 0 || patients.length === 0) {
      console.error('❌ Not enough users. Run: npx tsx apps/api/src/scripts/comprehensive-seed.ts');
      return;
    }

    console.log(`✅ Found ${doctors.length} doctors, ${patients.length} patients, ${communities.length} communities\n`);

    // ==================== DOCTOR PROFILE ANALYTICS ====================
    console.log('👨‍⚕️ Seeding doctor profile analytics...\n');

    for (const doctor of doctors) {
      console.log(`   Processing ${doctor.username}...`);

      // 1. Treatment Outcomes (PatientFeedback)
      const outcomes = [
        { status: 'CURED', count: Math.floor(Math.random() * 30) + 40 },
        { status: 'NOT_YET', count: Math.floor(Math.random() * 20) + 20 },
        { status: 'SWITCHED_DOCTOR', count: Math.floor(Math.random() * 8) + 5 }
      ];

      for (const outcome of outcomes) {
        for (let i = 0; i < outcome.count; i++) {
          const daysAgo = Math.floor(Math.random() * 180);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          await prisma.patientFeedback.create({
            data: {
              doctorId: doctor.id,
              patientId: patients[i % patients.length].id,
              status: outcome.status as any,
              wasClinicVisit: Math.random() > 0.5,
              createdAt,
              curedAt: outcome.status === 'CURED' ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null
            }
          });
        }
      }

      // 2. Posts Over Time (Last 12 months)
      for (let month = 0; month < 12; month++) {
        const postsCount = Math.floor(Math.random() * 12) + 8;
        
        for (let i = 0; i < postsCount; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          await prisma.post.create({
            data: {
              title: `Medical Insight: ${Math.random().toString(36).substring(7)}`,
              content: `Professional medical content about health topics. This post provides valuable information to patients.`,
              authorId: doctor.id,
              communityId: communities[Math.floor(Math.random() * communities.length)].id,
              createdAt: date
            }
          });
        }
      }

      // 3. Comments Over Time (Last 12 months)
      const allPosts = await prisma.post.findMany({ take: 200 });
      for (let month = 0; month < 12; month++) {
        const commentsCount = Math.floor(Math.random() * 25) + 20;
        
        for (let i = 0; i < commentsCount; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          await prisma.comment.create({
            data: {
              content: `Professional medical advice and guidance. ${Math.random().toString(36).substring(7)}`,
              authorId: doctor.id,
              postId: allPosts[Math.floor(Math.random() * allPosts.length)].id,
              createdAt: date
            }
          });
        }
      }

      // 4. Conversion Rate Data (CommentConversion)
      for (let month = 0; month < 12; month++) {
        const total = Math.floor(Math.random() * 50) + 40;
        const converted = Math.floor(total * (Math.random() * 0.3 + 0.5)); // 50-80% conversion

        for (let i = 0; i < total; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          await prisma.commentConversion.create({
            data: {
              commentId: `comment-${Math.random().toString(36).substring(7)}`,
              doctorId: doctor.id,
              patientId: patients[i % patients.length].id,
              postId: allPosts[Math.floor(Math.random() * allPosts.length)].id,
              messageClicked: i < converted,
              createdAt: date
            }
          });
        }
      }

      // 5. Doctor Performance (Portfolio Score)
      await prisma.doctorPerformance.upsert({
        where: { doctorId: doctor.id },
        create: {
          doctorId: doctor.id,
          portfolioScore: Math.floor(Math.random() * 20) + 75, // 75-95
          responseTime: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
          patientSatisfaction: parseFloat((Math.random() * 1 + 4).toFixed(1)), // 4.0-5.0
          treatmentSuccessRate: Math.floor(Math.random() * 15) + 80, // 80-95%
          updatedAt: new Date()
        },
        update: {
          portfolioScore: Math.floor(Math.random() * 20) + 75,
          responseTime: Math.floor(Math.random() * 20) + 10,
          patientSatisfaction: parseFloat((Math.random() * 1 + 4).toFixed(1)),
          treatmentSuccessRate: Math.floor(Math.random() * 15) + 80,
          updatedAt: new Date()
        }
      });
    }

    console.log(`✅ Created profile analytics for ${doctors.length} doctors\n`);

    // ==================== COMMUNITY ANALYTICS ====================
    console.log('🌐 Seeding community analytics...\n');

    // Support Groups - Create posts with comments and votes
    console.log('   Creating Support Group data...');
    const healthCommunity = communities.find(c => c.displayName.includes('Health')) || communities[0];
    
    for (let i = 0; i < 40; i++) {
      const author = patients[i % patients.length];
      const post = await prisma.post.create({
        data: {
          title: `Support Discussion: ${i + 1}`,
          content: `Sharing my health journey and seeking support from the community. Let's help each other!`,
          authorId: author.id,
          communityId: healthCommunity.id
        }
      });

      // Add 2-4 comments per post
      const commentCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < commentCount; j++) {
        await prisma.comment.create({
          data: {
            content: `Supportive comment and encouragement. Stay strong! ${j + 1}`,
            postId: post.id,
            authorId: patients[(i + j + 5) % patients.length].id
          }
        });
      }

      // Add votes (interactions)
      const voteCount = Math.floor(Math.random() * 6) + 3;
      for (let j = 0; j < voteCount; j++) {
        try {
          await prisma.vote.create({
            data: {
              postId: post.id,
              userId: patients[(i + j + 10) % patients.length].id,
              value: Math.random() > 0.15 ? 1 : -1
            }
          });
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    console.log('   ✅ Created 40 support group posts with comments and votes\n');

    // Q&A Forum - Questions and Answers
    console.log('   Creating Q&A Forum data...');
    for (let i = 0; i < 55; i++) {
      const author = patients[i % patients.length];
      const question = await prisma.forumQuestion.create({
        data: {
          title: `Health Question ${i + 1}: Seeking Medical Advice`,
          content: `I have a question about my health condition. Can someone help me understand this better?`,
          authorId: author.id,
          tags: ['health', 'question', 'advice', 'medical'],
          upvotes: Math.floor(Math.random() * 20)
        }
      });

      // Add 2-4 answers per question
      const answerCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < answerCount; j++) {
        const answerer = j % 2 === 0 ? doctors[j % doctors.length] : patients[(i + j + 3) % patients.length];
        await prisma.forumAnswer.create({
          data: {
            content: `Here's my detailed answer based on medical knowledge and experience. ${j + 1}`,
            questionId: question.id,
            authorId: answerer.id,
            upvotes: Math.floor(Math.random() * 12),
            isAccepted: j === 0 && Math.random() > 0.4
          }
        });
      }
    }
    console.log('   ✅ Created 55 Q&A questions with answers\n');

    // Health Challenges
    console.log('   Creating Health Challenge data...');
    const challengeTypes = ['EXERCISE', 'DIET', 'MEDITATION', 'SLEEP', 'HYDRATION'];
    
    for (let i = 0; i < 30; i++) {
      const creator = i % 3 === 0 ? doctors[i % doctors.length] : patients[i % patients.length];
      const challenge = await prisma.healthChallenge.create({
        data: {
          title: `${challengeTypes[i % challengeTypes.length]} Challenge ${i + 1}`,
          description: `Join this 30-day challenge to improve your ${challengeTypes[i % challengeTypes.length].toLowerCase()} and overall health!`,
          type: challengeTypes[i % challengeTypes.length] as any,
          duration: '30 days',
          goal: Math.floor(Math.random() * 500) + 100,
          unit: challengeTypes[i % challengeTypes.length] === 'EXERCISE' ? 'steps' : 'points',
          createdBy: creator.id,
          participants: [],
          rewards: [],
          leaderboard: [],
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      });

      // Add participants
      const participantCount = Math.floor(Math.random() * 12) + 5;
      for (let j = 0; j < participantCount; j++) {
        try {
          await prisma.challengeParticipant.create({
            data: {
              challengeId: challenge.id,
              userId: patients[(i + j) % patients.length].id,
              progress: Math.floor(Math.random() * 100)
            }
          });
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    console.log('   ✅ Created 30 health challenges with participants\n');

    // Success Stories
    console.log('   Creating Success Story data...');
    const conditions = ['Weight Loss', 'Diabetes Management', 'Anxiety', 'Chronic Pain', 'Heart Health', 'Depression', 'Arthritis'];
    
    for (let i = 0; i < 35; i++) {
      const author = patients[i % patients.length];
      const story = await prisma.successStory.create({
        data: {
          title: `My Journey with ${conditions[i % conditions.length]}`,
          condition: conditions[i % conditions.length],
          story: `This is my inspiring story about overcoming ${conditions[i % conditions.length]}. It took dedication, support, and the right medical guidance, but I made it! I hope my story inspires others facing similar challenges.`,
          authorId: author.id,
          likes: Math.floor(Math.random() * 60) + 15,
          status: 'APPROVED'
        }
      });

      // Add comments
      const commentCount = Math.floor(Math.random() * 6) + 3;
      for (let j = 0; j < commentCount; j++) {
        await prisma.storyComment.create({
          data: {
            content: `This is so inspiring! Thank you for sharing your journey. ${j + 1}`,
            storyId: story.id,
            authorId: patients[(i + j + 7) % patients.length].id
          }
        });
      }
    }
    console.log('   ✅ Created 35 success stories with comments\n');

    // ==================== SUMMARY ====================
    
    console.log('\n✨ ========================================');
    console.log('✨ COMPREHENSIVE ANALYTICS SEEDING COMPLETE!');
    console.log('✨ ========================================\n');
    
    console.log('📊 DOCTOR PROFILE ANALYTICS (per doctor):');
    console.log('   ✅ Treatment outcomes (65-80 records each)');
    console.log('   ✅ Posts over time (96-144 posts, 12 months)');
    console.log('   ✅ Comments over time (240-300 comments, 12 months)');
    console.log('   ✅ Conversion rates (480-600 records, 12 months)');
    console.log('   ✅ Portfolio scores (75-95 range)\n');

    console.log('🌐 COMMUNITY ANALYTICS:');
    console.log('   ✅ Support Groups: 40 posts with comments & votes');
    console.log('   ✅ Q&A Forum: 55 questions with multiple answers');
    console.log('   ✅ Health Challenges: 30 challenges with participants');
    console.log('   ✅ Success Stories: 35 stories with comments\n');

    console.log('🎉 All graphs now have realistic, meaningful data!');
    console.log('🎉 Data works with both mock and real data scenarios');
    console.log('🎉 Run the app and check all analytics pages!\n');

  } catch (error: any) {
    console.error('❌ Error seeding analytics:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllAnalytics();
