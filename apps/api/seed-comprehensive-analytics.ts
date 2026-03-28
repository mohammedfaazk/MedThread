import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedComprehensiveAnalytics() {
  console.log('🌱 Starting comprehensive analytics data seeding...\n');

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

    // ==================== ADMIN ANALYTICS DATA ====================
    
    // 1. User Activity by Time of Day (Last 7 days) - Using existing UserActivityLog model
    console.log('⏰ Creating user activity time data...');
    const now = new Date();
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Peak hours: 9-11 AM and 6-8 PM
        const isPeakHour = (hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 20);
        const baseActivity = isPeakHour ? 15 : 5;
        
        const doctorCount = Math.floor(Math.random() * baseActivity) + (isPeakHour ? 10 : 2);
        const patientCount = Math.floor(Math.random() * (baseActivity * 2)) + (isPeakHour ? 20 : 5);

        // Create activity logs for doctors
        for (let i = 0; i < doctorCount; i++) {
          const doctor = doctors[i % doctors.length];
          await prisma.userActivityLog.create({
            data: {
              userId: doctor.id,
              activityType: 'LOGIN',
              hourOfDay: hour,
              dayOfWeek: (day + now.getDay()) % 7,
              metadata: { role: 'DOCTOR' }
            }
          });
        }

        // Create activity logs for patients
        for (let i = 0; i < patientCount; i++) {
          const patient = patients[i % patients.length];
          await prisma.userActivityLog.create({
            data: {
              userId: patient.id,
              activityType: 'LOGIN',
              hourOfDay: hour,
              dayOfWeek: (day + now.getDay()) % 7,
              metadata: { role: 'PATIENT' }
            }
          });
        }
      }
    }
    console.log('✅ Created user activity time records\n');

    // 2. User Registrations (Last 12 months)
    console.log('📊 Creating user registration data...');
    for (let month = 0; month < 12; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      
      const doctorCount = Math.floor(Math.random() * 15) + 10; // 10-25 doctors/month
      const patientCount = Math.floor(Math.random() * 80) + 50; // 50-130 patients/month

      await prisma.userRegistration.create({
        data: {
          month: date.toISOString().substring(0, 7), // YYYY-MM format
          doctors: doctorCount,
          patients: patientCount,
          total: doctorCount + patientCount
        }
      });
    }
    console.log('✅ Created 12 months of registration data\n');

    // 3. Treatment Outcomes
    console.log('🏥 Creating treatment outcome data...');
    const outcomes = [
      { name: 'Improved', value: 245, color: '#1ecb6b' },
      { name: 'Stable', value: 128, color: '#669ae3' },
      { name: 'Worsened', value: 32, color: '#ff4d6a' },
      { name: 'Unknown', value: 45, color: '#f5a623' }
    ];

    for (const outcome of outcomes) {
      await prisma.treatmentOutcome.create({
        data: {
          name: outcome.name,
          value: outcome.value,
          color: outcome.color
        }
      });
    }
    console.log('✅ Created treatment outcome data\n');

    // 4. Post Priority Distribution (Last 6 months)
    console.log('📝 Creating post priority data...');
    const priorities = [
      { name: 'LOW', value: 342, color: '#1ecb6b' },
      { name: 'MEDIUM', value: 189, color: '#f5a623' },
      { name: 'HIGH', value: 67, color: '#ff4d6a' },
      { name: 'URGENT', value: 23, color: '#dc2626' }
    ];

    for (const priority of priorities) {
      await prisma.postPriority.create({
        data: {
          name: priority.name,
          value: priority.value,
          color: priority.color
        }
      });
    }
    console.log('✅ Created post priority data\n');

    // 5. Doctor Activity by Community
    console.log('👨‍⚕️ Creating doctor activity by community...');
    const communities = await prisma.community.findMany({ take: 8 });
    
    for (const community of communities) {
      const posts = Math.floor(Math.random() * 50) + 20;
      const comments = Math.floor(Math.random() * 120) + 40;

      await prisma.doctorCommunityActivity.create({
        data: {
          communityId: community.id,
          name: community.displayName,
          posts,
          comments,
          total: posts + comments
        }
      });
    }
    console.log(`✅ Created activity data for ${communities.length} communities\n`);

    // 6. Community Engagement Scores (Dead Forums Detection)
    console.log('📉 Creating community engagement scores...');
    for (const community of communities) {
      const engagementScore = Math.floor(Math.random() * 100);
      const lastActivity = new Date();
      lastActivity.setDate(lastActivity.getDate() - Math.floor(Math.random() * 30));

      await prisma.communityEngagement.create({
        data: {
          communityId: community.id,
          name: community.displayName,
          engagementScore,
          lastActivity,
          isDead: engagementScore < 20
        }
      });
    }
    console.log('✅ Created engagement scores\n');

    // 7. Appointment Conversion Rates
    console.log('📅 Creating appointment conversion data...');
    for (const doctor of doctors.slice(0, 15)) {
      const totalChats = Math.floor(Math.random() * 100) + 50;
      const appointments = Math.floor(totalChats * (Math.random() * 0.4 + 0.3)); // 30-70% conversion
      const conversionRate = Math.round((appointments / totalChats) * 100);

      await prisma.appointmentConversion.create({
        data: {
          doctorId: doctor.id,
          name: doctor.fullName || doctor.username,
          totalChats,
          appointments,
          conversionRate
        }
      });
    }
    console.log('✅ Created conversion data for 15 doctors\n');

    // 8. Moderation Activity (Last 12 weeks)
    console.log('🛡️ Creating moderation activity data...');
    for (let week = 0; week < 12; week++) {
      const filed = Math.floor(Math.random() * 25) + 10;
      const resolved = Math.floor(filed * 0.7);
      const dismissed = filed - resolved;

      await prisma.moderationActivity.create({
        data: {
          week: `Week ${12 - week}`,
          filed,
          resolved,
          dismissed
        }
      });
    }
    console.log('✅ Created 12 weeks of moderation data\n');

    // 9. Revenue Data (Last 12 months)
    console.log('💰 Creating revenue data...');
    for (let month = 0; month < 12; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      
      const consultations = Math.floor(Math.random() * 15000) + 10000;
      const subscriptions = Math.floor(Math.random() * 8000) + 5000;
      const advertisements = Math.floor(Math.random() * 3000) + 1000;
      const total = consultations + subscriptions + advertisements;

      await prisma.revenue.create({
        data: {
          month: date.toISOString().substring(0, 7),
          consultations,
          subscriptions,
          advertisements,
          total
        }
      });
    }
    console.log('✅ Created 12 months of revenue data\n');

    // ==================== DOCTOR PROFILE ANALYTICS ====================
    
    console.log('👨‍⚕️ Creating doctor profile analytics for all doctors...\n');
    
    for (const doctor of doctors) {
      console.log(`   Processing ${doctor.username}...`);

      // Treatment Outcomes for each doctor
      const cured = Math.floor(Math.random() * 50) + 30;
      const notYet = Math.floor(Math.random() * 30) + 15;
      const switched = Math.floor(Math.random() * 10) + 3;

      for (let i = 0; i < cured + notYet + switched; i++) {
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        let status = 'CURED';
        if (i >= cured && i < cured + notYet) status = 'NOT_YET';
        if (i >= cured + notYet) status = 'SWITCHED_DOCTOR';

        const curedAt = status === 'CURED' ? new Date(createdAt.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)) : null;

        await prisma.patientFeedback.create({
          data: {
            doctorId: doctor.id,
            patientId: patients[i % patients.length].id,
            status: status as any,
            wasClinicVisit: Math.random() > 0.5,
            createdAt,
            curedAt
          }
        });
      }

      // Posts Over Time (Last 12 months)
      for (let month = 0; month < 12; month++) {
        const postsCount = Math.floor(Math.random() * 15) + 5;
        
        for (let i = 0; i < postsCount; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          await prisma.post.create({
            data: {
              title: `Medical Post ${Math.random().toString(36).substring(7)}`,
              content: 'Medical content for analytics',
              authorId: doctor.id,
              communityId: communities[Math.floor(Math.random() * communities.length)].id,
              createdAt: date
            }
          });
        }
      }

      // Comments Over Time (Last 12 months)
      const allPosts = await prisma.post.findMany({ take: 100 });
      for (let month = 0; month < 12; month++) {
        const commentsCount = Math.floor(Math.random() * 30) + 15;
        
        for (let i = 0; i < commentsCount; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(Math.floor(Math.random() * 28) + 1);

          await prisma.comment.create({
            data: {
              content: `Medical comment ${Math.random().toString(36).substring(7)}`,
              authorId: doctor.id,
              postId: allPosts[Math.floor(Math.random() * allPosts.length)].id,
              createdAt: date
            }
          });
        }
      }

      // Conversion Rate Data (Last 12 months)
      for (let month = 0; month < 12; month++) {
        const total = Math.floor(Math.random() * 60) + 30;
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

      // Doctor Performance (Portfolio Score)
      const portfolioScore = Math.floor(Math.random() * 20) + 75; // 75-95
      const responseTime = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
      const patientSatisfaction = (Math.random() * 1 + 4).toFixed(1); // 4.0-5.0
      const treatmentSuccessRate = Math.floor(Math.random() * 15) + 80; // 80-95%

      await prisma.doctorPerformance.upsert({
        where: { doctorId: doctor.id },
        create: {
          doctorId: doctor.id,
          portfolioScore,
          responseTime,
          patientSatisfaction: parseFloat(patientSatisfaction),
          treatmentSuccessRate,
          updatedAt: new Date()
        },
        update: {
          portfolioScore,
          responseTime,
          patientSatisfaction: parseFloat(patientSatisfaction),
          treatmentSuccessRate,
          updatedAt: new Date()
        }
      });
    }
    console.log(`✅ Created profile analytics for ${doctors.length} doctors\n`);

    // ==================== COMMUNITY ANALYTICS ====================
    
    console.log('🌐 Creating community analytics data...\n');

    // Support Groups
    const healthCommunity = communities.find(c => c.displayName.includes('Health')) || communities[0];
    console.log('   Creating Support Group data...');
    for (let i = 0; i < 35; i++) {
      const author = patients[i % patients.length];
      const post = await prisma.post.create({
        data: {
          title: `Support Discussion ${i + 1}`,
          content: 'Support group discussion content',
          authorId: author.id,
          communityId: healthCommunity.id
        }
      });

      // Add 2-3 comments per post
      const commentCount = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < commentCount; j++) {
        await prisma.comment.create({
          data: {
            content: `Support comment ${j + 1}`,
            postId: post.id,
            authorId: patients[(i + j) % patients.length].id
          }
        });
      }

      // Add votes
      const voteCount = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < voteCount; j++) {
        try {
          await prisma.vote.create({
            data: {
              postId: post.id,
              userId: patients[(i + j + 10) % patients.length].id,
              value: Math.random() > 0.2 ? 1 : -1
            }
          });
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    console.log('   ✅ Created 35 support group posts with comments and votes\n');

    // Q&A Forum
    console.log('   Creating Q&A Forum data...');
    for (let i = 0; i < 50; i++) {
      const author = patients[i % patients.length];
      const question = await prisma.forumQuestion.create({
        data: {
          title: `Health Question ${i + 1}`,
          content: `Detailed health question about topic ${i + 1}`,
          authorId: author.id,
          tags: ['health', 'question', 'advice'],
          upvotes: Math.floor(Math.random() * 15)
        }
      });

      // Add 2-3 answers per question
      const answerCount = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < answerCount; j++) {
        const answerer = j % 2 === 0 ? doctors[j % doctors.length] : patients[(i + j) % patients.length];
        await prisma.forumAnswer.create({
          data: {
            content: `Detailed answer to question ${i + 1}`,
            questionId: question.id,
            authorId: answerer.id,
            upvotes: Math.floor(Math.random() * 10),
            isAccepted: j === 0 && Math.random() > 0.5
          }
        });
      }
    }
    console.log('   ✅ Created 50 Q&A questions with answers\n');

    // Health Challenges
    console.log('   Creating Health Challenge data...');
    const challengeTypes = ['EXERCISE', 'DIET', 'MEDITATION', 'SLEEP', 'HYDRATION'];
    for (let i = 0; i < 25; i++) {
      const creator = i % 3 === 0 ? doctors[i % doctors.length] : patients[i % patients.length];
      const challenge = await prisma.healthChallenge.create({
        data: {
          title: `${challengeTypes[i % challengeTypes.length]} Challenge ${i + 1}`,
          description: `Join this health challenge to improve your ${challengeTypes[i % challengeTypes.length].toLowerCase()}`,
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
      const participantCount = Math.floor(Math.random() * 10) + 5;
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
    console.log('   ✅ Created 25 health challenges with participants\n');

    // Success Stories
    console.log('   Creating Success Story data...');
    const conditions = ['Weight Loss', 'Diabetes Management', 'Anxiety', 'Chronic Pain', 'Heart Health'];
    for (let i = 0; i < 30; i++) {
      const author = patients[i % patients.length];
      const story = await prisma.successStory.create({
        data: {
          title: `My Journey with ${conditions[i % conditions.length]}`,
          condition: conditions[i % conditions.length],
          story: `This is my inspiring story about overcoming ${conditions[i % conditions.length]}. It took time and effort, but I made it!`,
          authorId: author.id,
          likes: Math.floor(Math.random() * 50) + 10,
          status: 'APPROVED'
        }
      });

      // Add comments
      const commentCount = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < commentCount; j++) {
        await prisma.storyComment.create({
          data: {
            content: `Inspiring story! Comment ${j + 1}`,
            storyId: story.id,
            authorId: patients[(i + j + 5) % patients.length].id
          }
        });
      }
    }
    console.log('   ✅ Created 30 success stories with comments\n');

    // ==================== SUMMARY ====================
    
    console.log('\n✨ ========================================');
    console.log('✨ COMPREHENSIVE ANALYTICS SEEDING COMPLETE!');
    console.log('✨ ========================================\n');
    
    console.log('📊 ADMIN ANALYTICS:');
    console.log('   ✅ User Activity Time: 168 records (7 days × 24 hours)');
    console.log('   ✅ User Registrations: 12 months');
    console.log('   ✅ Treatment Outcomes: 4 categories');
    console.log('   ✅ Post Priorities: 4 levels');
    console.log(`   ✅ Doctor Community Activity: ${communities.length} communities`);
    console.log(`   ✅ Community Engagement: ${communities.length} communities`);
    console.log('   ✅ Appointment Conversions: 15 doctors');
    console.log('   ✅ Moderation Activity: 12 weeks');
    console.log('   ✅ Revenue Data: 12 months\n');

    console.log('👨‍⚕️ DOCTOR PROFILE ANALYTICS:');
    console.log(`   ✅ ${doctors.length} doctors with complete analytics`);
    console.log('   ✅ Treatment outcomes per doctor');
    console.log('   ✅ Posts over time (12 months)');
    console.log('   ✅ Comments over time (12 months)');
    console.log('   ✅ Conversion rates (12 months)');
    console.log('   ✅ Portfolio scores\n');

    console.log('🌐 COMMUNITY ANALYTICS:');
    console.log('   ✅ Support Groups: 35 posts with comments & votes');
    console.log('   ✅ Q&A Forum: 50 questions with answers');
    console.log('   ✅ Health Challenges: 25 challenges with participants');
    console.log('   ✅ Success Stories: 30 stories with comments\n');

    console.log('🎉 All graphs now have realistic data!');
    console.log('🎉 Data supports both mock and real data scenarios\n');

  } catch (error: any) {
    console.error('❌ Error seeding comprehensive analytics:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComprehensiveAnalytics();
