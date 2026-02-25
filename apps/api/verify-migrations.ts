import { prisma } from '@medthread/database';

async function verifyMigrations() {
  console.log('Checking if feature tables exist...\n');
  
  const tables = [
    'DoctorClinic',
    'DoctorAvailability', 
    'DoctorRating',
    'DoctorReview',
    'DoctorSEOProfile',
    'DoctorBusinessAnalytics',
    'PatientJourney',
    'Badge',
    'DoctorBadge',
    'DoctorExpertise',
    'SubscriptionPlan',
    'MedicalLicenseVerification',
    'TrustScore'
  ];
  
  for (const table of tables) {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        )
      `;
      const exists = result[0].exists;
      console.log(`${exists ? '✓' : '✗'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    } catch (error) {
      console.log(`✗ ${table}: ERROR`);
    }
  }
  
  await prisma.$disconnect();
}

verifyMigrations();
