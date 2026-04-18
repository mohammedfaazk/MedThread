/**
 * Seed Community Features: Support Groups, Health Challenges, Success Stories
 * 
 * Run with: tsx apps/api/src/scripts/seed-community-features.ts
 */

import { prisma } from '@medthread/database';

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const timestamp = now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(timestamp);
}

async function main() {
  console.log('🌱 Seeding Community Features...\n');

  // Get existing users
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    take: 10
  });

  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    take: 20
  });

  if (doctors.length === 0 || patients.length === 0) {
    console.log('⚠️  No users found. Please run comprehensive-seed.ts first.');
    return;
  }

  console.log(`Found ${doctors.length} doctors and ${patients.length} patients\n`);

  // PART 1: Seed Support Groups
  console.log('📋 PART 1: Creating Support Groups...');
  await seedSupportGroups(doctors, patients);

  // PART 2: Seed Health Challenges
  console.log('\n📋 PART 2: Creating Health Challenges...');
  await seedHealthChallenges(doctors, patients);

  // PART 3: Seed Success Stories
  console.log('\n📋 PART 3: Creating Success Stories...');
  await seedSuccessStories(doctors, patients);

  console.log('\n🎉 Community features seeding completed!\n');
}

// ============================================
// PART 1: SEED SUPPORT GROUPS
// ============================================

async function seedSupportGroups(doctors: any[], patients: any[]) {
  const groupsData = [
    {
      name: 'Diabetes Support Circle',
      condition: 'Diabetes',
      description: 'A supportive community for people managing diabetes. Share experiences, tips, and encouragement.',
      isPrivate: false,
      rules: ['Be respectful', 'No medical advice', 'Share experiences only', 'Maintain confidentiality']
    },
    {
      name: 'Heart Health Warriors',
      condition: 'Cardiovascular Disease',
      description: 'Support group for individuals dealing with heart conditions. Connect with others on similar journeys.',
      isPrivate: false,
      rules: ['Respect privacy', 'Be supportive', 'No judgment', 'Share positively']
    },
    {
      name: 'Mental Wellness Hub',
      condition: 'Mental Health',
      description: 'Safe space for mental health discussions. Anxiety, depression, and general mental wellness support.',
      isPrivate: true,
      rules: ['Confidentiality is key', 'No triggering content', 'Be kind', 'Professional help encouraged']
    },
    {
      name: 'Cancer Survivors Network',
      condition: 'Cancer',
      description: 'Connect with cancer survivors and those currently fighting. Share hope and strength.',
      isPrivate: false,
      rules: ['Respect all journeys', 'Share hope', 'No false cures', 'Support each other']
    },
    {
      name: 'PCOS Warriors',
      condition: 'PCOS',
      description: 'Women supporting women through PCOS challenges. Diet, lifestyle, and treatment discussions.',
      isPrivate: false,
      rules: ['Women-focused space', 'Share experiences', 'No body shaming', 'Evidence-based info']
    }
  ];

  for (const groupData of groupsData) {
    const creator = patients[Math.floor(Math.random() * patients.length)];
    
    // Select random members (5-15 members)
    const memberCount = Math.floor(Math.random() * 11) + 5;
    const allUsers = [...doctors, ...patients];
    const selectedMembers = allUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, memberCount);

    const members = selectedMembers.map(user => ({
      userId: user.id,
      joinedAt: randomDate(60).toISOString(),
      isAnonymous: groupData.isPrivate && Math.random() > 0.5
    }));

    // Ensure creator is in members
    if (!members.find(m => m.userId === creator.id)) {
      members.push({
        userId: creator.id,
        joinedAt: randomDate(90).toISOString(),
        isAnonymous: false
      });
    }

    const group = await prisma.supportGroup.create({
      data: {
        name: groupData.name,
        condition: groupData.condition,
        description: groupData.description,
        isPrivate: groupData.isPrivate,
        moderators: [creator.id],
        members: members,
        memberCount: members.length,
        rules: groupData.rules,
        createdBy: creator.id,
        createdAt: randomDate(90)
      }
    });

    // Create 3-5 posts for each group
    const postCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < postCount; i++) {
      const author = selectedMembers[Math.floor(Math.random() * selectedMembers.length)];
      const postTypes = ['QUESTION', 'DISCUSSION', 'SUPPORT', 'UPDATE'];
      const postType = postTypes[Math.floor(Math.random() * postTypes.length)];

      await prisma.supportGroupPost.create({
        data: {
          groupId: group.id,
          authorId: author.id,
          isAnonymous: groupData.isPrivate && Math.random() > 0.6,
          title: getGroupPostTitle(groupData.condition, postType),
          content: getGroupPostContent(groupData.condition, postType),
          type: postType,
          upvotes: Math.floor(Math.random() * 20),
          commentCount: Math.floor(Math.random() * 10),
          createdAt: randomDate(30)
        }
      });
    }

    console.log(`   ✓ ${groupData.name} (${members.length} members, ${postCount} posts)`);
  }
}

