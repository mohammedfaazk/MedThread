#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupNewFeatures() {
  console.log('🚀 Setting up new features...');

  try {
    // 1. Seed some test posts with priority analysis
    console.log('📝 Creating test posts with priority analysis...');
    
    const testPosts = [
      {
        title: "Severe chest pain and difficulty breathing",
        content: "I've been experiencing severe chest pain for the last 2 hours along with difficulty breathing. The pain is sharp and gets worse when I move. Should I be worried?",
        priority: "HIGH",
        urgencyScore: 9,
        symptoms: ["chest pain", "difficulty breathing", "severe pain"]
      },
      {
        title: "Persistent cough and fatigue for a week",
        content: "I've had a persistent cough for about a week now, along with general fatigue and body aches. No fever though. What could this be?",
        priority: "MEDIUM",
        urgencyScore: 5,
        symptoms: ["persistent cough", "fatigue", "body ache"]
      },
      {
        title: "Common cold symptoms - runny nose and sneezing",
        content: "I have a runny nose and have been sneezing a lot since yesterday. It's probably just a cold but wanted to check if there's anything I should do.",
        priority: "LOW",
        urgencyScore: 2,
        symptoms: ["runny nose", "sneezing", "cold"]
      },
      {
        title: "High fever and severe headache",
        content: "I woke up with a high fever (102°F) and a severe headache. I also feel nauseous and dizzy. This came on suddenly overnight.",
        priority: "HIGH",
        urgencyScore: 8,
        symptoms: ["high fever", "severe headache", "nausea", "dizziness"]
      },
      {
        title: "Joint pain and morning stiffness",
        content: "I've been experiencing joint pain in my knees and wrists, especially in the morning. The stiffness lasts for about an hour after waking up.",
        priority: "MEDIUM",
        urgencyScore: 4,
        symptoms: ["joint pain", "morning stiffness"]
      }
    ];

    // Get a test user (patient) to create posts
    const testUser = await prisma.user.findFirst({
      where: { role: 'PATIENT' }
    });

    if (!testUser) {
      console.log('⚠️ No patient users found. Creating a test patient...');
      const newUser = await prisma.user.create({
        data: {
          email: 'testpatient@example.com',
          username: 'test_patient',
          passwordHash: 'dummy_hash',
          role: 'PATIENT',
          pincode: '600094' // Chennai
        }
      });
      testUser = newUser;
    }

    // Get a test community
    let testCommunity = await prisma.community.findFirst();
    if (!testCommunity) {
      testCommunity = await prisma.community.create({
        data: {
          name: 'general',
          displayName: 'General Health',
          description: 'General health discussions'
        }
      });
    }

    for (const postData of testPosts) {
      // Create post
      const post = await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          authorId: testUser.id,
          communityId: testCommunity.id
        }
      });

      // Create priority analysis
      await prisma.postPriority.create({
        data: {
          postId: post.id,
          priorityLevel: postData.priority,
          urgencyScore: postData.urgencyScore,
          detectedSymptoms: postData.symptoms.map(symptom => ({
            symptom,
            weight: postData.urgencyScore,
            category: postData.priority
          }))
        }
      });

      // Create symptom report for regional analytics
      await prisma.symptomReport.create({
        data: {
          userId: testUser.id,
          postId: post.id,
          symptoms: postData.symptoms,
          detectedSymptoms: postData.symptoms.map(s => ({ symptom: s, confidence: 0.8 })),
          location: {
            pincode: '600094',
            city: 'Chennai',
            district: 'Chennai District',
            state: 'Tamil Nadu',
            country: 'India'
          },
          pincode: '600094',
          city: 'Chennai',
          district: 'Chennai District',
          state: 'Tamil Nadu',
          country: 'India',
          severity: postData.priority,
          reportedAt: new Date()
        }
      });

      console.log(`✅ Created post: "${postData.title}" with ${postData.priority} priority`);
    }

    // 2. Create some test doctor performance data
    console.log('👨‍⚕️ Setting up doctor performance data...');
    
    const testDoctor = await prisma.user.findFirst({
      where: { role: { in: ['DOCTOR', 'VERIFIED_DOCTOR'] } }
    });

    if (testDoctor) {
      await prisma.doctorPerformance.upsert({
        where: { doctorId: testDoctor.id },
        create: {
          doctorId: testDoctor.id,
          totalResponses: 45,
          totalPatientsHelped: 32,
          avgResponseTime: 120, // 2 hours
          helpfulnessScore: 4.7,
          totalRatings: 28,
          appointmentsCompleted: 15,
          appointmentsCancelled: 2,
          totalPostsCommented: 45,
          totalCommentsCount: 67,
          conversionCount: 12,
          curedPatientCount: 28,
          notYetCount: 8,
          consultNewDoctorCount: 3,
          portfolioScore: 85,
          clinicVisitCount: 15,
          postClinicCureCount: 12
        },
        update: {
          totalResponses: 45,
          totalPatientsHelped: 32,
          avgResponseTime: 120,
          helpfulnessScore: 4.7,
          portfolioScore: 85
        }
      });

      console.log(`✅ Created performance data for doctor: ${testDoctor.username}`);
    }

    // 3. Create some test user activity logs
    console.log('📊 Creating user activity logs...');
    
    const users = await prisma.user.findMany({ take: 5 });
    
    for (const user of users) {
      // Create activity logs for the last 30 days
      const activities = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        
        // Random activities throughout the day
        for (let hour = 0; hour < 24; hour++) {
          if (Math.random() > 0.7) { // 30% chance of activity each hour
            activities.push({
              userId: user.id,
              activityType: ['POST', 'COMMENT', 'MESSAGE', 'VOTE'][Math.floor(Math.random() * 4)],
              hourOfDay: hour,
              dayOfWeek: date.getDay(),
              createdAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(Math.random() * 60))
            });
          }
        }
      }

      await prisma.userActivityLog.createMany({
        data: activities,
        skipDuplicates: true
      });

      console.log(`✅ Created ${activities.length} activity logs for user: ${user.username}`);
    }

    // 4. Create some regional symptom data for different cities
    console.log('🗺️ Creating regional symptom data...');
    
    const cities = [
      { pincode: '110001', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi' },
      { pincode: '400001', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra' },
      { pincode: '560001', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka' },
      { pincode: '700001', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' },
      { pincode: '500001', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana' }
    ];

    const commonSymptoms = ['fever', 'cough', 'cold', 'headache', 'fatigue', 'body ache', 'sore throat'];

    for (const city of cities) {
      for (let i = 0; i < 20; i++) {
        const randomSymptoms = commonSymptoms
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);

        await prisma.symptomReport.create({
          data: {
            symptoms: randomSymptoms,
            detectedSymptoms: randomSymptoms.map(s => ({ symptom: s, confidence: 0.8 })),
            location: {
              pincode: city.pincode,
              city: city.city,
              district: city.district,
              state: city.state,
              country: 'India'
            },
            pincode: city.pincode,
            city: city.city,
            district: city.district,
            state: city.state,
            country: 'India',
            severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
            reportedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
          }
        });
      }

      console.log(`✅ Created symptom reports for ${city.city}`);
    }

    console.log('🎉 All new features have been set up successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Post priority analysis system');
    console.log('✅ Doctor performance analytics');
    console.log('✅ User activity tracking');
    console.log('✅ Regional symptom analytics');
    console.log('\n🌐 You can now access:');
    console.log('• Doctor Feed with Priority: /doctor-feed');
    console.log('• Admin Analytics: /admin/analytics');
    console.log('• Health Trends: /health-trends');
    console.log('• Doctor Profiles with Graphs: /u/[doctor-username]');

  } catch (error) {
    console.error('❌ Error setting up features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupNewFeatures();