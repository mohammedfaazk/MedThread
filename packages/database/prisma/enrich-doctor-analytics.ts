import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Performance tier definitions for realistic variance
const performanceTiers = {
  HIGH: {
    cureRate: { min: 0.85, max: 0.95 },
    conversionRate: { min: 0.25, max: 0.40 },
    portfolioScore: { min: 85, max: 98 },
    satisfactionRating: { min: 4.6, max: 5.0 },
    consultNewDoctorRate: { min: 0.02, max: 0.08 },
    profileViews: { min: 800, max: 1500 },
    followers: { min: 150, max: 300 }
  },
  MODERATE: {
    cureRate: { min: 0.65, max: 0.80 },
    conversionRate: { min: 0.15, max: 0.25 },
    portfolioScore: { min: 65, max: 82 },
    satisfactionRating: { min: 4.0, max: 4.5 },
    consultNewDoctorRate: { min: 0.08, max: 0.15 },
    profileViews: { min: 400, max: 800 },
    followers: { min: 75, max: 150 }
  },
  LOW: {
    cureRate: { min: 0.45, max: 0.65 },
    conversionRate: { min: 0.08, max: 0.15 },
    portfolioScore: { min: 35, max: 60 },
    satisfactionRating: { min: 3.2, max: 3.9 },
    consultNewDoctorRate: { min: 0.20, max: 0.35 },
    profileViews: { min: 150, max: 400 },
    followers: { min: 25, max: 75 }
  }
};

