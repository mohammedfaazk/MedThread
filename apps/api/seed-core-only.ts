/**
 * Core Seed Script - Only seeds Prisma schema tables
 * Run: npx ts-node seed-core-only.ts
 */

import { PrismaClient, UserRole, DoctorVerificationStatus, Prisma } from '@medthread/database';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seedCore() {
  console.log('🌱 Starting core seed (Prisma tables only)...\n');

  try {
    // 1. Create Admin User
    console.log('1️⃣ Creating admin user...');
    const adminPassword = await hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@medthread.com' },
      update: {
        passwordHash: adminPassword
      },
      create: {
        email: 'admin@medthread.com',
        username: 'admin',
        passwordHash: adminPassword,
        role: UserRole.ADMIN,
        verified: true,
        emailVerified: true
      }
    });
    console.log('✓ Admin user created:', admin.email);

    // 2. Create Doctors
    console.log('\n2️⃣ Creating doctors...');
    const doctorPassword = await hash('doctor123', 10);
    
    const doctors = [];
    const doctorData = [
      {
        email: 'dr.smith@medthread.com',
        username: 'DrSmith',
        specialty: 'Cardiology',
        city: 'New York',
        hospitalAffiliation: 'NYC General Hospital'
      },
      {
        email: 'dr.johnson@medthread.com',
        username: 'DrJohnson',
        specialty: 'Pediatrics',
        city: 'Los Angeles',
        hospitalAffiliation: 'LA Children Hospital'
      },
      {
        email: 'dr.williams@medthread.com',
        username: 'DrWilliams',
        specialty: 'Dermatology',
        city: 'Chicago',
        hospitalAffiliation: 'Chicago Medical Center'
      },
      {
        email: 'dr.brown@medthread.com',
        username: 'DrBrown',
        specialty: 'Orthopedics',
        city: 'Houston',
        hospitalAffiliation: 'Houston Orthopedic Institute'
      },
      {
        email: 'dr.davis@medthread.com',
        username: 'DrDavis',
        specialty: 'Neurology',
        city: 'Phoenix',
        hospitalAffiliation: 'Phoenix Neurological Center'
      }
    ];

    for (const data of doctorData) {
      const doctor = await prisma.user.upsert({
        where: { email: data.email },
        update: {
          passwordHash: doctorPassword
        },
        create: {
          email: data.email,
          username: data.username,
          passwordHash: doctorPassword,
          role: UserRole.DOCTOR,
          verified: true,
          emailVerified: true,
          doctorVerificationStatus: DoctorVerificationStatus.APPROVED,
          specialty: data.specialty,
          yearsOfExperience: Math.floor(Math.random() * 15) + 5,
          hospitalAffiliation: data.hospitalAffiliation,
          clinicAddress: `${Math.floor(Math.random() * 999) + 1} Medical Plaza, ${data.city}`,
          phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          bio: `Experienced ${data.specialty} specialist with over ${Math.floor(Math.random() * 15) + 5} years of practice.`,
          medicalLicenseNumber: `MD${Math.floor(Math.random() * 100000)}`,
          licenseIssuingAuthority: 'State Medical Board',
          licenseExpiryDate: new Date('2025-12-31')
        }
      });
      doctors.push(doctor);
    }
    console.log(`✓ Created ${doctors.length} doctors`);

    // 3. Create Patients
    console.log('\n3️⃣ Creating patients...');
    const patientPassword = await hash('patient123', 10);
    
    const patients = [];
    const patientData = [
      { email: 'john.doe@example.com', username: 'JohnDoe' },
      { email: 'jane.smith@example.com', username: 'JaneSmith' },
      { email: 'bob.wilson@example.com', username: 'BobWilson' },
      { email: 'alice.brown@example.com', username: 'AliceBrown' },
      { email: 'charlie.davis@example.com', username: 'CharlieDavis' }
    ];

    for (const data of patientData) {
      const patient = await prisma.user.upsert({
        where: { email: data.email },
        update: {
          passwordHash: patientPassword
        },
        create: {
          email: data.email,
          username: data.username,
          passwordHash: patientPassword,
          role: UserRole.PATIENT,
          verified: true,
          emailVerified: true
        }
      });
      patients.push(patient);
    }
    console.log(`✓ Created ${patients.length} patients`);

    // 4. Create Communities
    console.log('\n4️⃣ Creating communities...');
    const communities = [];
    const communityData = [
      { name: 'cardiology', displayName: 'Cardiology', description: 'Heart health and cardiovascular discussions' },
      { name: 'pediatrics', displayName: 'Pediatrics', description: 'Child health and development' },
      { name: 'dermatology', displayName: 'Dermatology', description: 'Skin care and conditions' },
      { name: 'general-health', displayName: 'General Health', description: 'General health discussions' },
      { name: 'mental-health', displayName: 'Mental Health', description: 'Mental wellness and support' }
    ];

    for (const data of communityData) {
      const community = await prisma.community.upsert({
        where: { name: data.name },
        update: {},
        create: {
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          memberCount: 0
        }
      });
      communities.push(community);
    }
    console.log(`✓ Created ${communities.length} communities`);

    // 5. Create Sample Posts
    console.log('\n5️⃣ Creating sample posts...');
    let postsCreated = 0;
    
    for (let i = 0; i < 3; i++) {
      const patient = patients[i % patients.length];
      const community = communities[i % communities.length];
      
      await prisma.post.create({
        data: {
          title: `Question about ${community.displayName}`,
          content: `I have a question regarding ${community.displayName.toLowerCase()}. Can someone help?`,
          type: 'TEXT',
          authorId: patient.id,
          communityId: community.id,
          upvotes: Math.floor(Math.random() * 50),
          downvotes: Math.floor(Math.random() * 5),
          score: Math.floor(Math.random() * 45)
        }
      });
      postsCreated++;
    }
    console.log(`✓ Created ${postsCreated} posts`);

    // 6. Create Awards
    console.log('\n6️⃣ Creating awards...');
    const awards = [];
    const awardData = [
      { name: 'Gold', icon: '🥇', cost: 500, tier: 3, color: '#FFD700' },
      { name: 'Silver', icon: '🥈', cost: 100, tier: 2, color: '#C0C0C0' },
      { name: 'Bronze', icon: '🥉', cost: 50, tier: 1, color: '#CD7F32' },
      { name: 'Helpful', icon: '👍', cost: 25, tier: 1, color: '#4CAF50' },
      { name: 'Expert', icon: '🎓', cost: 200, tier: 2, color: '#2196F3' }
    ];

    for (const data of awardData) {
      const award = await prisma.award.upsert({
        where: { name: data.name },
        update: {},
        create: {
          name: data.name,
          icon: data.icon,
          cost: data.cost,
          tier: data.tier,
          color: data.color,
          description: `${data.name} award for quality contributions`
        }
      });
      awards.push(award);
    }
    console.log(`✓ Created ${awards.length} awards`);

    // 7. Create Medical Threads
    console.log('\n7️⃣ Creating medical threads...');
    let threadsCreated = 0;
    
    for (let i = 0; i < 3; i++) {
      const patient = patients[i % patients.length];
      
      await prisma.medicalThread.create({
        data: {
          patientId: patient.id,
          title: `Medical Question ${i + 1}`,
          symptoms: {
            primary: ['headache', 'fatigue'],
            duration: '3 days',
            severity: 'moderate'
          },
          severityScore: '5',
          tags: ['general', 'consultation'],
          status: 'OPEN'
        }
      });
      threadsCreated++;
    }
    console.log(`✓ Created ${threadsCreated} medical threads`);

    console.log('\n✅ Core seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • 1 admin user`);
    console.log(`   • ${doctors.length} doctors`);
    console.log(`   • ${patients.length} patients`);
    console.log(`   • ${communities.length} communities`);
    console.log(`   • ${postsCreated} posts`);
    console.log(`   • ${awards.length} awards`);
    console.log(`   • ${threadsCreated} medical threads`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@medthread.com / admin123');
    console.log('   Doctor: dr.smith@medthread.com / doctor123');
    console.log('   Patient: john.doe@example.com / patient123');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCore();
