/**
 * Seed ALL Community Features with Mock Data
 * - Support Groups
 * - Q&A Forum
 * - Health Challenges
 * - Success Stories
 */

import { prisma } from '@medthread/database';

async function main() {
  console.log('🌱 Seeding ALL Community Features...\n');

  // Get existing users
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR', email: { contains: '@medthread-mock.com' } },
    take: 15
  });

  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT', email: { contains: '@medthread-mock.com' } },
    take: 30
  });

  if (doctors.length === 0 || patients.length === 0) {
    console.log('❌ No mock users found. Run comprehensive-seed.ts first!');
    return;
  }

  console.log(`✅ Found ${doctors.length} doctors and ${patients.length} patients\n`);

  // 1. SUPPORT GROUPS
  console.log('📋 Creating Support Groups...');
  const supportGroups = await seedSupportGroups(doctors, patients);
  console.log(`✅ Created ${supportGroups.length} support groups\n`);

  // 2. Q&A FORUM
  console.log('📋 Creating Q&A Forum Questions...');
  const qaQuestions = await seedQAForum(doctors, patients);
  console.log(`✅ Created ${qaQuestions.length} Q&A questions\n`);

  // 3. HEALTH CHALLENGES
  console.log('📋 Creating Health Challenges...');
  const challenges = await seedHealthChallenges(doctors, patients);
  console.log(`✅ Created ${challenges.length} health challenges\n`);

  // 4. SUCCESS STORIES
  console.log('📋 Creating Success Stories...');
  const stories = await seedSuccessStories(patients, doctors);
  console.log(`✅ Created ${stories.length} success stories\n`);

  console.log('🎉 All community features seeded successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`   Support Groups:    ${supportGroups.length}`);
  console.log(`   Q&A Questions:     ${qaQuestions.length}`);
  console.log(`   Health Challenges: ${challenges.length}`);
  console.log(`   Success Stories:   ${stories.length}`);
  console.log('═══════════════════════════════════════════\n');
}

// ============================================
// 1. SUPPORT GROUPS
// ============================================
async function seedSupportGroups(doctors: any[], patients: any[]) {
  const groupsData = [
    {
      name: 'Diabetes Support Circle',
      condition: 'Diabetes',
      description: 'A supportive community for people managing diabetes, sharing experiences and tips',
      isPrivate: false,
      moderators: [patients[0].id],
      members: [],
      memberCount: 0,
      createdBy: patients[0].id
    },
    {
      name: 'Cancer Warriors',
      condition: 'Cancer',
      description: 'Support group for cancer patients and survivors to share their journey',
      isPrivate: false,
      moderators: [patients[1].id],
      members: [],
      memberCount: 0,
      createdBy: patients[1].id
    },
    {
      name: 'Heart Health Heroes',
      condition: 'Heart Disease',
      description: 'Community for people with heart conditions supporting each other',
      isPrivate: false,
      moderators: [patients[2].id],
      members: [],
      memberCount: 0,
      createdBy: patients[2].id
    },
    {
      name: 'Mental Wellness Circle',
      condition: 'Mental Health',
      description: 'Safe space for discussing mental health challenges and recovery',
      isPrivate: false,
      moderators: [patients[3].id],
      members: [],
      memberCount: 0,
      createdBy: patients[3].id
    },
    {
      name: 'New Parents Support',
      condition: 'Parenting',
      description: 'Support group for new parents navigating parenthood challenges',
      isPrivate: false,
      moderators: [patients[4].id],
      members: [],
      memberCount: 0,
      createdBy: patients[4].id
    },
    {
      name: 'Weight Loss Journey',
      condition: 'Weight Management',
      description: 'Community supporting each other in healthy weight loss goals',
      isPrivate: false,
      moderators: [patients[5].id],
      members: [],
      memberCount: 0,
      createdBy: patients[5].id
    },
    {
      name: 'Arthritis Support Network',
      condition: 'Arthritis',
      description: 'Sharing tips and support for managing arthritis pain',
      isPrivate: false,
      moderators: [patients[6].id],
      members: [],
      memberCount: 0,
      createdBy: patients[6].id
    },
    {
      name: 'Asthma & Allergy Support',
      condition: 'Asthma',
      description: 'Community for people managing asthma and allergies',
      isPrivate: false,
      moderators: [patients[7].id],
      members: [],
      memberCount: 0,
      createdBy: patients[7].id
    }
  ];

  const groups = [];
  for (const groupData of groupsData) {
    // Check if group already exists
    const existing = await prisma.supportGroup.findFirst({
      where: { name: groupData.name }
    });

    if (existing) {
      console.log(`  ⏭️  Support group "${groupData.name}" already exists, skipping...`);
      groups.push(existing);
      continue;
    }

    // Add members (5-10 patients per group)
    const memberCount = 5 + Math.floor(Math.random() * 6);
    const members = [];
    for (let i = 0; i < memberCount; i++) {
      const patient = patients[i % patients.length];
      members.push({
        userId: patient.id,
        joinedAt: new Date().toISOString(),
        isAnonymous: Math.random() > 0.7
      });
    }

    const group = await prisma.supportGroup.create({
      data: {
        ...groupData,
        members,
        memberCount: members.length
      }
    });

    groups.push(group);
  }

  return groups;
}

