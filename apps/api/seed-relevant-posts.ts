import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

// Community-specific post templates
const communityPosts = {
  'heart_health_hub': [
    {
      title: 'Experiencing chest pain and shortness of breath',
      content: 'I\'ve been having chest pain for the past 2 days, especially when climbing stairs. Also feeling short of breath. Should I be worried? I\'m 45 years old.',
      priority: 'HIGH',
      symptoms: ['Chest Pain', 'Shortness of Breath']
    },
    {
      title: 'High blood pressure - medication not working',
      content: 'My BP has been consistently 160/100 despite taking medication. Doctor increased dosage but still no improvement. What else can I do?',
      priority: 'MEDIUM',
      symptoms: ['High Blood Pressure', 'Headache']
    },
    {
      title: 'Heart palpitations at night',
      content: 'I wake up with rapid heartbeat almost every night. It lasts for 10-15 minutes. Is this serious?',
      priority: 'MEDIUM',
      symptoms: ['Palpitations', 'Anxiety']
    },
    {
      title: 'Post-heart attack recovery tips',
      content: 'Had a heart attack 3 months ago. Looking for lifestyle changes and diet recommendations for recovery.',
      priority: 'LOW',
      symptoms: []
    },
    {
      title: 'Swollen ankles and fatigue',
      content: 'My ankles have been swelling for the past week, and I feel extremely tired. Could this be heart-related?',
      priority: 'MEDIUM',
      symptoms: ['Swelling', 'Fatigue']
    }
  ],
  'skin_and_soul': [
    {
      title: 'Severe acne breakout - nothing is working',
      content: 'I\'ve tried multiple treatments but my acne keeps getting worse. Red, painful bumps all over my face. Please help!',
      priority: 'MEDIUM',
      symptoms: ['Acne', 'Skin Redness', 'Pain']
    },
    {
      title: 'Sudden rash with itching',
      content: 'Woke up with a red rash on my arms and legs. Very itchy. Could this be an allergic reaction?',
      priority: 'MEDIUM',
      symptoms: ['Rash', 'Itching']
    },
    {
      title: 'Eczema flare-up management',
      content: 'My eczema flares up every winter. What are the best moisturizers and treatments you recommend?',
      priority: 'LOW',
      symptoms: ['Eczema', 'Dry Skin']
    },
    {
      title: 'Dark spots on face - how to treat?',
      content: 'I have dark spots appearing on my cheeks. They\'re getting darker. What could cause this?',
      priority: 'LOW',
      symptoms: ['Hyperpigmentation']
    },
    {
      title: 'Psoriasis spreading rapidly',
      content: 'My psoriasis patches are spreading quickly. Current medication not helping. Need urgent advice.',
      priority: 'HIGH',
      symptoms: ['Psoriasis', 'Skin Scaling', 'Itching']
    }
  ],
  'mind_matters': [
    {
      title: 'Severe anxiety attacks - can\'t function',
      content: 'Having panic attacks multiple times a day. Heart racing, can\'t breathe, feeling like I\'m dying. Need help urgently.',
      priority: 'HIGH',
      symptoms: ['Anxiety', 'Panic Attacks', 'Palpitations']
    },
    {
      title: 'Depression getting worse',
      content: 'I\'ve been feeling hopeless for months. No energy, can\'t sleep, lost interest in everything. Should I see a psychiatrist?',
      priority: 'HIGH',
      symptoms: ['Depression', 'Insomnia', 'Fatigue']
    },
    {
      title: 'Stress management techniques',
      content: 'Work stress is affecting my health. Looking for effective stress management strategies.',
      priority: 'LOW',
      symptoms: ['Stress']
    },
    {
      title: 'Insomnia for 2 weeks straight',
      content: 'Haven\'t slept properly in 2 weeks. Tried everything. Mind won\'t stop racing at night.',
      priority: 'MEDIUM',
      symptoms: ['Insomnia', 'Anxiety']
    },
    {
      title: 'Meditation and mindfulness tips',
      content: 'Want to start meditation for mental health. Any beginner-friendly techniques?',
      priority: 'LOW',
      symptoms: []
    }
  ],
  'lung_life': [
    {
      title: 'Severe breathing difficulty - getting worse',
      content: 'Can\'t breathe properly for the past 3 days. Wheezing, chest tightness. Using inhaler but not helping much.',
      priority: 'HIGH',
      symptoms: ['Shortness of Breath', 'Wheezing', 'Chest Tightness']
    },
    {
      title: 'Chronic cough for 3 months',
      content: 'Persistent dry cough that won\'t go away. Worse at night. No fever. What could this be?',
      priority: 'MEDIUM',
      symptoms: ['Cough']
    },
    {
      title: 'Asthma management in winter',
      content: 'My asthma gets worse in cold weather. Looking for tips to manage symptoms better.',
      priority: 'LOW',
      symptoms: ['Asthma']
    },
    {
      title: 'Chest congestion and mucus',
      content: 'Heavy chest congestion with thick mucus. Difficulty breathing when lying down.',
      priority: 'MEDIUM',
      symptoms: ['Congestion', 'Mucus', 'Breathing Difficulty']
    },
    {
      title: 'Quit smoking - lung recovery',
      content: 'Quit smoking 6 months ago. How long until my lungs recover? Still feeling breathless.',
      priority: 'LOW',
      symptoms: ['Shortness of Breath']
    }
  ],
  'sugar_watch': [
    {
      title: 'Blood sugar 350 - emergency?',
      content: 'My blood sugar reading is 350. Feeling very thirsty and dizzy. Should I go to ER?',
      priority: 'HIGH',
      symptoms: ['High Blood Sugar', 'Dizziness', 'Excessive Thirst']
    },
    {
      title: 'Type 2 diabetes newly diagnosed',
      content: 'Just diagnosed with Type 2 diabetes. Overwhelmed with information. Where do I start?',
      priority: 'MEDIUM',
      symptoms: []
    },
    {
      title: 'Low blood sugar episodes',
      content: 'Having frequent hypoglycemic episodes. Shaking, sweating, confusion. How to prevent?',
      priority: 'MEDIUM',
      symptoms: ['Low Blood Sugar', 'Sweating', 'Tremors']
    },
    {
      title: 'Diabetic diet plan help',
      content: 'Need help creating a diabetic-friendly meal plan. What foods should I avoid?',
      priority: 'LOW',
      symptoms: []
    },
    {
      title: 'Insulin dosage confusion',
      content: 'Doctor changed my insulin dosage but I\'m confused about timing. Need clarification.',
      priority: 'MEDIUM',
      symptoms: []
    }
  ],
  'bone_strong': [
    {
      title: 'Severe back pain - can\'t move',
      content: 'Sudden severe lower back pain. Can barely walk or sit. Pain radiating down my leg.',
      priority: 'HIGH',
      symptoms: ['Back Pain', 'Leg Pain', 'Mobility Issues']
    },
    {
      title: 'Knee pain and swelling',
      content: 'My knee is swollen and painful. Difficulty climbing stairs. Is this arthritis?',
      priority: 'MEDIUM',
      symptoms: ['Knee Pain', 'Swelling']
    },
    {
      title: 'Osteoporosis prevention',
      content: 'Family history of osteoporosis. What can I do to prevent it? I\'m 50 years old.',
      priority: 'LOW',
      symptoms: []
    },
    {
      title: 'Shoulder pain for weeks',
      content: 'Persistent shoulder pain. Can\'t lift my arm above shoulder level. What could this be?',
      priority: 'MEDIUM',
      symptoms: ['Shoulder Pain', 'Limited Mobility']
    },
    {
      title: 'Calcium supplements - which one?',
      content: 'Doctor recommended calcium supplements. So many options available. Which is best?',
      priority: 'LOW',
      symptoms: []
    }
  ],
  'baby_steps': [
    {
      title: 'Baby high fever 103°F - urgent',
      content: 'My 8-month-old has a fever of 103°F. Gave Tylenol but not coming down. Should I go to ER?',
      priority: 'HIGH',
      symptoms: ['Fever', 'Infant']
    },
    {
      title: 'Newborn not feeding well',
      content: 'My 2-week-old is refusing to feed. Seems lethargic. Very worried.',
      priority: 'HIGH',
      symptoms: ['Feeding Issues', 'Lethargy', 'Newborn']
    },
    {
      title: 'Vaccination schedule questions',
      content: 'Confused about the vaccination schedule for my 6-month-old. Which vaccines are due?',
      priority: 'LOW',
      symptoms: []
    },
    {
      title: 'Toddler rash and fever',
      content: 'My 2-year-old has a rash all over body with mild fever. Could this be measles?',
      priority: 'MEDIUM',
      symptoms: ['Rash', 'Fever', 'Toddler']
    },
    {
      title: 'Sleep training tips',
      content: 'My 9-month-old won\'t sleep through the night. Any gentle sleep training methods?',
      priority: 'LOW',
      symptoms: []
    }
  ],
  'womens_wellness': [
    {
      title: 'Severe menstrual cramps - unbearable',
      content: 'Period cramps are so severe I can\'t function. Pain medication not helping. Is this normal?',
      priority: 'MEDIUM',
      symptoms: ['Menstrual Cramps', 'Severe Pain']
    },
    {
      title: 'Irregular periods for 6 months',
      content: 'My periods have been irregular for 6 months. Sometimes missing entirely. Should I be concerned?',
      priority: 'MEDIUM',
      symptoms: ['Irregular Periods']
    },
    {
      title: 'PCOS management tips',
      content: 'Recently diagnosed with PCOS. Looking for lifestyle changes and treatment options.',
      priority: 'LOW',
      symptoms: []
    },
    {
      title: 'Pregnancy symptoms or something else?',
      content: 'Missed period, nausea, fatigue. Took test but negative. What else could this be?',
      priority: 'MEDIUM',
      symptoms: ['Nausea', 'Fatigue', 'Missed Period']
    },
    {
      title: 'Menopause symptoms help',
      content: 'Hot flashes, mood swings, sleep issues. Is this menopause? I\'m 48.',
      priority: 'LOW',
      symptoms: ['Hot Flashes', 'Mood Swings']
    }
  ]
};