function getGroupPostTitle(condition: string, type: string): string {
  const titles: Record<string, string[]> = {
    'Diabetes': [
      'How do you manage your blood sugar during festivals?',
      'Best low-carb recipes that actually taste good',
      'Feeling discouraged after high HbA1c results',
      'CGM changed my life - here\'s how'
    ],
    'Cardiovascular Disease': [
      'Post-surgery recovery tips needed',
      'Managing stress with heart condition',
      'Exercise routine that works for me',
      'Medication side effects - anyone else?'
    ],
    'Mental Health': [
      'Coping with anxiety during work',
      'Finding the right therapist',
      'Medication journey - 6 months update',
      'Self-care routines that help'
    ],
    'Cancer': [
      'Chemo side effects management',
      'Staying positive during treatment',
      '1 year cancer-free today!',
      'Supporting a loved one with cancer'
    ],
    'PCOS': [
      'Weight loss struggles with PCOS',
      'Inositol supplements - do they work?',
      'Managing irregular periods',
      'PCOS and pregnancy journey'
    ]
  };

  const conditionTitles = titles[condition] || titles['Diabetes'];
  return conditionTitles[Math.floor(Math.random() * conditionTitles.length)];
}

function getGroupPostContent(condition: string, type: string): string {
  const contents = [
    'I\'ve been struggling with this lately and would love to hear your experiences and advice.',
    'After trying many approaches, I found something that works. Happy to share details if anyone is interested.',
    'Having a tough day and needed to share with people who understand. Thanks for being here.',
    'Just wanted to update everyone on my progress. This community has been so helpful!',
    'Does anyone else experience this? Would love to know I\'m not alone.',
    'My doctor suggested this approach. Has anyone tried it? What were your results?'
  ];

  return contents[Math.floor(Math.random() * contents.length)];
}

// ============================================
// PART 2: SEED HEALTH CHALLENGES
// ============================================