// ============================================
// 2. Q&A FORUM
// ============================================
async function seedQAForum(doctors: any[], patients: any[]) {
  const questionsData = [
    {
      title: 'What are the early signs of diabetes?',
      content: 'I have been feeling very thirsty lately and urinating frequently. Could these be signs of diabetes? What other symptoms should I watch for?',
      category: 'SYMPTOMS',
      tags: ['diabetes', 'symptoms', 'diagnosis'],
      authorId: patients[0].id
    },
    {
      title: 'Best exercises for heart health?',
      content: 'I want to improve my heart health. What are the best exercises for someone with mild hypertension? How often should I exercise?',
      category: 'LIFESTYLE',
      tags: ['heart-health', 'exercise', 'hypertension'],
      authorId: patients[1].id
    },
    {
      title: 'How to manage anxiety without medication?',
      content: 'I experience anxiety attacks occasionally. Are there natural ways to manage anxiety without relying on medication?',
      category: 'TREATMENT',
      tags: ['anxiety', 'mental-health', 'natural-remedies'],
      authorId: patients[2].id
    },
    {
      title: 'Skin care routine for acne-prone skin?',
      content: 'I have oily, acne-prone skin. What should my daily skincare routine look like? Any product recommendations?',
      category: 'GENERAL',
      tags: ['acne', 'skincare', 'dermatology'],
      authorId: patients[3].id
    },
    {
      title: 'When should my baby start solid foods?',
      content: 'My baby is 5 months old. When is the right time to introduce solid foods? What foods should I start with?',
      category: 'GENERAL',
      tags: ['baby', 'nutrition', 'pediatrics'],
      authorId: patients[4].id
    },
    {
      title: 'Joint pain relief for arthritis?',
      content: 'I have arthritis in my knees. What are effective ways to manage the pain besides medication?',
      category: 'TREATMENT',
      tags: ['arthritis', 'joint-pain', 'pain-management'],
      authorId: patients[5].id
    },
    {
      title: 'Managing PCOS symptoms naturally?',
      content: 'I was diagnosed with PCOS. What lifestyle changes can help manage symptoms naturally?',
      category: 'LIFESTYLE',
      tags: ['pcos', 'womens-health', 'lifestyle'],
      authorId: patients[6].id
    },
    {
      title: 'Asthma inhaler technique - am I doing it right?',
      content: 'I use an inhaler for asthma but not sure if my technique is correct. Can someone explain the proper way?',
      category: 'TREATMENT',
      tags: ['asthma', 'inhaler', 'technique'],
      authorId: patients[7].id
    },
    {
      title: 'Eye strain from computer work - solutions?',
      content: 'I work on computer 8+ hours daily and experience eye strain. What can I do to reduce it?',
      category: 'SYMPTOMS',
      tags: ['eye-strain', 'computer', 'eye-health'],
      authorId: patients[8].id
    },
    {
      title: 'Healthy diet for kidney disease?',
      content: 'Recently diagnosed with early stage kidney disease. What dietary changes should I make?',
      category: 'LIFESTYLE',
      tags: ['kidney-disease', 'diet', 'nutrition'],
      authorId: patients[9].id
    }
  ];

  const questions = [];
  for (let i = 0; i < questionsData.length; i++) {
    const qData = questionsData[i];
    
    // Check if question already exists
    const existing = await prisma.forumQuestion.findFirst({
      where: { title: qData.title }
    });

    if (existing) {
      console.log(`  ⏭️  Question "${qData.title}" already exists, skipping...`);
      questions.push(existing);
      continue;
    }

    const question = await prisma.forumQuestion.create({
      data: qData
    });

    // Add 1-3 answers from doctors
    const answerCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < answerCount; j++) {
      const doctor = doctors[j % doctors.length];
      await prisma.forumAnswer.create({
        data: {
          questionId: question.id,
          authorId: doctor.id,
          content: `As a ${doctor.specialty || 'medical'} specialist, I can help with this. ${j === 0 ? 'This is a common concern.' : 'I agree with the previous answer.'} [Detailed medical advice would go here based on the question]`,
          isAccepted: j === 0,
          isVerified: true
        }
      });
    }

    // Update question status to ANSWERED
    await prisma.forumQuestion.update({
      where: { id: question.id },
      data: { status: 'ANSWERED' }
    });

    questions.push(question);
  }

  return questions;
}

