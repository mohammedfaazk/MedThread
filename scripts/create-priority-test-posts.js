#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPriorityTestPosts() {
  console.log('🏥 Creating test posts with medical symptoms for priority testing...\n');

  try {
    // Find a patient user to create posts
    const patient = await prisma.user.findFirst({
      where: { role: 'PATIENT' }
    });

    if (!patient) {
      console.log('❌ No patient users found. Creating a test patient...');
      const newPatient = await prisma.user.create({
        data: {
          email: 'testpatient@medthread.com',
          username: 'testpatient',
          passwordHash: '$2b$10$CyfVFfq8XBiBrByWmQT3keElt9DgoebW5WKkKUjW7JYicQ98/uKQO',
          role: 'PATIENT',
          pincode: '600001'
        }
      });
      console.log('✅ Created test patient:', newPatient.username);
    }

    const patientUser = patient || await prisma.user.findFirst({ where: { role: 'PATIENT' } });

    // Find a community to post in
    let community = await prisma.community.findFirst();
    if (!community) {
      community = await prisma.community.create({
        data: {
          name: 'medical-help',
          displayName: 'Medical Help',
          description: 'Get medical advice and support',
          creatorId: patientUser.id
        }
      });
      console.log('✅ Created medical-help community');
    }

    // High Priority Posts (🔴)
    const highPriorityPosts = [
      {
        title: "Severe chest pain and difficulty breathing - URGENT",
        content: "I'm experiencing severe chest pain that started 30 minutes ago. I also have difficulty breathing and feel dizzy. The pain is crushing and radiates to my left arm. Should I go to the emergency room immediately?"
      },
      {
        title: "High fever 104°F with severe headache and neck stiffness",
        content: "My temperature is 104°F and I have a severe headache with neck stiffness. I'm also experiencing nausea and sensitivity to light. These symptoms started this morning and are getting worse."
      },
      {
        title: "Sudden numbness in left arm and face - stroke symptoms?",
        content: "I suddenly developed numbness in my left arm and the left side of my face. I'm also having trouble speaking clearly. This happened about 20 minutes ago. Is this a stroke?"
      }
    ];

    // Medium Priority Posts (🟡)
    const mediumPriorityPosts = [
      {
        title: "Persistent cough and fatigue for 2 weeks",
        content: "I've had a persistent cough for about 2 weeks now, along with fatigue and mild fever that comes and goes. The cough is dry and sometimes I feel short of breath. Should I see a doctor?"
      },
      {
        title: "Joint pain and morning stiffness in hands",
        content: "I've been experiencing joint pain in my hands and wrists, especially in the morning. There's stiffness that lasts for about an hour after I wake up. This has been going on for a month."
      },
      {
        title: "Recurring headaches with nausea",
        content: "I've been getting headaches 3-4 times a week for the past month. They're usually accompanied by nausea and sometimes sensitivity to light. The pain is moderate but persistent."
      }
    ];

    // Low Priority Posts (🟢)
    const lowPriorityPosts = [
      {
        title: "Common cold symptoms - runny nose and sneezing",
        content: "I have a runny nose, sneezing, and mild congestion. Started yesterday. It feels like a typical cold. Any home remedies you'd recommend?"
      },
      {
        title: "Vitamin D deficiency - supplement recommendations?",
        content: "My recent blood test showed low vitamin D levels. My doctor recommended supplements. What's the best type of vitamin D supplement to take?"
      },
      {
        title: "General wellness tips for better sleep",
        content: "I'm looking for general wellness advice to improve my sleep quality. I don't have any medical conditions, just want to optimize my health routine."
      }
    ];

    const allPosts = [
      ...highPriorityPosts.map(post => ({ ...post, expectedPriority: 'HIGH' })),
      ...mediumPriorityPosts.map(post => ({ ...post, expectedPriority: 'MEDIUM' })),
      ...lowPriorityPosts.map(post => ({ ...post, expectedPriority: 'LOW' }))
    ];

    console.log('📝 Creating posts with medical symptoms...\n');

    for (const postData of allPosts) {
      const post = await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          type: 'TEXT',
          authorId: patientUser.id,
          communityId: community.id,
          upvotes: Math.floor(Math.random() * 10) + 1,
          commentCount: Math.floor(Math.random() * 5)
        }
      });

      console.log(`✅ Created ${postData.expectedPriority} priority post: "${post.title.substring(0, 50)}..."`);
    }

    console.log('\n🎯 Now triggering priority analysis...\n');

    // Trigger priority analysis for all posts
    const posts = await prisma.post.findMany({
      where: {
        authorId: patientUser.id
      },
      orderBy: { createdAt: 'desc' },
      take: 9
    });

    // Import the priority service to analyze posts
    const PostPriorityService = require('../apps/api/src/services/post-priority.service.js').PostPriorityService;
    const priorityService = new PostPriorityService();

    for (const post of posts) {
      try {
        await priorityService.analyzePostPriority(post.id);
        console.log(`🔍 Analyzed priority for: "${post.title.substring(0, 40)}..."`);
      } catch (error) {
        console.log(`⚠️ Could not analyze post ${post.id}:`, error.message);
      }
    }

    console.log('\n🎉 Test posts created and analyzed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Refresh your browser at /doctor-feed');
    console.log('2. You should now see priority badges (🔴🟡🟢) on posts');
    console.log('3. Try filtering by High/Medium/Low priority');
    console.log('4. Check that detected symptoms appear below posts');

  } catch (error) {
    console.error('❌ Error creating test posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPriorityTestPosts().catch(console.error);