async function seedHealthChallenges(doctors: any[], patients: any[]) {
  const challengesData = [
    {
      title: '10,000 Steps Daily Challenge',
      description: 'Walk 10,000 steps every day for 30 days. Track your progress and compete with others!',
      category: 'FITNESS',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      type: 'STEPS',
      goal: 10000,
      unit: 'steps',
      duration: 30
    },
    {
      title: 'Sugar-Free September',
      description: 'Eliminate added sugars from your diet for 30 days. Perfect for diabetes management.',
      category: 'NUTRITION',
      difficulty: 'INTERMEDIATE',
      riskLevel: 'LOW',
      type: 'DIET',
      goal: 30,
      unit: 'days',
      duration: 30
    },
    {
      title: 'Meditation Mastery',
      description: 'Meditate for 15 minutes daily. Improve mental health and reduce stress.',
      category: 'MENTAL_HEALTH',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      type: 'MEDITATION',
      goal: 15,
      unit: 'minutes',
      duration: 21
    },
    {
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily. Stay hydrated for better health.',
      category: 'WELLNESS',
      difficulty: 'BEGINNER',
      riskLevel: 'LOW',
      type: 'HYDRATION',
      goal: 8,
      unit: 'glasses',
      duration: 14
    },
    {
      title: 'Strength Training Starter',
      description: 'Complete 3 strength training sessions per week. Build muscle and improve fitness.',
      category: 'FITNESS',
      difficulty: 'INTERMEDIATE',
      riskLevel: 'HIGH',
      type: 'STRENGTH',
      goal: 12,
      unit: 'sessions',
      duration: 28
    },
    {
      title: 'Sleep Schedule Reset',
      description: 'Get 7-8 hours of sleep every night. Improve your sleep hygiene.',
      category: 'WELLNESS',
      difficulty: 'INTERMEDIATE',
      riskLevel: 'LOW',
      type: 'SLEEP',
      goal: 8,
      unit: 'hours',
      duration: 21
    }
  ];

  for (const challengeData of challengesData) {
    const creator = doctors[Math.floor(Math.random() * doctors.length)];
    const startDate = randomDate(30);
    const endDate = new Date(startDate.getTime() + challengeData.duration * 24 * 60 * 60 * 1000);

    // For HIGH-RISK challenges, randomly approve some
    const isDoctorApproved = challengeData.riskLevel === 'LOW' || Math.random() > 0.3;
    const approvedByDoctors = isDoctorApproved ? [creator.id] : [];

    // Select random participants (5-20)
    const participantCount = Math.floor(Math.random() * 16) + 5;
    const selectedParticipants = patients
      .sort(() => 0.5 - Math.random())
      .slice(0, participantCount);

    const participants = selectedParticipants.map(user => ({
      userId: user.id,
      progress: Math.floor(Math.random() * 100),
      joinedAt: randomDate(20).toISOString()
    }));

    const leaderboard = participants
      .map(p => ({
        userId: p.userId,
        points: Math.floor(Math.random() * 500) + 100,
        progress: p.progress
      }))
      .sort((a, b) => b.points - a.points);

    const challenge = await prisma.healthChallenge.create({
      data: {
        title: challengeData.title,
        description: challengeData.description,
        category: challengeData.category,
        difficulty: challengeData.difficulty,
        riskLevel: challengeData.riskLevel,
        requiresDoctorApproval: challengeData.riskLevel === 'HIGH',
        isDoctorApproved,
        approvedByDoctors,
        type: challengeData.type,
        goal: challengeData.goal,
        unit: challengeData.unit,
        startDate,
        endDate,
        participants,
        leaderboard,
        rewards: {
          points: 100,
          badge: `${challengeData.title} Completer`
        },
        isActive: true,
        participantCount: participants.length,
        createdBy: creator.id,
        createdAt: randomDate(40)
      }
    });

    // Create ChallengeParticipant records
    for (const participant of participants) {
      await prisma.challengeParticipant.create({
        data: {
          challengeId: challenge.id,
          userId: participant.userId,
          progress: participant.progress,
          isCompleted: participant.progress >= 100,
          completedAt: participant.progress >= 100 ? randomDate(5) : null,
          joinedAt: new Date(participant.joinedAt),
          points: leaderboard.find(l => l.userId === participant.userId)?.points || 0
        }
      });
    }

    console.log(`   ✓ ${challengeData.title} (${participants.length} participants, ${isDoctorApproved ? 'APPROVED' : 'PENDING'})`);
  }
}

// ============================================
// PART 3: SEED SUCCESS STORIES
// ============================================