// ============================================
// 3. HEALTH CHALLENGES
// ============================================
async function seedHealthChallenges(doctors: any[], patients: any[]) {
  const challengesData = [
    {
      title: '30-Day Walking Challenge',
      description: 'Walk 10,000 steps every day for 30 days to improve cardiovascular health',
      type: 'STEPS',
      goal: 10000,
      unit: 'steps',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Walking Champion Badge' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[0].id,
      participantCount: 0,
      duration: '30 days',
      category: 'FITNESS',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[0].id, doctorName: doctors[0].username, approvedAt: new Date().toISOString() }]
    },
    {
      title: 'Sugar-Free September',
      description: 'Eliminate added sugars from your diet for 30 days',
      type: 'MEDICATION_ADHERENCE',
      goal: 30,
      unit: 'days',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Sugar-Free Champion' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[1].id,
      participantCount: 0,
      duration: '30 days',
      category: 'NUTRITION',
      difficulty: 'INTERMEDIATE',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[1].id, doctorName: doctors[1].username, approvedAt: new Date().toISOString() }]
    },
    {
      title: 'Meditation Mindfulness Challenge',
      description: 'Practice 10 minutes of meditation daily for mental wellness',
      type: 'MEDITATION',
      goal: 21,
      unit: 'sessions',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Mindfulness Master' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[2].id,
      participantCount: 0,
      duration: '21 days',
      category: 'MENTAL_HEALTH',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[2].id, doctorName: doctors[2].username, approvedAt: new Date().toISOString() }]
    },
    {
      title: 'Hydration Challenge',
      description: 'Drink 8 glasses of water every day for better health',
      type: 'WATER',
      goal: 8,
      unit: 'glasses',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Hydration Hero' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[3].id,
      participantCount: 0,
      duration: '14 days',
      category: 'LIFESTYLE',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[3].id, doctorName: doctors[3].username, approvedAt: new Date().toISOString() }]
    },
    {
      title: 'Strength Training Challenge',
      description: 'Complete 3 strength training sessions per week',
      type: 'STEPS',
      goal: 12,
      unit: 'sessions',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Strength Champion' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[4].id,
      participantCount: 0,
      duration: '30 days',
      category: 'FITNESS',
      difficulty: 'INTERMEDIATE',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[4].id, doctorName: doctors[4].username, approvedAt: new Date().toISOString() }]
    },
    {
      title: 'Sleep Hygiene Challenge',
      description: 'Maintain consistent sleep schedule for better rest',
      type: 'SLEEP',
      goal: 8,
      unit: 'hours',
      participants: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      rewards: [{ milestone: 100, reward: 'Sleep Master' }],
      leaderboard: [],
      isActive: true,
      createdBy: doctors[5].id,
      participantCount: 0,
      duration: '21 days',
      category: 'LIFESTYLE',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      requiresDoctorApproval: false,
      isDoctorApproved: true,
      approvedByDoctors: [{ doctorId: doctors[5].id, doctorName: doctors[5].username, approvedAt: new Date().toISOString() }]
    }
  ];

  const challenges = [];
  for (const cData of challengesData) {
    // Check if challenge already exists
    const existing = await prisma.healthChallenge.findFirst({
      where: { title: cData.title }
    });

    if (existing) {
      console.log(`  ⏭️  Challenge "${cData.title}" already exists, skipping...`);
      challenges.push(existing);
      continue;
    }

    const challenge = await prisma.healthChallenge.create({
      data: cData
    });

    // Add 5-15 participants
    const participantCount = 5 + Math.floor(Math.random() * 11);
    for (let i = 0; i < participantCount; i++) {
      const patient = patients[i % patients.length];
      
      // Check if participant already exists
      const existingParticipant = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: challenge.id,
            userId: patient.id
          }
        }
      });

      if (!existingParticipant) {
        await prisma.challengeParticipant.create({
          data: {
            challengeId: challenge.id,
            userId: patient.id,
            progress: Math.floor(Math.random() * 100),
            isCompleted: Math.random() > 0.7
          }
        });
      }
    }

    challenges.push(challenge);
  }

  return challenges;
}

