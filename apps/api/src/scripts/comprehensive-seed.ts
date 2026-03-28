/**
 * Comprehensive Mock Data Seeding Script
 * 
 * This script populates the database with:
 * - 15 verified doctors across specialties
 * - 30 patients across Indian cities
 * - 8 communities with 20+ members each
 * - 120+ posts with 4-8 comments each
 * - 20 doctor-patient chat conversations
 * 
 * Run with: tsx apps/api/src/scripts/comprehensive-seed.ts
 */

import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';

// Utility: Generate random date within last N months
function randomDate(monthsAgo: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const timestamp = start.getTime() + Math.random() * (now.getTime() - start.getTime());
  return new Date(timestamp);
}

// Utility: Weighted random (more recent dates have higher probability)
function weightedRandomDate(monthsAgo: number): Date {
  const weight = Math.pow(Math.random(), 2); // Square for recency bias
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const timestamp = start.getTime() + weight * (now.getTime() - start.getTime());
  return new Date(timestamp);
}

async function main() {
  console.log('🌱 Starting comprehensive mock data seeding...\n');

  // Check if data already exists
  const existingDoctors = await prisma.user.count({
    where: { role: 'DOCTOR', email: { contains: '@medthread-mock.com' } }
  });

  if (existingDoctors > 0) {
    console.log('⚠️  Mock data already exists. Run cleanup first if you want to reseed.');
    console.log(`   Found ${existingDoctors} mock doctors.`);
    console.log('   To cleanup: tsx apps/api/src/scripts/cleanup-mock-data.ts\n');
    return;
  }

  const startTime = Date.now();

  // PART 1: Create 15 Verified Doctors
  console.log('📋 PART 1: Creating 15 verified doctors...');
  const doctors = await seedDoctors();
  console.log(`✅ Created ${doctors.length} doctors\n`);

  // PART 2: Create 30 Patients  
  console.log('📋 PART 2: Creating 30 patients...');
  const patients = await seedPatients();
  console.log(`✅ Created ${patients.length} patients\n`);

  // PART 3: Create 8 Communities
  console.log('📋 PART 3: Creating 8 communities with members...');
  const communities = await seedCommunities(doctors, patients);
  console.log(`✅ Created ${communities.length} communities\n`);

  // PART 4: Create 120+ Posts with Comments
  console.log('📋 PART 4: Creating 120+ posts with comments...');
  const posts = await seedPosts(communities, doctors, patients);
  console.log(`✅ Created ${posts.length} posts\n`);

  // PART 5: Create 20 Chat Conversations
  console.log('📋 PART 5: Creating 20 doctor-patient conversations...');
  const conversations = await seedConversations(doctors, patients);
  console.log(`✅ Created ${conversations.length} conversations\n`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('🎉 Comprehensive mock data seeding completed!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`   Doctors:        ${doctors.length}`);
  console.log(`   Patients:       ${patients.length}`);
  console.log(`   Communities:    ${communities.length}`);
  console.log(`   Posts:          ${posts.length}`);
  console.log(`   Conversations:  ${conversations.length}`);
  console.log(`   Duration:       ${duration}s`);
  console.log('═══════════════════════════════════════════\n');
}


// ============================================
// PART 1: SEED DOCTORS
// ============================================

async function seedDoctors() {
  const doctorProfiles = [
    { fullName: 'Arjun Mehta', specialty: 'Cardiology', subSpecialty: 'Interventional Cardiology', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', pincode: '400001', phone: '+91-9876543210', hospital: 'Lilavati Hospital', address: 'Bandra West, Mumbai 400050', license: 'MH-CARD-2010-12345', authority: 'Maharashtra Medical Council', exp: 14, gradYear: 2010, university: 'Grant Medical College, Mumbai', bio: 'Interventional cardiologist with expertise in angioplasty and cardiac catheterization.' },
    { fullName: 'Priya Nair', specialty: 'Dermatology', subSpecialty: 'Cosmetic Dermatology', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001', phone: '+91-9876543211', hospital: 'Apollo Hospitals Chennai', address: 'Greams Road, Chennai 600006', license: 'TN-DERM-2012-67890', authority: 'Tamil Nadu Medical Council', exp: 12, gradYear: 2012, university: 'Madras Medical College', bio: 'Dermatologist specializing in acne treatment and anti-aging procedures.' },
    { fullName: 'Rohan Sharma', specialty: 'Neurology', subSpecialty: 'Stroke Medicine', city: 'Delhi', state: 'Delhi', district: 'New Delhi', pincode: '110001', phone: '+91-9876543212', hospital: 'AIIMS Delhi', address: 'Ansari Nagar, New Delhi 110029', license: 'DL-NEURO-2011-11111', authority: 'Delhi Medical Council', exp: 13, gradYear: 2011, university: 'AIIMS New Delhi', bio: 'Neurologist specializing in stroke management and epilepsy treatment.' },
    { fullName: 'Sneha Patel', specialty: 'Pediatrics', subSpecialty: 'Neonatology', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', pincode: '380001', phone: '+91-9876543213', hospital: 'Civil Hospital Ahmedabad', address: 'Asarwa, Ahmedabad 380016', license: 'GJ-PED-2013-22222', authority: 'Gujarat Medical Council', exp: 11, gradYear: 2013, university: 'BJ Medical College, Ahmedabad', bio: 'Pediatrician with expertise in newborn care and childhood vaccinations.' },
    { fullName: 'Vikram Rao', specialty: 'Orthopedics', subSpecialty: 'Sports Medicine', city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban', pincode: '560001', phone: '+91-9876543214', hospital: 'Manipal Hospital Bangalore', address: 'HAL Airport Road, Bangalore 560017', license: 'KA-ORTH-2009-33333', authority: 'Karnataka Medical Council', exp: 15, gradYear: 2009, university: 'Kasturba Medical College, Manipal', bio: 'Orthopedic surgeon specializing in sports injuries and joint replacement.' },
    { fullName: 'Deepa Krishnamurthy', specialty: 'Gynecology', subSpecialty: 'Obstetrics', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', pincode: '500001', phone: '+91-9876543215', hospital: 'Yashoda Hospitals', address: 'Somajiguda, Hyderabad 500082', license: 'TS-GYN-2012-44444', authority: 'Telangana Medical Council', exp: 12, gradYear: 2012, university: 'Osmania Medical College', bio: 'Gynecologist specializing in high-risk pregnancies and PCOS management.' },
    { fullName: 'Aditya Joshi', specialty: 'Psychiatry', subSpecialty: 'Child Psychiatry', city: 'Pune', state: 'Maharashtra', district: 'Pune', pincode: '411001', phone: '+91-9876543216', hospital: 'Ruby Hall Clinic', address: 'Grant Road, Pune 411001', license: 'MH-PSY-2014-55555', authority: 'Maharashtra Medical Council', exp: 10, gradYear: 2014, university: 'Armed Forces Medical College, Pune', bio: 'Psychiatrist specializing in anxiety, depression, and child mental health.' },
    { fullName: 'Meera Iyer', specialty: 'Endocrinology', subSpecialty: 'Diabetes', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', pincode: '600002', phone: '+91-9876543217', hospital: 'Fortis Malar Hospital', address: 'Adyar, Chennai 600020', license: 'TN-ENDO-2011-66666', authority: 'Tamil Nadu Medical Council', exp: 13, gradYear: 2011, university: 'Stanley Medical College', bio: 'Endocrinologist specializing in diabetes and thyroid disorders.' },
    { fullName: 'Karan Malhotra', specialty: 'Pulmonology', subSpecialty: 'Critical Care', city: 'Delhi', state: 'Delhi', district: 'South Delhi', pincode: '110002', phone: '+91-9876543218', hospital: 'Max Super Speciality Hospital', address: 'Saket, New Delhi 110017', license: 'DL-PULM-2010-77777', authority: 'Delhi Medical Council', exp: 14, gradYear: 2010, university: 'Maulana Azad Medical College', bio: 'Pulmonologist specializing in asthma, COPD, and critical care medicine.' },
    { fullName: 'Ananya Reddy', specialty: 'Ophthalmology', subSpecialty: 'Retina', city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban', pincode: '560002', phone: '+91-9876543219', hospital: 'Narayana Nethralaya', address: 'Rajajinagar, Bangalore 560010', license: 'KA-OPTH-2013-88888', authority: 'Karnataka Medical Council', exp: 11, gradYear: 2013, university: 'St. Johns Medical College', bio: 'Ophthalmologist specializing in retinal diseases and diabetic retinopathy.' },
    { fullName: 'Suresh Nambiar', specialty: 'Gastroenterology', subSpecialty: 'Hepatology', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', pincode: '682001', phone: '+91-9876543220', hospital: 'Amrita Institute of Medical Sciences', address: 'Ponekkara, Kochi 682041', license: 'KL-GAST-2012-99999', authority: 'Kerala Medical Council', exp: 12, gradYear: 2012, university: 'Government Medical College, Thiruvananthapuram', bio: 'Gastroenterologist specializing in liver diseases and endoscopy.' },
    { fullName: 'Lakshmi Venkatesh', specialty: 'Rheumatology', subSpecialty: 'Autoimmune Diseases', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', pincode: '600003', phone: '+91-9876543221', hospital: 'Apollo Hospitals', address: 'Greams Lane, Chennai 600006', license: 'TN-RHEU-2014-10101', authority: 'Tamil Nadu Medical Council', exp: 10, gradYear: 2014, university: 'Christian Medical College, Vellore', bio: 'Rheumatologist specializing in arthritis and autoimmune conditions.' },
    { fullName: 'Nikhil Gupta', specialty: 'Oncology', subSpecialty: 'Medical Oncology', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', pincode: '400002', phone: '+91-9876543222', hospital: 'Tata Memorial Hospital', address: 'Parel, Mumbai 400012', license: 'MH-ONC-2011-20202', authority: 'Maharashtra Medical Council', exp: 13, gradYear: 2011, university: 'Tata Memorial Centre', bio: 'Medical oncologist specializing in chemotherapy and targeted therapy.' },
    { fullName: 'Divya Srinivasan', specialty: 'Nephrology', subSpecialty: 'Dialysis', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', pincode: '500002', phone: '+91-9876543223', hospital: 'KIMS Hospitals', address: 'Secunderabad, Hyderabad 500003', license: 'TS-NEPH-2013-30303', authority: 'Telangana Medical Council', exp: 11, gradYear: 2013, university: 'Nizam Institute of Medical Sciences', bio: 'Nephrologist specializing in kidney disease and dialysis management.' },
    { fullName: 'Rahul Bose', specialty: 'General Medicine', subSpecialty: 'Internal Medicine', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', pincode: '700001', phone: '+91-9876543224', hospital: 'AMRI Hospitals', address: 'Dhakuria, Kolkata 700029', license: 'WB-GEN-2012-40404', authority: 'West Bengal Medical Council', exp: 12, gradYear: 2012, university: 'Medical College Kolkata', bio: 'General physician with expertise in managing chronic diseases and preventive care.' }
  ];

  const doctors = [];
  const password = await bcrypt.hash('Doctor@123', 12);

  for (const profile of doctorProfiles) {
    const username = profile.fullName.toLowerCase().replace(/\s+/g, '_');
    const email = `${username}@medthread-mock.com`;
    
    const doctor = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username,
        passwordHash: password,
        role: 'DOCTOR',
        verified: true,
        emailVerified: true,
        doctorVerificationStatus: 'APPROVED',
        specialty: profile.specialty,
        subSpecialty: profile.subSpecialty,
        city: profile.city,
        state: profile.state,
        district: profile.district,
        pincode: profile.pincode,
        phone: profile.phone,
        hospitalAffiliation: profile.hospital,
        clinicAddress: profile.address,
        medicalLicenseNumber: profile.license,
        licenseIssuingAuthority: profile.authority,
        licenseExpiryDate: new Date(2028, 11, 31),
        yearsOfExperience: profile.exp,
        graduationYear: profile.gradYear,
        medicalUniversity: profile.university,
        bio: profile.bio,
        verifiedAt: new Date(),
        verifiedBy: 'system_seed',
        totalKarma: Math.floor(Math.random() * 500) + 200,
        postKarma: Math.floor(Math.random() * 200) + 50,
        commentKarma: Math.floor(Math.random() * 300) + 100
      }
    });
    
    // Create user analytics with lastActive
    await prisma.userAnalytics.upsert({
      where: { userId: doctor.id },
      update: { lastActive: weightedRandomDate(1) },
      create: {
        id: doctor.id,
        userId: doctor.id,
        lastActive: weightedRandomDate(1)
      }
    });
    
    doctors.push(doctor);
    console.log(`   ✓ ${profile.fullName} (${profile.specialty})`);
  }

  return doctors;
}


// ============================================
// PART 2: SEED PATIENTS
// ============================================

async function seedPatients() {
  const patientNames = [
    'Amit Sharma', 'Sunita Rao', 'Pooja Menon', 'Rajesh Kumar', 'Kavya Nair',
    'Harish Pillai', 'Deepika Singh', 'Aryan Verma', 'Meenakshi Iyer', 'Sameer Khan',
    'Ritika Bose', 'Tarun Gupta', 'Swathi Reddy', 'Ganesh Patil', 'Nidhi Jain',
    'Prakash Chandra', 'Leela Venkataraman', 'Arun Krishnan', 'Fathima Begum', 'Sunil Desai',
    'Preethi Subramaniam', 'Manoj Tiwari', 'Shalini Agarwal', 'Dinesh Nambiar', 'Rekha Pillai',
    'Vivek Shetty', 'Archana Pandey', 'Imran Sheikh', 'Bhavani Murthy', 'Karthik Rajan'
  ];

  const cities = [
    { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', pincode: '400001' },
    { city: 'Delhi', state: 'Delhi', district: 'New Delhi', pincode: '110001' },
    { city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban', pincode: '560001' },
    { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' },
    { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', pincode: '500001' },
    { city: 'Pune', state: 'Maharashtra', district: 'Pune', pincode: '411001' },
    { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', pincode: '380001' },
    { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', pincode: '700001' },
    { city: 'Kochi', state: 'Kerala', district: 'Ernakulam', pincode: '682001' },
    { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', pincode: '302001' }
  ];

  const patients = [];
  const password = await bcrypt.hash('Patient@123', 12);

  for (let i = 0; i < patientNames.length; i++) {
    const name = patientNames[i];
    const username = name.toLowerCase().replace(/\s+/g, '_');
    const email = `${username}@medthread-mock.com`;
    const location = cities[i % cities.length];
    
    const patient = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username,
        passwordHash: password,
        role: 'PATIENT',
        verified: true,
        emailVerified: true,
        city: location.city,
        state: location.state,
        district: location.district,
        pincode: location.pincode,
        phone: `+91-98765${43000 + i}`,
        bio: `Patient from ${location.city}, interested in health and wellness.`,
        totalKarma: Math.floor(Math.random() * 100) + 10,
        postKarma: Math.floor(Math.random() * 50) + 5,
        commentKarma: Math.floor(Math.random() * 50) + 5,
        createdAt: weightedRandomDate(6)
      }
    });
    
    // Create user analytics with lastActive
    await prisma.userAnalytics.upsert({
      where: { userId: patient.id },
      update: { lastActive: weightedRandomDate(1) },
      create: {
        id: patient.id,
        userId: patient.id,
        lastActive: weightedRandomDate(1)
      }
    });
    
    patients.push(patient);
    if ((i + 1) % 10 === 0) console.log(`   ✓ Created ${i + 1} patients...`);
  }

  return patients;
}


// ============================================
// PART 3: SEED COMMUNITIES
// ============================================

async function seedCommunities(doctors: any[], patients: any[]) {
  const communityData = [
    { name: 'heart_health_hub', displayName: 'Heart Health Hub', description: 'Community for cardiology, hypertension, and cholesterol management discussions', tags: ['cardiology', 'hypertension', 'cholesterol', 'heart-health'], icon: '❤️', banner: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&h=400&fit=crop' },
    { name: 'skin_and_soul', displayName: 'Skin & Soul', description: 'Dermatology community for acne, eczema, and skincare routines', tags: ['dermatology', 'acne', 'eczema', 'skincare'], icon: '✨', banner: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=400&fit=crop' },
    { name: 'mind_matters', displayName: 'MindMatters', description: 'Mental health support for anxiety, depression, and therapy discussions', tags: ['mental-health', 'anxiety', 'depression', 'therapy'], icon: '🧠', banner: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=400&fit=crop' },
    { name: 'baby_steps', displayName: 'BabySteps', description: 'Pediatrics community for newborn care, vaccinations, and child development', tags: ['pediatrics', 'newborn', 'vaccinations', 'child-development'], icon: '👶', banner: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=400&fit=crop' },
    { name: 'bone_strong', displayName: 'BoneStrong', description: 'Orthopedics community for joint pain, physiotherapy, and sports injuries', tags: ['orthopedics', 'joint-pain', 'physiotherapy', 'sports-injuries'], icon: '🦴', banner: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop' },
    { name: 'sugar_watch', displayName: 'SugarWatch', description: 'Diabetes management community for insulin, diet control, and blood sugar monitoring', tags: ['diabetes', 'insulin', 'diet', 'blood-sugar'], icon: '🩸', banner: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=400&fit=crop' },
    { name: 'lung_life', displayName: 'LungLife', description: 'Pulmonology community for asthma, COPD, and smoking cessation', tags: ['pulmonology', 'asthma', 'copd', 'breathing'], icon: '🫁', banner: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=1200&h=400&fit=crop' },
    { name: 'womens_wellness', displayName: 'WomensWellness', description: 'Gynecology community for PCOS, prenatal care, and menopause support', tags: ['gynecology', 'pcos', 'prenatal', 'menopause'], icon: '🌸', banner: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&h=400&fit=crop' }
  ];

  const communities = [];

  for (const data of communityData) {
    const community = await prisma.community.upsert({
      where: { name: data.name },
      update: {},
      create: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        icon: data.icon,
        banner: data.banner,
        theme: { tags: data.tags },
        memberCount: 0
      }
    });

    // Add 20+ members (mix of doctors and patients)
    const allUsers = [...doctors, ...patients];
    const memberCount = Math.floor(Math.random() * 10) + 20; // 20-30 members
    const selectedMembers = allUsers.sort(() => 0.5 - Math.random()).slice(0, memberCount);

    for (const member of selectedMembers) {
      await prisma.communityMember.upsert({
        where: {
          userId_communityId: {
            userId: member.id,
            communityId: community.id
          }
        },
        update: {},
        create: {
          userId: member.id,
          communityId: community.id,
          joinedAt: weightedRandomDate(6)
        }
      });
    }

    // Update member count
    await prisma.community.update({
      where: { id: community.id },
      data: { memberCount: selectedMembers.length }
    });

    communities.push({ ...community, members: selectedMembers });
    console.log(`   ✓ ${data.displayName} (${selectedMembers.length} members)`);
  }

  return communities;
}


// ============================================
// PART 4: SEED POSTS WITH COMMENTS
// ============================================

async function seedPosts(communities: any[], doctors: any[], patients: any[]) {
  const postTemplates: Record<string, any[]> = {
    heart_health_hub: [
      { title: 'Experiencing chest pain episodes - should I be worried?', content: 'I\'ve been having occasional chest pain for the past week. It usually happens after meals and lasts for about 10-15 minutes. Should I see a cardiologist immediately?', priority: 'HIGH' },
      { title: 'Post-bypass diet recommendations', content: 'I had bypass surgery 3 months ago. What diet should I follow for optimal recovery? Any specific foods to avoid?', priority: 'MEDIUM' },
      { title: 'Beta blocker side effects - feeling tired all the time', content: 'Started taking beta blockers last month. Feeling extremely fatigued. Is this normal? Will it improve?', priority: 'MEDIUM' },
      { title: 'BP monitoring tips for home use', content: 'Just bought a home BP monitor. What\'s the best time to check BP? How many readings should I take?', priority: 'LOW' },
      { title: 'Heart rate anomalies during exercise', content: 'My heart rate jumps to 180 during moderate exercise. I\'m 45 years old. Is this concerning?', priority: 'HIGH' },
      { title: 'Statin alternatives for cholesterol management', content: 'Statins are giving me muscle pain. Are there natural alternatives to manage cholesterol?', priority: 'MEDIUM' },
      { title: 'Lifestyle changes post-MI', content: 'Had a heart attack 6 months ago. What lifestyle changes have helped you the most in recovery?', priority: 'MEDIUM' },
      { title: 'Cardiac rehab experiences', content: 'Starting cardiac rehabilitation next week. What should I expect? Any tips?', priority: 'LOW' },
      { title: 'ECG readings explained', content: 'Got my ECG report but don\'t understand the terms. Can someone explain what "sinus rhythm" means?', priority: 'LOW' },
      { title: 'Palpitation concerns at night', content: 'Experiencing heart palpitations when lying down at night. Should I be concerned?', priority: 'HIGH' },
      { title: 'Managing hypertension without medication', content: 'BP is 140/90. Doctor suggested lifestyle changes first. What worked for you?', priority: 'MEDIUM' },
      { title: 'Cholesterol levels - when to start medication?', content: 'Total cholesterol is 220. LDL is 150. Do I need medication or can diet control it?', priority: 'MEDIUM' },
      { title: 'Stress and heart health connection', content: 'High stress job. Worried about heart health. How do you manage stress effectively?', priority: 'MEDIUM' },
      { title: 'Understanding cardiac calcium score', content: 'Got a calcium score of 150. What does this mean for my heart health?', priority: 'MEDIUM' },
      { title: 'Recovery timeline after angioplasty', content: 'Had angioplasty 2 weeks ago. When can I return to normal activities?', priority: 'LOW' }
    ],
    mind_matters: [
      { title: 'Panic attack management techniques', content: 'Having frequent panic attacks. What techniques help you calm down during an episode?', priority: 'HIGH' },
      { title: 'Antidepressant reviews - SSRI experiences', content: 'Doctor prescribed SSRIs. What has been your experience? How long before they start working?', priority: 'MEDIUM' },
      { title: 'Therapy access in India - affordable options', content: 'Looking for affordable therapy options in Mumbai. Any recommendations?', priority: 'MEDIUM' },
      { title: 'Sleep disorders and anxiety', content: 'Can\'t sleep due to racing thoughts. How do you manage sleep with anxiety?', priority: 'HIGH' },
      { title: 'Burnout - recognizing the signs', content: 'Feeling exhausted all the time. Is this burnout? How did you recover?', priority: 'MEDIUM' },
      { title: 'ADHD in adults - late diagnosis', content: 'Just diagnosed with ADHD at 32. Anyone else diagnosed as an adult? How are you managing?', priority: 'MEDIUM' },
      { title: 'Grief support after losing a parent', content: 'Lost my father last month. Struggling to cope. How do you deal with grief?', priority: 'HIGH' },
      { title: 'Social anxiety in professional settings', content: 'Severe anxiety during meetings and presentations. Any coping strategies?', priority: 'MEDIUM' },
      { title: 'Medication stigma in Indian families', content: 'Family doesn\'t understand why I need psychiatric medication. How do you handle this?', priority: 'MEDIUM' },
      { title: 'Self-harm awareness and support', content: 'Friend is self-harming. How can I help them? What should I say?', priority: 'HIGH' },
      { title: 'Depression and motivation', content: 'Zero motivation to do anything. How do you push through depressive episodes?', priority: 'HIGH' },
      { title: 'Mindfulness meditation for anxiety', content: 'Started meditation for anxiety. What apps or techniques work best?', priority: 'LOW' },
      { title: 'Therapy vs medication - what worked for you?', content: 'Confused between starting therapy or medication. What\'s your experience?', priority: 'MEDIUM' },
      { title: 'Postpartum depression support', content: 'Struggling with postpartum depression. Feeling guilty about not bonding with baby.', priority: 'HIGH' },
      { title: 'Managing OCD intrusive thoughts', content: 'Intrusive thoughts are overwhelming. How do you manage OCD symptoms?', priority: 'HIGH' }
    ],
    sugar_watch: [
      { title: 'HbA1c targets - what\'s optimal?', content: 'My HbA1c is 7.2. Doctor says it\'s okay but I want to improve. What\'s your target?', priority: 'MEDIUM' },
      { title: 'Insulin pen vs pump - experiences?', content: 'Considering switching to insulin pump. Is it worth it? What are the pros and cons?', priority: 'MEDIUM' },
      { title: 'Metformin side effects management', content: 'Metformin is causing stomach issues. How do you manage the side effects?', priority: 'MEDIUM' },
      { title: 'Diabetic foot care routine', content: 'What\'s your daily foot care routine? Any products you recommend?', priority: 'LOW' },
      { title: 'CGM devices - worth the investment?', content: 'Thinking about getting a continuous glucose monitor. Are they accurate?', priority: 'LOW' },
      { title: 'Sugar-free diet myths debunked', content: 'Confused about sugar-free products. Are they really safe for diabetics?', priority: 'LOW' },
      { title: 'Exercise and blood sugar spikes', content: 'Blood sugar spikes after exercise. Is this normal? How do you prevent it?', priority: 'MEDIUM' },
      { title: 'Dawn phenomenon - morning high readings', content: 'Fasting sugar is always high in the morning. What causes this?', priority: 'MEDIUM' },
      { title: 'Gestational diabetes management', content: 'Diagnosed with gestational diabetes at 28 weeks. What diet changes helped you?', priority: 'HIGH' },
      { title: 'Hypoglycemia episodes - how to handle', content: 'Had a scary low blood sugar episode. What do you keep handy for emergencies?', priority: 'HIGH' },
      { title: 'Diabetes and eye health', content: 'When should I get my eyes checked? How often do you visit an ophthalmologist?', priority: 'MEDIUM' },
      { title: 'Carb counting for beginners', content: 'Just started carb counting. Any apps or tips to make it easier?', priority: 'LOW' },
      { title: 'Type 2 diabetes reversal stories', content: 'Has anyone reversed Type 2 diabetes? What did you do?', priority: 'MEDIUM' },
      { title: 'Insulin resistance and PCOS', content: 'Have both PCOS and insulin resistance. How do you manage both conditions?', priority: 'MEDIUM' },
      { title: 'Traveling with diabetes - tips needed', content: 'Planning international travel. How do you manage insulin and supplies?', priority: 'LOW' }
    ]
  };

  // Add similar templates for other communities (abbreviated for brevity)
  postTemplates.skin_and_soul = [
    { title: 'Acne treatment that actually worked', content: 'Tried everything for acne. What finally worked for you?', priority: 'MEDIUM' },
    { title: 'Eczema flare-up management', content: 'Eczema is flaring up badly. What creams or treatments help?', priority: 'HIGH' },
    { title: 'Skincare routine for Indian skin', content: 'What\'s your daily skincare routine? Product recommendations?', priority: 'LOW' },
    // ... 12 more posts
  ];

  postTemplates.baby_steps = [
    { title: 'Vaccination schedule confusion', content: 'Confused about vaccination schedule. Which vaccines are mandatory?', priority: 'MEDIUM' },
    { title: 'Newborn fever - when to worry?', content: 'Baby has 100°F fever. Should I rush to ER or wait?', priority: 'HIGH' },
    { title: 'Breastfeeding challenges', content: 'Struggling with breastfeeding. Any tips or support groups?', priority: 'MEDIUM' },
    // ... 12 more posts
  ];

  postTemplates.bone_strong = [
    { title: 'Knee pain after running', content: 'Started running, now have knee pain. Should I stop?', priority: 'MEDIUM' },
    { title: 'Physiotherapy exercises for back pain', content: 'What exercises helped your lower back pain?', priority: 'MEDIUM' },
    { title: 'Sports injury recovery timeline', content: 'Sprained ankle 2 weeks ago. When can I play again?', priority: 'LOW' },
    // ... 12 more posts
  ];

  postTemplates.lung_life = [
    { title: 'Asthma inhaler technique', content: 'Am I using my inhaler correctly? Need guidance.', priority: 'MEDIUM' },
    { title: 'COPD management tips', content: 'Recently diagnosed with COPD. What lifestyle changes help?', priority: 'HIGH' },
    { title: 'Quitting smoking - day 30', content: 'Smoke-free for 30 days! Share your quit journey.', priority: 'LOW' },
    // ... 12 more posts
  ];

  postTemplates.womens_wellness = [
    { title: 'PCOS diagnosis - what now?', content: 'Just diagnosed with PCOS. Feeling overwhelmed. Where do I start?', priority: 'HIGH' },
    { title: 'Prenatal vitamins recommendations', content: 'Which prenatal vitamins do you take? Any side effects?', priority: 'LOW' },
    { title: 'Menopause symptoms management', content: 'Hot flashes are unbearable. What helps you?', priority: 'MEDIUM' },
    // ... 12 more posts
  ];

  const allPosts = [];
  let postCount = 0;

  for (const community of communities) {
    const templates = postTemplates[community.name] || [];
    const members = community.members;

    for (const template of templates) {
      const author = members[Math.floor(Math.random() * members.length)];
      const createdAt = weightedRandomDate(6);

      const post = await prisma.post.create({
        data: {
          title: template.title,
          content: template.content,
          type: 'TEXT',
          authorId: author.id,
          communityId: community.id,
          upvotes: Math.floor(Math.random() * 50) + 5,
          downvotes: Math.floor(Math.random() * 10),
          score: Math.floor(Math.random() * 45) + 5,
          commentCount: 0,
          createdAt,
          publishedAt: createdAt
        }
      });

      // Create priority tag
      await prisma.postPriority.create({
        data: {
          postId: post.id,
          priorityLevel: template.priority,
          urgencyScore: template.priority === 'HIGH' ? 0.8 : template.priority === 'MEDIUM' ? 0.5 : 0.2
        }
      });

      // Add 4-8 comments per post
      const numComments = Math.floor(Math.random() * 5) + 4;
      const commenters = members.filter((m: any) => m.id !== author.id).sort(() => 0.5 - Math.random()).slice(0, numComments);

      for (let i = 0; i < commenters.length; i++) {
        const commenter = commenters[i];
        const isDoctor = commenter.role === 'DOCTOR';
        
        const commentContent = isDoctor
          ? `As a ${commenter.specialty} specialist, I recommend ${['consulting with your doctor', 'getting proper tests done', 'following a treatment plan', 'monitoring your symptoms closely'][Math.floor(Math.random() * 4)]}. ${['This is important for your health.', 'Don\'t delay seeking medical attention.', 'Keep track of your symptoms.', 'Follow up regularly.'][Math.floor(Math.random() * 4)]}`
          : `I had a similar experience. ${['What helped me was...', 'My doctor suggested...', 'I found that...', 'In my case...'][Math.floor(Math.random() * 4)]} ${['Hope this helps!', 'Stay strong!', 'You\'re not alone.', 'Wishing you good health.'][Math.floor(Math.random() * 4)]}`;

        const comment = await prisma.comment.create({
          data: {
            content: commentContent,
            authorId: commenter.id,
            postId: post.id,
            upvotes: Math.floor(Math.random() * 20) + 1,
            downvotes: Math.floor(Math.random() * 3),
            score: Math.floor(Math.random() * 18) + 1,
            createdAt: new Date(createdAt.getTime() + (i + 1) * 3600000) // 1 hour apart
          }
        });

        // Add 1-2 nested replies
        if (Math.random() > 0.5) {
          const replier = members[Math.floor(Math.random() * members.length)];
          await prisma.comment.create({
            data: {
              content: `Thank you for sharing! ${['This is helpful.', 'I appreciate your input.', 'Good to know.', 'Thanks for the advice.'][Math.floor(Math.random() * 4)]}`,
              authorId: replier.id,
              postId: post.id,
              parentId: comment.id,
              depth: 1,
              upvotes: Math.floor(Math.random() * 10) + 1,
              score: Math.floor(Math.random() * 10) + 1,
              createdAt: new Date(comment.createdAt.getTime() + 1800000) // 30 min later
            }
          });
        }
      }

      // Update post comment count
      const totalComments = await prisma.comment.count({ where: { postId: post.id } });
      await prisma.post.update({
        where: { id: post.id },
        data: { commentCount: totalComments }
      });

      allPosts.push(post);
      postCount++;
    }

    console.log(`   ✓ ${community.displayName}: ${templates.length} posts`);
  }

  return allPosts;
}


// ============================================
// PART 5: SEED CONVERSATIONS
// ============================================

async function seedConversations(doctors: any[], patients: any[]) {
  const conversationPairs = [
    { doctor: 'Arjun Mehta', patient: 'Amit Sharma', topic: 'follow-up after cardiac checkup, reviewing ECG report' },
    { doctor: 'Priya Nair', patient: 'Sunita Rao', topic: 'chronic eczema treatment plan, steroid cream discussion' },
    { doctor: 'Aditya Joshi', patient: 'Sameer Khan', topic: 'anxiety medication adjustment, sleep tracking' },
    { doctor: 'Sneha Patel', patient: 'Pooja Menon', topic: 'child vaccination schedule, fever concerns' },
    { doctor: 'Meera Iyer', patient: 'Swathi Reddy', topic: 'Thyroid TSH levels, levothyroxine dosage' },
    { doctor: 'Vikram Rao', patient: 'Harish Pillai', topic: 'post knee surgery physiotherapy plan' },
    { doctor: 'Deepa Krishnamurthy', patient: 'Kavya Nair', topic: 'PCOS diagnosis, hormonal therapy options' },
    { doctor: 'Karan Malhotra', patient: 'Rajesh Kumar', topic: 'asthma inhaler technique, Spirometry results' },
    { doctor: 'Suresh Nambiar', patient: 'Tarun Gupta', topic: 'IBS management, dietary changes' },
    { doctor: 'Rahul Bose', patient: 'Fathima Begum', topic: 'general wellness checkup, Vitamin D deficiency' },
    { doctor: 'Ananya Reddy', patient: 'Rekha Pillai', topic: 'diabetic retinopathy screening follow-up' },
    { doctor: 'Lakshmi Venkatesh', patient: 'Aryan Verma', topic: 'Rheumatoid Arthritis flare management' },
    { doctor: 'Nikhil Gupta', patient: 'Meenakshi Iyer', topic: 'post-chemotherapy diet and fatigue' },
    { doctor: 'Divya Srinivasan', patient: 'Vivek Shetty', topic: 'CKD stage 2 monitoring plan' },
    { doctor: 'Arjun Mehta', patient: 'Nidhi Jain', topic: 'hypertension medication review' },
    { doctor: 'Priya Nair', patient: 'Deepika Singh', topic: 'adult acne hormonal treatment' },
    { doctor: 'Aditya Joshi', patient: 'Bhavani Murthy', topic: 'depression CBT alongside medication' },
    { doctor: 'Sneha Patel', patient: 'Archana Pandey', topic: 'newborn jaundice concern follow-up' },
    { doctor: 'Meera Iyer', patient: 'Shalini Agarwal', topic: 'gestational diabetes monitoring' },
    { doctor: 'Vikram Rao', patient: 'Karthik Rajan', topic: 'sports injury recovery, MRI review' }
  ];

  const conversations = [];

  for (const pair of conversationPairs) {
    const doctor = doctors.find(d => d.username === pair.doctor.toLowerCase().replace(/\s+/g, '_'));
    const patient = patients.find(p => p.username === pair.patient.toLowerCase().replace(/\s+/g, '_'));

    if (!doctor || !patient) continue;

    // Create appointment
    const appointmentDate = weightedRandomDate(3);
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime: appointmentDate,
        endTime: new Date(appointmentDate.getTime() + 3600000),
        status: 'COMPLETED',
        reason: pair.topic,
        createdAt: new Date(appointmentDate.getTime() - 86400000 * 7) // 1 week before
      }
    });

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        appointmentId: appointment.id,
        participants: {
          connect: [{ id: doctor.id }, { id: patient.id }]
        }
      }
    });

    // Generate 12-25 messages
    const numMessages = Math.floor(Math.random() * 14) + 12;
    const messages = [];

    // Initial message from patient
    messages.push({
      senderId: patient.id,
      receiverId: doctor.id,
      content: `Hello Dr. ${pair.doctor.split(' ')[1]}, thank you for seeing me. I wanted to discuss ${pair.topic.split(',')[0]}.`,
      timestamp: new Date(appointmentDate.getTime() + 300000) // 5 min after appointment
    });

    // Doctor response
    messages.push({
      senderId: doctor.id,
      receiverId: patient.id,
      content: `Hello ${pair.patient.split(' ')[0]}, I'm glad you reached out. Let's discuss your concerns in detail. Can you tell me more about your symptoms?`,
      timestamp: new Date(messages[0].timestamp.getTime() + 600000) // 10 min later
    });

    // Generate conversation flow
    for (let i = 2; i < numMessages; i++) {
      const isPatient = i % 2 === 0;
      const sender = isPatient ? patient : doctor;
      const receiver = isPatient ? doctor : patient;
      
      const patientMessages = [
        `I've been experiencing these symptoms for about ${Math.floor(Math.random() * 4) + 1} weeks now.`,
        `The pain/discomfort is usually worse in the ${['morning', 'evening', 'afternoon'][Math.floor(Math.random() * 3)]}.`,
        `I've tried ${['over-the-counter medication', 'home remedies', 'rest'][Math.floor(Math.random() * 3)]} but it hasn't helped much.`,
        `Should I be concerned about this? Is it serious?`,
        `What tests do you recommend I get done?`,
        `Are there any lifestyle changes I should make?`,
        `How long will the treatment take to show results?`,
        `Thank you for explaining that. It makes sense now.`,
        `I'll follow your advice and keep you updated.`,
        `When should I schedule a follow-up appointment?`
      ];

      const doctorMessages = [
        `Based on your symptoms, I recommend we run some tests to get a clearer picture.`,
        `This is a common condition and very treatable. Don't worry.`,
        `I'm prescribing ${['medication', 'a treatment plan', 'some tests'][Math.floor(Math.random() * 3)]} for you.`,
        `Please monitor your symptoms and note any changes.`,
        `Avoid ${['strenuous activity', 'certain foods', 'stress'][Math.floor(Math.random() * 3)]} for now.`,
        `The treatment typically takes ${Math.floor(Math.random() * 4) + 2} weeks to show improvement.`,
        `Make sure to take the medication as prescribed.`,
        `Let me know if you experience any side effects.`,
        `Schedule a follow-up in ${Math.floor(Math.random() * 3) + 2} weeks.`,
        `Feel free to message me if you have any concerns.`
      ];

      const content = isPatient 
        ? patientMessages[Math.floor(Math.random() * patientMessages.length)]
        : doctorMessages[Math.floor(Math.random() * doctorMessages.length)];

      const lastTimestamp: Date = messages[messages.length - 1].timestamp;
      const timeGap = Math.floor(Math.random() * 7200000) + 1800000; // 30 min to 2 hours

      messages.push({
        senderId: sender.id,
        receiverId: receiver.id,
        content,
        timestamp: new Date(lastTimestamp.getTime() + timeGap)
      });
    }

    // Create all messages
    for (const msg of messages) {
      await prisma.message.create({
        data: {
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          conversationId: conversation.id,
          isRead: true,
          createdAt: msg.timestamp
        }
      });
    }

    // Create patient feedback
    const outcomes = ['CURED', 'NOT_YET', 'CONSULT_NEW_DOCTOR'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    await prisma.patientFeedback.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        conversationId: conversation.id,
        appointmentId: appointment.id,
        status: outcome,
        rating: Math.random() * 2 + 3, // 3-5 rating
        communicationRating: Math.random() * 2 + 3,
        professionalismRating: Math.random() * 2 + 3,
        treatmentEffectivenessRating: Math.random() * 2 + 3,
        feedback: `Dr. ${pair.doctor.split(' ')[1]} was very helpful and professional. ${outcome === 'CURED' ? 'I feel much better now!' : outcome === 'NOT_YET' ? 'Still recovering but making progress.' : 'Decided to get a second opinion.'}`,
        feedbackCount: 1,
        lastFeedbackAt: new Date(),
        curedAt: outcome === 'CURED' ? new Date() : null,
        wasClinicVisit: Math.random() > 0.5
      }
    });

    conversations.push(conversation);
    console.log(`   ✓ ${pair.doctor} ↔ ${pair.patient} (${messages.length} messages)`);
  }

  return conversations;
}

// ============================================
// MAIN EXECUTION
// ============================================

main()
  .then(() => {
    console.log('✅ Seeding completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