async function seedSuccessStories(doctors: any[], patients: any[]) {
  const storiesData = [
    {
      title: 'How I Reversed My Pre-Diabetes in 6 Months',
      condition: 'Diabetes',
      story: 'Six months ago, my HbA1c was 6.2 and I was diagnosed with pre-diabetes. I was devastated but determined to turn things around. I started with small changes - cutting out sugary drinks, walking 30 minutes daily, and eating more vegetables. Within 3 months, my HbA1c dropped to 5.8. Now at 5.4, I feel healthier than ever!',
      treatment: 'Lifestyle modification, diet control, regular exercise',
      duration: '6 months'
    },
    {
      title: 'My Journey from Anxiety to Peace',
      condition: 'Anxiety Disorder',
      story: 'For years, I struggled with crippling anxiety. Simple tasks felt impossible. After starting therapy and medication, combined with daily meditation, my life transformed. It wasn\'t easy, but I\'m now managing my anxiety and living fully. To anyone struggling - there is hope!',
      treatment: 'Cognitive Behavioral Therapy, SSRIs, meditation',
      duration: '1 year'
    },
    {
      title: 'Beating PCOS: My 2-Year Transformation',
      condition: 'PCOS',
      story: 'PCOS made me feel hopeless - irregular periods, weight gain, acne. After working with my doctor, I started inositol supplements, changed my diet to low-GI foods, and exercised regularly. Lost 15kg, periods are regular, and I feel like myself again!',
      treatment: 'Inositol supplements, low-GI diet, regular exercise',
      duration: '2 years'
    },
    {
      title: 'Heart Attack Survivor: One Year Later',
      condition: 'Cardiovascular Disease',
      story: 'A year ago, I had a heart attack at 52. It was a wake-up call. After angioplasty, I committed to cardiac rehab, quit smoking, and changed my entire lifestyle. Today, I\'m healthier than I was in my 40s. Never too late to change!',
      treatment: 'Angioplasty, cardiac rehabilitation, lifestyle changes',
      duration: '1 year'
    },
    {
      title: 'Conquering Depression: My Story',
      condition: 'Depression',
      story: 'Depression took everything from me - my job, relationships, joy. Starting antidepressants and therapy was the hardest and best decision. It took 6 months to feel better, but now I\'m thriving. Mental health is health. Don\'t suffer in silence.',
      treatment: 'Antidepressants, psychotherapy, support groups',
      duration: '18 months'
    },
    {
      title: 'Living Well with Rheumatoid Arthritis',
      condition: 'Rheumatoid Arthritis',
      story: 'RA diagnosis at 35 felt like a life sentence. But with the right medication, physiotherapy, and positive mindset, I\'m managing well. I still have flare-ups, but they don\'t control my life anymore. Sharing my story to give others hope.',
      treatment: 'DMARDs, physiotherapy, anti-inflammatory diet',
      duration: '3 years'
    },
    {
      title: 'Thyroid Balance: My Healing Journey',
      condition: 'Hypothyroidism',
      story: 'Years of fatigue, weight gain, and brain fog led to hypothyroidism diagnosis. Finding the right thyroid medication dosage took time, but once balanced, I got my energy back. Regular monitoring and medication compliance are key!',
      treatment: 'Levothyroxine, regular monitoring',
      duration: '2 years'
    },
    {
      title: 'Asthma Control: From ER Visits to Active Life',
      condition: 'Asthma',
      story: 'Used to visit ER monthly for asthma attacks. After identifying triggers, using controller inhalers properly, and staying active, I haven\'t had an attack in 8 months. Asthma doesn\'t have to limit you!',
      treatment: 'Controller inhalers, trigger avoidance, pulmonary rehab',
      duration: '1 year'
    }
  ];

  for (const storyData of storiesData) {
    const author = patients[Math.floor(Math.random() * patients.length)];
    
    const story = await prisma.successStory.create({
      data: {
        title: storyData.title,
        condition: storyData.condition,
        story: storyData.story,
        treatment: storyData.treatment,
        duration: storyData.duration,
        authorId: author.id,
        status: 'APPROVED',
        likes: Math.floor(Math.random() * 50) + 10,
        views: Math.floor(Math.random() * 200) + 50,
        isVerified: Math.random() > 0.5,
        isInspiring: Math.random() > 0.6,
        createdAt: randomDate(60)
      }
    });

    // Add 2-5 comments
    const commentCount = Math.floor(Math.random() * 4) + 2;
    const allUsers = [...doctors, ...patients];
    
    for (let i = 0; i < commentCount; i++) {
      const commenter = allUsers[Math.floor(Math.random() * allUsers.length)];
      const comments = [
        'This is so inspiring! Thank you for sharing your journey.',
        'Your story gives me hope. I\'m going through something similar.',
        'Congratulations on your progress! Keep it up!',
        'Thank you for being so open. This helps more than you know.',
        'Amazing transformation! You should be proud of yourself.',
        'This motivated me to take action. Thank you!'
      ];

      await prisma.storyComment.create({
        data: {
          storyId: story.id,
          authorId: commenter.id,
          content: comments[Math.floor(Math.random() * comments.length)],
          createdAt: randomDate(30)
        }
      });
    }

    // Add likes
    const likeCount = Math.floor(Math.random() * 20) + 5;
    const likers = allUsers.sort(() => 0.5 - Math.random()).slice(0, likeCount);
    
    for (const liker of likers) {
      await prisma.storyLike.create({
        data: {
          storyId: story.id,
          userId: liker.id,
          createdAt: randomDate(30)
        }
      });
    }

    console.log(`   ✓ ${storyData.title} (${commentCount} comments, ${likeCount} likes)`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding community features:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