// ============================================
// 4. SUCCESS STORIES
// ============================================
async function seedSuccessStories(patients: any[], doctors: any[]) {
  const storiesData = [
    {
      title: 'How I Reversed My Pre-Diabetes',
      condition: 'Pre-diabetes',
      story: 'Six months ago, I was diagnosed with pre-diabetes. Through diet changes, regular exercise, and monitoring my blood sugar, I managed to bring my levels back to normal. Here\'s my journey...',
      treatment: 'Diet modification, exercise, blood sugar monitoring',
      duration: '6 months',
      authorId: patients[0].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Overcoming Anxiety: My Mental Health Journey',
      condition: 'Anxiety Disorder',
      story: 'After years of struggling with anxiety, I finally sought help. Through therapy, lifestyle changes, and support from loved ones, I\'ve learned to manage my anxiety effectively.',
      treatment: 'Therapy, lifestyle changes, support groups',
      duration: '1 year',
      authorId: patients[1].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Lost 30kg and Gained My Life Back',
      condition: 'Obesity',
      story: 'My weight loss journey wasn\'t easy, but it was worth it. I changed my relationship with food, started exercising regularly, and now I feel healthier than ever.',
      treatment: 'Diet modification, regular exercise, behavioral therapy',
      duration: '18 months',
      authorId: patients[2].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Managing Asthma: From Frequent Attacks to Freedom',
      condition: 'Asthma',
      story: 'I used to have asthma attacks multiple times a week. With proper medication, avoiding triggers, and regular check-ups, I now rarely have attacks.',
      treatment: 'Inhaler medication, trigger avoidance, regular monitoring',
      duration: '2 years',
      authorId: patients[3].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Clear Skin After Years of Acne',
      condition: 'Severe Acne',
      story: 'After struggling with severe acne for years, I finally found a treatment that worked. Patience and consistency were key to my clear skin journey.',
      treatment: 'Dermatologist-prescribed medication, skincare routine',
      duration: '1 year',
      authorId: patients[4].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Living Well with PCOS',
      condition: 'PCOS',
      story: 'PCOS diagnosis was overwhelming, but I learned to manage it through lifestyle changes, medication, and regular monitoring. Life is much better now.',
      treatment: 'Medication, diet changes, exercise, regular monitoring',
      duration: '2 years',
      authorId: patients[5].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Recovery from Heart Attack',
      condition: 'Heart Attack Recovery',
      story: 'Surviving a heart attack changed my life. I made major lifestyle changes and now I\'m healthier and more active than before.',
      treatment: 'Cardiac rehabilitation, medication, lifestyle changes',
      duration: '1 year',
      authorId: patients[6].id,
      status: 'APPROVED',
      isVerified: true
    },
    {
      title: 'Managing Arthritis Pain Naturally',
      condition: 'Rheumatoid Arthritis',
      story: 'I found ways to manage my arthritis pain through exercise, diet, and natural remedies, reducing my dependence on pain medication.',
      treatment: 'Physical therapy, anti-inflammatory diet, supplements',
      duration: '3 years',
      authorId: patients[7].id,
      status: 'APPROVED',
      isVerified: true
    }
  ];

  const stories = [];
  for (const sData of storiesData) {
    // Check if story already exists
    const existing = await prisma.successStory.findFirst({
      where: { title: sData.title }
    });

    if (existing) {
      console.log(`  ⏭️  Story "${sData.title}" already exists, skipping...`);
      stories.push(existing);
      continue;
    }

    const story = await prisma.successStory.create({
      data: sData
    });

    stories.push(story);
  }

  return stories;
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