// Doctor performance assignments (realistic distribution)
const doctorPerformanceMap = {
  'dr_sarah_chen': 'HIGH',        // Cardiology - High performer
  'dr_james_thompson': 'HIGH',    // Neurology - High performer  
  'dr_michael_rodriguez': 'MODERATE', // Pediatrics - Moderate
  'dr_emily_watson': 'MODERATE',  // Dermatology - Moderate
  'dr_lisa_patel': 'LOW'          // Orthopedics - Low performer
};

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function enrichDoctorAnalytics() {
  console.log('📊 Starting doctor analytics enrichment...');
  
  try {
    // Get all seeded doctors
    const seededDoctors = await prisma.user.findMany({
      where: {
        bio: {
          startsWith: '[Seeded]'
        },
        role: 'DOCTOR'
      },
      include: {
        posts: true,
        comments: true,
        appointmentsAsDoctor: {
          include: {
            feedback: true
          }
        },
        doctorConversions: true,
        doctorFeedbacks: true
      }
    });

    console.log(`Found ${seededDoctors.length} seeded doctors to enrich`);

    // Get seeded patients for interactions
    const seededPatients = await prisma.user.findMany({
      where: {
        bio: {
          startsWith: '[Seeded]'
        },
        role: 'PATIENT'
      }
    });

    for (const doctor of seededDoctors) {
      const performanceTier = doctorPerformanceMap[doctor.username as keyof typeof doctorPerformanceMap] || 'MODERATE';
      const tierConfig = performanceTiers[performanceTier as keyof typeof performanceTiers];
      
      console.log(`🔧 Enriching ${doctor.username} (${performanceTier} performance)...`);

      // Calculate base consultation numbers
      const totalConsultations = getRandomInt(20, 50);
      const cureRate = getRandomInRange(tierConfig.cureRate.min, tierConfig.cureRate.max);
      const consultNewDoctorRate = getRandomInRange(tierConfig.consultNewDoctorRate.min, tierConfig.consultNewDoctorRate.max);
      
      const curedCount = Math.floor(totalConsultations * cureRate);
      const consultNewDoctorCount = Math.floor(totalConsultations * consultNewDoctorRate);
      const notYetCount = totalConsultations - curedCount - consultNewDoctorCount;

      // Calculate conversion metrics
      const profileViews = getRandomInt(tierConfig.profileViews.min, tierConfig.profileViews.max);
      const conversionRate = getRandomInRange(tierConfig.conversionRate.min, tierConfig.conversionRate.max);
      const messageConversions = Math.floor(profileViews * conversionRate);
      const appointmentConversions = Math.floor(messageConversions * 0.6); // 60% of messages lead to appointments
      const clinicCureCount = Math.floor(appointmentConversions * cureRate);

      // Calculate portfolio score
      const portfolioScore = Math.floor(
        getRandomInRange(tierConfig.portfolioScore.min, tierConfig.portfolioScore.max)
      );

      // Calculate satisfaction rating
      const satisfactionRating = parseFloat(
        getRandomInRange(tierConfig.satisfactionRating.min, tierConfig.satisfactionRating.max).toFixed(1)
      );

      // Generate additional engagement metrics
      const totalUpvotes = getRandomInt(50, 300);
      const followers = getRandomInt(tierConfig.followers.min, tierConfig.followers.max);
      const totalRatings = getRandomInt(15, 80);

      // Create additional patient feedback records
      for (let i = 0; i < Math.min(totalConsultations, seededPatients.length * 3); i++) {
        const patient = seededPatients[i % seededPatients.length];
        const outcomes = ['CURED', 'NOT_YET', 'CONSULT_NEW_DOCTOR'];
        let outcome = outcomes[0]; // Default to CURED
        
        // Distribute outcomes based on calculated rates
        const rand = Math.random();
        if (rand < consultNewDoctorRate) {
          outcome = 'CONSULT_NEW_DOCTOR';
        } else if (rand < consultNewDoctorRate + (notYetCount / totalConsultations)) {
          outcome = 'NOT_YET';
        }

        const wasClinicVisit = Math.random() > 0.4; // 60% clinic visits
        const feedbackDate = new Date();
        feedbackDate.setDate(feedbackDate.getDate() - getRandomInt(1, 90));

        await prisma.patientFeedback.upsert({
          where: {
            id: `seeded_feedback_${doctor.id}_${patient.id}_${i}`
          },
          update: {},
          create: {
            id: `seeded_feedback_${doctor.id}_${patient.id}_${i}`,
            patientId: patient.id,
            doctorId: doctor.id,
            status: outcome,
            feedbackCount: 1,
            lastFeedbackAt: feedbackDate,
            curedAt: outcome === 'CURED' ? feedbackDate : null,
            wasClinicVisit: wasClinicVisit,
            createdAt: feedbackDate
          }
        });
      }

      // Create comment conversion records for existing comments
      const doctorComments = await prisma.comment.findMany({
        where: {
          authorId: doctor.id,
          content: {
            startsWith: '[Seeded]'
          }
        }
      });

      for (const comment of doctorComments) {
        const conversionsForComment = getRandomInt(0, 8); // 0-8 conversions per comment
        
        for (let i = 0; i < conversionsForComment && i < seededPatients.length; i++) {
          const patient = seededPatients[i];
          const shouldMessage = Math.random() < conversionRate;
          
          await prisma.commentConversion.upsert({
            where: {
              id: `seeded_conversion_${comment.id}_${patient.id}`
            },
            update: {},
            create: {
              id: `seeded_conversion_${comment.id}_${patient.id}`,
              commentId: comment.id,
              doctorId: doctor.id,
              patientId: patient.id,
              postId: comment.postId,
              profileVisited: true,
              messageClicked: shouldMessage,
              visitedAt: new Date(),
              messageClickedAt: shouldMessage ? new Date() : null
            }
          });
        }
      }

      // Create doctor ratings
      for (let i = 0; i < totalRatings; i++) {
        const patient = seededPatients[i % seededPatients.length];
        const ratingDate = new Date();
        ratingDate.setDate(ratingDate.getDate() - getRandomInt(1, 180));
        
        // Generate ratings based on performance tier
        const baseRating = satisfactionRating;
        const variance = 0.5;
        const rating = Math.max(1, Math.min(5, 
          baseRating + (Math.random() - 0.5) * variance
        ));

        await prisma.doctorRating.upsert({
          where: {
            id: `seeded_rating_${doctor.id}_${patient.id}_${i}`
          },
          update: {},
          create: {
            id: `seeded_rating_${doctor.id}_${patient.id}_${i}`,
            doctorId: doctor.id,
            patientId: patient.id,
            rating: parseFloat(rating.toFixed(1)),
            helpfulness: getRandomInt(3, 5),
            communication: getRandomInt(3, 5),
            expertise: getRandomInt(4, 5),
            feedback: `[Seeded] ${performanceTier === 'HIGH' ? 'Excellent' : performanceTier === 'MODERATE' ? 'Good' : 'Average'} experience with Dr. ${doctor.username}`,
            createdAt: ratingDate
          }
        });
      }

      // Update doctor performance metrics
      await prisma.doctorPerformance.upsert({
        where: { doctorId: doctor.id },
        update: {
          totalPostsCommented: doctor.posts.length,
          totalCommentsCount: doctor.comments.length,
          conversionCount: messageConversions,
          curedPatientCount: curedCount,
          notYetCount: notYetCount,
          consultNewDoctorCount: consultNewDoctorCount,
          portfolioScore: portfolioScore,
          clinicVisitCount: appointmentConversions,
          postClinicCureCount: clinicCureCount,
          helpfulnessScore: satisfactionRating,
          totalRatings: totalRatings,
          appointmentsCompleted: totalConsultations,
          totalPatientsHelped: curedCount + notYetCount,
          avgResponseTime: getRandomInt(15, 120), // 15-120 minutes
          activeEngagementScore: satisfactionRating,
          lastActiveAt: new Date(),
          totalResponses: doctor.comments.length + doctor.posts.length
        },
        create: {
          doctorId: doctor.id,
          totalPostsCommented: doctor.posts.length,
          totalCommentsCount: doctor.comments.length,
          conversionCount: messageConversions,
          curedPatientCount: curedCount,
          notYetCount: notYetCount,
          consultNewDoctorCount: consultNewDoctorCount,
          portfolioScore: portfolioScore,
          clinicVisitCount: appointmentConversions,
          postClinicCureCount: clinicCureCount,
          helpfulnessScore: satisfactionRating,
          totalRatings: totalRatings,
          appointmentsCompleted: totalConsultations,
          totalPatientsHelped: curedCount + notYetCount,
          avgResponseTime: getRandomInt(15, 120),
          activeEngagementScore: satisfactionRating,
          lastActiveAt: new Date(),
          totalResponses: doctor.comments.length + doctor.posts.length
        }
      });

      // Update user karma and engagement metrics
      await prisma.user.update({
        where: { id: doctor.id },
        data: {
          totalKarma: doctor.totalKarma + totalUpvotes,
          postKarma: doctor.postKarma + Math.floor(totalUpvotes * 0.6),
          commentKarma: doctor.commentKarma + Math.floor(totalUpvotes * 0.4)
        }
      });

      // Create follow relationships
      const followersToCreate = Math.min(followers, seededPatients.length);
      for (let i = 0; i < followersToCreate; i++) {
        const follower = seededPatients[i];
        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: follower.id,
              followingId: doctor.id
            }
          },
          update: {},
          create: {
            followerId: follower.id,
            followingId: doctor.id
          }
        });
      }

      console.log(`✅ ${doctor.username} enriched:`);
      console.log(`   Portfolio Score: ${portfolioScore}/100`);
      console.log(`   Satisfaction: ${satisfactionRating}/5.0`);
      console.log(`   Cure Rate: ${(cureRate * 100).toFixed(1)}%`);
      console.log(`   Conversions: ${messageConversions}`);
      console.log(`   Followers: ${followersToCreate}`);
    }
    // Create user analytics records
    for (const doctor of seededDoctors) {
      const performanceTier = doctorPerformanceMap[doctor.username as keyof typeof doctorPerformanceMap] || 'MODERATE';
      const tierConfig = performanceTiers[performanceTier as keyof typeof performanceTiers];
      
      const profileViews = getRandomInt(tierConfig.profileViews.min, tierConfig.profileViews.max);
      const totalSessions = getRandomInt(50, 200);
      const totalPageViews = profileViews + getRandomInt(100, 500);
      const totalTimeSpent = getRandomInt(3600, 18000); // 1-5 hours in seconds

      await prisma.userAnalytics.upsert({
        where: { userId: doctor.id },
        update: {
          totalSessions: totalSessions,
          totalPageViews: totalPageViews,
          totalTimeSpent: totalTimeSpent,
          postsCreated: doctor.posts.length,
          commentsCreated: doctor.comments.length,
          lastActive: new Date(),
          lastUpdated: new Date()
        },
        create: {
          id: `analytics_${doctor.id}`,
          userId: doctor.id,
          totalSessions: totalSessions,
          totalPageViews: totalPageViews,
          totalTimeSpent: totalTimeSpent,
          postsCreated: doctor.posts.length,
          commentsCreated: doctor.comments.length,
          lastActive: new Date(),
          lastUpdated: new Date()
        }
      });
    }

    // Create post analytics for seeded posts
    const seededPosts = await prisma.post.findMany({
      where: {
        title: {
          startsWith: '[Seeded]'
        }
      }
    });

    for (const post of seededPosts) {
      const views = getRandomInt(50, 500);
      const uniqueViews = Math.floor(views * 0.7); // 70% unique views
      const clicks = Math.floor(views * 0.1); // 10% click rate
      const shares = getRandomInt(0, 20);
      const avgTimeSpent = getRandomInt(30, 300); // 30 seconds to 5 minutes
      const bounceRate = getRandomInRange(0.2, 0.8);

      await prisma.postAnalytics.upsert({
        where: {
          id: `post_analytics_${post.id}`
        },
        update: {
          views: views,
          uniqueViews: uniqueViews,
          clicks: clicks,
          shares: shares,
          avgTimeSpent: avgTimeSpent,
          bounceRate: bounceRate,
          lastUpdated: new Date()
        },
        create: {
          id: `post_analytics_${post.id}`,
          postId: post.id,
          views: views,
          uniqueViews: uniqueViews,
          clicks: clicks,
          shares: shares,
          avgTimeSpent: avgTimeSpent,
          bounceRate: bounceRate,
          lastUpdated: new Date()
        }
      });
    }

    // Update community activity based on enriched data
    const communities = await prisma.community.findMany({
      where: {
        name: {
          in: ['cardiology', 'pediatrics', 'dermatology', 'neurology', 'orthopedics']
        }
      }
    });

    for (const community of communities) {
      const postCount = await prisma.post.count({
        where: { 
          communityId: community.id,
          title: { startsWith: '[Seeded]' }
        }
      });
      
      const commentCount = await prisma.comment.count({
        where: {
          post: { communityId: community.id },
          content: { startsWith: '[Seeded]' }
        }
      });
      
      const memberCount = await prisma.communityMember.count({
        where: { communityId: community.id }
      });
      
      const avgPostsPerDay = postCount / 30;
      const avgCommentsPerPost = postCount > 0 ? commentCount / postCount : 0;
      
      let activityTier = 'INACTIVE';
      if (avgPostsPerDay > 1.5) activityTier = 'HIGHLY_ACTIVE';
      else if (avgPostsPerDay > 0.3) activityTier = 'MODERATELY_ACTIVE';
      
      await prisma.communityActivity.upsert({
        where: { communityId: community.id },
        update: {
          activityTier,
          totalPosts: postCount,
          totalComments: commentCount,
          totalMembers: memberCount,
          avgPostsPerDay,
          avgCommentsPerPost,
          lastActivityAt: new Date(),
          calculatedAt: new Date()
        },
        create: {
          communityId: community.id,
          activityTier,
          totalPosts: postCount,
          totalComments: commentCount,
          totalMembers: memberCount,
          avgPostsPerDay,
          avgCommentsPerPost,
          lastActivityAt: new Date(),
          calculatedAt: new Date()
        }
      });
    }

    console.log('✅ Analytics enrichment completed successfully!');
    console.log('');
    console.log('📊 Summary of enriched data:');
    console.log(`   • ${seededDoctors.length} doctors with full performance metrics`);
    console.log(`   • Realistic variance across performance tiers`);
    console.log(`   • Comment-level conversion tracking`);
    console.log(`   • Patient feedback and outcome data`);
    console.log(`   • Doctor ratings and reviews`);
    console.log(`   • User analytics and engagement metrics`);
    console.log(`   • Post analytics with view/click data`);
    console.log(`   • Updated community activity metrics`);
    console.log('');
    console.log('🎯 Performance Distribution:');
    console.log('   • HIGH performers: dr_sarah_chen, dr_james_thompson');
    console.log('   • MODERATE performers: dr_michael_rodriguez, dr_emily_watson');
    console.log('   • LOW performer: dr_lisa_patel');
    console.log('');
    console.log('📈 Ready for comprehensive analytics testing!');
    
  } catch (error) {
    console.error('❌ Error enriching doctor analytics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enrichment function
if (require.main === module) {
  enrichDoctorAnalytics()
    .catch((error) => {
      console.error('❌ Analytics enrichment failed:', error);
      process.exit(1);
    });
}

export { enrichDoctorAnalytics };