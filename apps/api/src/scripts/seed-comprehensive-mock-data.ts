import { prisma } from '@medthread/database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Import data modules
import { doctorData } from './seed-data/doctors';
import { patientData } from './seed-data/patients';
import { communityData } from './seed-data/communities';
import { generatePosts } from './seed-data/posts';
import { generateConversations } from './seed-data/conversations';

async function seedComprehensiveMockData() {
  console.log('\n🌱 Starting comprehensive mock data seeding...\n');

  try {
    // PART 1: Create Doctors (15 verified doctors)
    console.log('📋 PART 1: Creating 15 verified doctors...');
    const doctors = await seedDoctors();
    console.log(`✅ Created ${doctors.length} doctors\n`);

    // PART 2: Create Patients (30 patients)
    console.log('📋 PART 2: Creating 30 patients...');
    const patients = await seedPatients();
    console.log(`✅ Created ${patients.length} patients\n`);

    // PART 3: Create Communities (8 communities)
    console.log('📋 PART 3: Creating 8 communities...');
    const communities = await seedCommunities(doctors, patients);
    console.log(`✅ Created ${communities.length} communities\n`);

    // PART 4: Create Posts (120+ posts with comments)
    console.log('📋 PART 4: Creating 120+ posts with comments...');
    const posts = await seedPosts(communities, doctors, patients);
    console.log(`✅ Created ${posts.length} posts\n`);

    // PART 5: Create Chat Conversations (20 conversations)
    console.log('📋 PART 5: Creating 20 doctor-patient conversations...');
    const conversations = await seedConversations(doctors, patients);
    console.log(`✅ Created ${conversations.length} conversations\n`);

    console.log('🎉 Comprehensive mock data seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - ${doctors.length} verified doctors`);
    console.log(`   - ${patients.length} patients`);
    console.log(`   - ${communities.length} communities`);
    console.log(`   - ${posts.length} posts with comments`);
    console.log(`   - ${conversations.length} chat conversations\n`);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