// Doctor comments templates
const doctorComments = {
  HIGH: [
    'This sounds serious. Please visit an emergency room immediately or call emergency services.',
    'These symptoms require immediate medical attention. Don\'t delay - go to the ER now.',
    'This is a medical emergency. Please seek immediate care at the nearest hospital.',
    'I strongly recommend you see a doctor in person today. These symptoms need urgent evaluation.'
  ],
  MEDIUM: [
    'I recommend scheduling an appointment with your doctor within the next few days.',
    'These symptoms should be evaluated by a healthcare provider soon. Please book an appointment.',
    'While not an emergency, you should see your doctor this week to get this checked out.',
    'Please consult with your physician. They may want to run some tests to determine the cause.'
  ],
  LOW: [
    'Here are some tips that might help. If symptoms persist, consult your doctor.',
    'This is manageable with lifestyle changes. Happy to provide more guidance.',
    'Good question! Here\'s what I recommend based on current medical guidelines.',
    'This is a common concern. Let me share some evidence-based recommendations.'
  ]
};

async function main() {
  console.log('🌱 Starting comprehensive post seeding...\n');

  try {
    // Get all communities
    const communities = await prisma.community.findMany({
      select: { id: true, name: true, displayName: true }
    });

    console.log(`Found ${communities.length} communities\n`);

    // Get users
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 5
    });

    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      take: 5
    });

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors\n`);

    // Delete existing posts
    console.log('🗑️  Deleting existing posts...');
    await prisma.comment.deleteMany({});
    await prisma.postPriority.deleteMany({});
    await prisma.vote.deleteMany({});
    await prisma.post.deleteMany({});
    console.log('✅ Deleted all existing posts\n');

    let totalPosts = 0;
    let totalComments = 0;
    let totalVotes = 0;

    // Create posts for each community
    for (const community of communities) {
      const posts = communityPosts[community.name as keyof typeof communityPosts];
      
      if (!posts) {
        console.log(`⏭️  Skipping ${community.displayName} - no template posts`);
        continue;
      }

      console.log(`📝 Creating posts for ${community.displayName}...`);

      for (const postTemplate of posts) {
        // Random patient author
        const author = patients[Math.floor(Math.random() * patients.length)];

        // Create post
        const post = await prisma.post.create({
          data: {
            title: postTemplate.title,
            content: postTemplate.content,
            type: 'TEXT',
            authorId: author.id,
            communityId: community.id,
            mediaUrls: [],
          }
        });

        totalPosts++;

        // Create priority
        const urgencyScore = postTemplate.priority === 'HIGH' ? 85 : 
                           postTemplate.priority === 'MEDIUM' ? 55 : 25;

        await prisma.postPriority.create({
          data: {
            postId: post.id,
            priorityLevel: postTemplate.priority,
            urgencyScore,
            detectedSymptoms: postTemplate.symptoms
          }
        });

        // Add 2-4 comments from doctors
        const numComments = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numComments; i++) {
          const doctor = doctors[Math.floor(Math.random() * doctors.length)];
          const commentTemplates = doctorComments[postTemplate.priority as keyof typeof doctorComments];
          const commentText = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

          await prisma.comment.create({
            data: {
              content: commentText,
              authorId: doctor.id,
              postId: post.id
            }
          });

          totalComments++;
        }

        // Add upvotes (more for HIGH priority)
        const numVotes = postTemplate.priority === 'HIGH' ? Math.floor(Math.random() * 15) + 10 :
                        postTemplate.priority === 'MEDIUM' ? Math.floor(Math.random() * 10) + 5 :
                        Math.floor(Math.random() * 5) + 2;

        const allUsers = [...patients, ...doctors];
        const voters = allUsers.slice(0, numVotes);

        for (const voter of voters) {
          try {
            await prisma.vote.create({
              data: {
                userId: voter.id,
                postId: post.id,
                value: 1 // upvote
              }
            });
            totalVotes++;
          } catch (e) {
            // Skip if duplicate vote
          }
        }

        // Update post score
        await prisma.post.update({
          where: { id: post.id },
          data: {
            upvotes: numVotes,
            score: numVotes
          }
        });

        console.log(`  ✅ ${postTemplate.title.substring(0, 50)}... [${postTemplate.priority}]`);
      }

      console.log();
    }

    console.log('═'.repeat(60));
    console.log('✨ Seeding Complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   Posts Created: ${totalPosts}`);
    console.log(`   Comments Added: ${totalComments}`);
    console.log(`   Votes Cast: ${totalVotes}`);
    console.log(`   Communities Populated: ${Object.keys(communityPosts).length}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
