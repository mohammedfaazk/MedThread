import { prisma } from '@medthread/database';

// Realistic health data for different regions
const HEALTH_SCENARIOS = [
  // Seasonal flu in major cities (mild)
  { symptoms: ['fever', 'cough', 'headache'], severity: 2, regions: ['600026', '110001', '400001', '560001'] },
  { symptoms: ['runny nose', 'sore throat'], severity: 1, regions: ['600094', '110002', '400002', '560002'] },
  
  // Food poisoning incidents (moderate)
  { symptoms: ['nausea', 'vomiting', 'diarrhea'], severity: 3, regions: ['411001', '380001', '700001'] },
  { symptoms: ['stomach pain', 'fever'], severity: 2, regions: ['411014', '380015', '700016'] },
  
  // Air pollution related (urban areas)
  { symptoms: ['cough', 'shortness of breath'], severity: 2, regions: ['110001', '400001', '700001', '560001'] },
  { symptoms: ['chest pain', 'fatigue'], severity: 2, regions: ['110016', '400050', '560025'] },
  
  // Heat wave effects (northern states)
  { symptoms: ['dizziness', 'fatigue', 'headache'], severity: 2, regions: ['302001', '226001', '208001'] },
  { symptoms: ['dehydration', 'nausea'], severity: 2, regions: ['302006', '282001', '221001'] },
  
  // Monsoon related illnesses (coastal areas)
  { symptoms: ['fever', 'joint pain'], severity: 2, regions: ['682001', '575001', '530001'] },
  { symptoms: ['skin rash', 'itching'], severity: 1, regions: ['695001', '673001', '520001'] },
  
  // Minor outbreaks (localized)
  { symptoms: ['fever', 'rash'], severity: 3, regions: ['641001', '620001'] }, // Tamil Nadu cities
  { symptoms: ['cough', 'fever'], severity: 2, regions: ['625001', '440001'] }, // Madurai, Nagpur
];

async function generateRealisticHealthData() {
  console.log('🏥 Generating realistic health data across India...');
  
  // First, create a general community for health posts
  const generalCommunity = await prisma.community.upsert({
    where: { name: 'health' },
    update: {},
    create: {
      name: 'health',
      displayName: 'Health & Wellness',
      description: 'General health discussions and symptom sharing',
      isNSFW: false,
      isPrivate: false,
      memberCount: 0,
    }
  });

  console.log('✅ Created/found general health community');
  
  // First, let's create some test users in different locations if they don't exist
  const testUsers = [
    { email: 'user.chennai@test.com', username: 'user_chennai', pincode: '600026', state: 'Tamil Nadu', city: 'Chennai' },
    { email: 'user.delhi@test.com', username: 'user_delhi', pincode: '110001', state: 'Delhi', city: 'New Delhi' },
    { email: 'user.mumbai@test.com', username: 'user_mumbai', pincode: '400001', state: 'Maharashtra', city: 'Mumbai' },
    { email: 'user.bangalore@test.com', username: 'user_bangalore', pincode: '560001', state: 'Karnataka', city: 'Bangalore' },
    { email: 'user.pune@test.com', username: 'user_pune', pincode: '411001', state: 'Maharashtra', city: 'Pune' },
    { email: 'user.hyderabad@test.com', username: 'user_hyderabad', pincode: '500001', state: 'Telangana', city: 'Hyderabad' },
    { email: 'user.kolkata@test.com', username: 'user_kolkata', pincode: '700001', state: 'West Bengal', city: 'Kolkata' },
    { email: 'user.ahmedabad@test.com', username: 'user_ahmedabad', pincode: '380001', state: 'Gujarat', city: 'Ahmedabad' },
    { email: 'user.jaipur@test.com', username: 'user_jaipur', pincode: '302001', state: 'Rajasthan', city: 'Jaipur' },
    { email: 'user.lucknow@test.com', username: 'user_lucknow', pincode: '226001', state: 'Uttar Pradesh', city: 'Lucknow' },
    { email: 'user.kochi@test.com', username: 'user_kochi', pincode: '682001', state: 'Kerala', city: 'Kochi' },
    { email: 'user.coimbatore@test.com', username: 'user_coimbatore', pincode: '641001', state: 'Tamil Nadu', city: 'Coimbatore' },
  ];

  // Create test users
  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        passwordHash: 'hashedpassword123',
        pincode: userData.pincode,
        state: userData.state,
        city: userData.city,
        district: userData.city,
        role: 'PATIENT',
        verified: true,
      }
    });
  }

  console.log(`✅ Created ${testUsers.length} test users across different locations`);

  // Generate posts with health symptoms
  let postCount = 0;
  for (const scenario of HEALTH_SCENARIOS) {
    for (const pincode of scenario.regions) {
      // Find user for this pincode
      const user = await prisma.user.findFirst({
        where: { pincode: pincode }
      });
      
      if (user) {
        // Create 2-4 posts per scenario per region
        const numPosts = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < numPosts; i++) {
          const symptomText = scenario.symptoms.join(', ');
          const severityText = scenario.severity >= 3 ? 'severe' : scenario.severity >= 2 ? 'moderate' : 'mild';
          
          const postContent = [
            `Experiencing ${symptomText}. Feeling ${severityText} discomfort.`,
            `Having ${symptomText} for the past few days. ${severityText} symptoms.`,
            `Dealing with ${symptomText}. The ${severityText} nature is concerning.`,
            `Symptoms include ${symptomText}. ${severityText} intensity.`
          ][Math.floor(Math.random() * 4)];

          await prisma.post.create({
            data: {
              title: `Health Update - ${scenario.symptoms.join(', ')}`,
              content: postContent,
              authorId: user.id,
              communityId: generalCommunity.id,
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
            }
          });
          postCount++;
        }
      }
    }
  }

  console.log(`✅ Created ${postCount} health-related posts`);

  // Generate some appointments with health complaints
  let appointmentCount = 0;
  for (const scenario of HEALTH_SCENARIOS) {
    for (const pincode of scenario.regions) {
      const user = await prisma.user.findFirst({
        where: { pincode: pincode }
      });
      
      if (user && Math.random() > 0.5) { // 50% chance of appointment per scenario
        const symptomText = scenario.symptoms.join(', ');
        const complaint = `Patient reports ${symptomText} with ${scenario.severity >= 3 ? 'high' : 'moderate'} severity`;
        
        await prisma.appointment.create({
          data: {
            patientId: user.id,
            doctorId: user.id, // Using same user as doctor for simplicity
            startTime: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
            chiefComplaint: complaint,
            notes: `Symptoms: ${symptomText}. Severity level: ${scenario.severity}/5`,
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
          }
        });
        appointmentCount++;
      }
    }
  }

  console.log(`✅ Created ${appointmentCount} health appointments`);
  console.log('🎯 Realistic health data generation complete!');
  console.log('📊 Data includes:');
  console.log(`   • ${testUsers.length} users across major Indian cities`);
  console.log(`   • ${postCount} health-related posts`);
  console.log(`   • ${appointmentCount} medical appointments`);
  console.log(`   • ${HEALTH_SCENARIOS.length} different health scenarios`);
  console.log('🗺️ Geographic coverage: Tamil Nadu, Delhi, Maharashtra, Karnataka, Telangana, West Bengal, Gujarat, Rajasthan, UP, Kerala');
}

// Run the script
generateRealisticHealthData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());