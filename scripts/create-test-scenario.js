#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

class TestScenarioCreator {
  constructor() {
    this.createdUsers = [];
    this.createdPosts = [];
  }

  async createTestUsers() {
    console.log('👥 Creating test users...');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@medthread.com' },
      create: {
        email: 'admin@medthread.com',
        username: 'admin_user',
        passwordHash,
        role: 'ADMIN',
        verified: true
      },
      update: { role: 'ADMIN' }
    });
    this.createdUsers.push(admin);

    // Create verified doctor
    const doctor = await prisma.user.upsert({
      where: { email: 'doctor@medthread.com' },
      create: {
        email: 'doctor@medthread.com',
        username: 'dr_smith',
        passwordHash,
        role: 'DOCTOR',
        verified: true,
        specialty: 'Cardiology',
        yearsOfExperience: 10,
        hospitalAffiliation: 'City General Hospital',
        pincode: '600094'
      },
      update: { 
        role: 'DOCTOR',
        specialty: 'Cardiology'
      }
    });
    this.createdUsers.push(doctor);

    // Create patient users
    const patients = [];
    for (let i = 1; i <= 5; i++) {
      const patient = await prisma.user.upsert({
        where: { email: `patient${i}@medthread.com` },
        create: {
          email: `patient${i}@medthread.com`,
          username: `patient_${i}`,
          passwordHash,
          role: 'PATIENT',
          pincode: ['600094', '110001', '400001', '560001', '700001'][i-1]
        },
        update: { role: 'PATIENT' }
      });
      patients.push(patient);
      this.createdUsers.push(patient);
    }

    console.log(`✅ Created ${this.createdUsers.length} test users`);
    return { admin, doctor, patients };
  }
  async createTestPosts(users) {
    console.log('📝 Creating test posts with various priorities...');
    
    const { doctor, patients } = users;
    
    // Get or create a community
    let community = await prisma.community.findFirst();
    if (!community) {
      community = await prisma.community.create({
        data: {
          name: 'general',
          displayName: 'General Health',
          description: 'General health discussions'
        }
      });
    }

    const testPosts = [
      {
        title: "Severe chest pain - need urgent help!",
        content: "I'm experiencing severe chest pain that started 2 hours ago. It's sharp and gets worse when I breathe deeply. I also have difficulty breathing and feel dizzy. Should I go to the ER?",
        priority: "HIGH",
        urgencyScore: 9,
        symptoms: ["chest pain", "difficulty breathing", "severe pain", "dizziness"],
        author: patients[0]
      },
      {
        title: "High fever and severe headache since morning",
        content: "I woke up with a high fever (102°F) and the worst headache I've ever had. I'm also feeling nauseous and the light hurts my eyes. This came on very suddenly.",
        priority: "HIGH", 
        urgencyScore: 8,
        symptoms: ["high fever", "severe headache", "nausea"],
        author: patients[1]
      },
      {
        title: "Persistent cough and fatigue for 2 weeks",
        content: "I've had this persistent cough for about 2 weeks now. It's worse at night and I'm constantly tired. No fever, but I have some body aches. What could this be?",
        priority: "MEDIUM",
        urgencyScore: 5,
        symptoms: ["persistent cough", "fatigue", "body ache"],
        author: patients[2]
      },
      {
        title: "Joint pain and morning stiffness",
        content: "For the past month, I've been experiencing joint pain in my knees and wrists. It's especially bad in the morning and takes about an hour to get better. I'm 45 years old.",
        priority: "MEDIUM",
        urgencyScore: 4,
        symptoms: ["joint pain", "morning stiffness"],
        author: patients[3]
      },
      {
        title: "Common cold - runny nose and sneezing",
        content: "I think I have a common cold. Runny nose, sneezing, and a bit of a sore throat since yesterday. No fever. Any home remedies you'd recommend?",
        priority: "LOW",
        urgencyScore: 2,
        symptoms: ["runny nose", "sneezing", "sore throat", "cold"],
        author: patients[4]
      },
      {
        title: "General wellness check - vitamin recommendations",
        content: "I'm looking for advice on vitamins and supplements for general wellness. I'm 30 years old, exercise regularly, but want to make sure I'm getting all nutrients.",
        priority: "LOW",
        urgencyScore: 1,
        symptoms: ["wellness", "vitamins"],
        author: patients[0]
      }
    ];

    for (const postData of testPosts) {
      // Create post
      const post = await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          authorId: postData.author.id,
          communityId: community.id
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
      const locationData = this.getLocationData(postData.author.pincode);
      await prisma.symptomReport.create({
        data: {
          userId: postData.author.id,
          postId: post.id,
          symptoms: postData.symptoms,
          detectedSymptoms: postData.symptoms.map(s => ({ symptom: s, confidence: 0.8 })),
          location: locationData,
          pincode: locationData.pincode,
          city: locationData.city,
          district: locationData.district,
          state: locationData.state,
          country: 'India',
          severity: postData.priority,
          reportedAt: new Date()
        }
      });

      this.createdPosts.push(post);
      console.log(`✅ Created ${postData.priority} priority post: "${postData.title}"`);
    }
  }

  getLocationData(pincode) {
    const locationMap = {
      '600094': { pincode: '600094', city: 'Chennai', district: 'Chennai District', state: 'Tamil Nadu' },
      '110001': { pincode: '110001', city: 'New Delhi', district: 'Central Delhi', state: 'Delhi' },
      '400001': { pincode: '400001', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra' },
      '560001': { pincode: '560001', city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka' },
      '700001': { pincode: '700001', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal' }
    };
    return locationMap[pincode] || locationMap['600094'];
  }

  async createDoctorPerformanceData(doctor) {
    console.log('📊 Creating doctor performance data...');
    
    await prisma.doctorPerformance.upsert({
      where: { doctorId: doctor.id },
      create: {
        doctorId: doctor.id,
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
        helpfulnessScore: 4.7,
        portfolioScore: 85
      }
    });

    console.log('✅ Created doctor performance data');
  }

  async createUserActivityLogs(users) {
    console.log('📈 Creating user activity logs...');
    
    const { admin, doctor, patients } = users;
    const allUsers = [admin, doctor, ...patients];
    
    for (const user of allUsers) {
      const activities = [];
      const now = new Date();
      
      // Create 30 days of activity data
      for (let day = 0; day < 30; day++) {
        const date = new Date(now.getTime() - (day * 24 * 60 * 60 * 1000));
        
        // Random activities throughout the day
        for (let hour = 8; hour < 22; hour++) { // Active hours 8 AM to 10 PM
          if (Math.random() > 0.6) { // 40% chance of activity each hour
            const activityTypes = user.role === 'DOCTOR' ? 
              ['COMMENT', 'MESSAGE', 'POST'] : 
              ['POST', 'COMMENT', 'VOTE', 'MESSAGE'];
            
            activities.push({
              userId: user.id,
              activityType: activityTypes[Math.floor(Math.random() * activityTypes.length)],
              hourOfDay: hour,
              dayOfWeek: date.getDay(),
              createdAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(Math.random() * 60))
            });
          }
        }
      }

      if (activities.length > 0) {
        await prisma.userActivityLog.createMany({
          data: activities,
          skipDuplicates: true
        });
        console.log(`✅ Created ${activities.length} activity logs for ${user.username}`);
      }
    }
  }

  async createConversationData(doctor, patients) {
    console.log('💬 Creating conversation data for reply time analysis...');
    
    // Create some conversations between doctor and patients
    for (let i = 0; i < 3; i++) {
      const patient = patients[i];
      
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: doctor.id }, { id: patient.id }]
          }
        }
      });

      // Create message exchange
      const patientMessage = await prisma.message.create({
        data: {
          senderId: patient.id,
          receiverId: doctor.id,
          conversationId: conversation.id,
          content: `Hi Dr. ${doctor.username}, I need some medical advice about my symptoms.`,
          createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000) // Messages from past days
        }
      });

      // Doctor reply (with some delay)
      const replyDelay = [2, 4, 1][i] * 60 * 60 * 1000; // 2, 4, 1 hours delay
      await prisma.message.create({
        data: {
          senderId: doctor.id,
          receiverId: patient.id,
          conversationId: conversation.id,
          content: `Hello ${patient.username}, I'd be happy to help. Can you describe your symptoms in more detail?`,
          createdAt: new Date(patientMessage.createdAt.getTime() + replyDelay)
        }
      });
    }

    console.log('✅ Created conversation data for reply time analysis');
  }

  async runScenario() {
    console.log('🎬 Creating comprehensive test scenario...\n');

    try {
      // Create users
      const users = await this.createTestUsers();
      
      // Create posts with priorities
      await this.createTestPosts(users);
      
      // Create doctor performance data
      await this.createDoctorPerformanceData(users.doctor);
      
      // Create user activity logs
      await this.createUserActivityLogs(users);
      
      // Create conversation data
      await this.createConversationData(users.doctor, users.patients);

      console.log('\n🎉 Test scenario created successfully!');
      console.log('\n📋 Test Accounts Created:');
      console.log('Admin: admin@medthread.com / password123');
      console.log('Doctor: doctor@medthread.com / password123');
      console.log('Patients: patient1@medthread.com to patient5@medthread.com / password123');
      
      console.log('\n🔗 Test URLs:');
      console.log('• Doctor Profile: /u/dr_smith');
      console.log('• Doctor Feed: /doctor-feed (login as doctor)');
      console.log('• Admin Analytics: /admin/analytics (login as admin)');
      console.log('• Health Trends: /health-trends');

    } catch (error) {
      console.error('❌ Error creating test scenario:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Run scenario creation if called directly
if (require.main === module) {
  const creator = new TestScenarioCreator();
  creator.runScenario().catch(error => {
    console.error('💥 Scenario creation crashed:', error);
    process.exit(1);
  });
}

module.exports = TestScenarioCreator;