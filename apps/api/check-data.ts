import { prisma } from '@medthread/database';

async function checkData() {
  console.log('📊 Checking database data...\n');

  try {
    const doctors = await prisma.user.count({ where: { role: 'DOCTOR' } });
    const patients = await prisma.user.count({ where: { role: 'PATIENT' } });
    
    const clinics = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorClinic"`;
    const ratings = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorRating"`;
    const badges = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorBadge"`;
    const expertise = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorExpertise"`;
    const licenses = await prisma.$queryRaw`SELECT COUNT(*) FROM "MedicalLicenseVerification"`;
    const reviews = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorReview"`;
    const seoProfiles = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorSEOProfile"`;
    const availability = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorAvailability"`;
    const points = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorPoints"`;
    const languages = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorLanguage"`;
    const insurance = await prisma.$queryRaw`SELECT COUNT(*) FROM "DoctorInsurance"`;
    const hospitals = await prisma.$queryRaw`SELECT COUNT(*) FROM "HospitalAffiliationVerification"`;
    const trustScores = await prisma.$queryRaw`SELECT COUNT(*) FROM "TrustScore"`;

    console.log('Users:');
    console.log(`  Doctors: ${doctors}`);
    console.log(`  Patients: ${patients}`);
    console.log('\nFeature 2 - Area-Wise Doctor Replies:');
    console.log(`  Clinics: ${(clinics as any)[0].count}`);
    console.log(`  Availability: ${(availability as any)[0].count}`);
    console.log('\nFeature 3 - Regional Top Doctors:');
    console.log(`  Ratings: ${(ratings as any)[0].count}`);
    console.log(`  Reviews: ${(reviews as any)[0].count}`);
    console.log('\nFeature 4 - SEO Rating Website:');
    console.log(`  SEO Profiles: ${(seoProfiles as any)[0].count}`);
    console.log('\nFeature 7 - Gamification:');
    console.log(`  Badges: ${(badges as any)[0].count}`);
    console.log(`  Points: ${(points as any)[0].count}`);
    console.log('\nFeature 8 - Smart Matching:');
    console.log(`  Expertise: ${(expertise as any)[0].count}`);
    console.log(`  Languages: ${(languages as any)[0].count}`);
    console.log(`  Insurance: ${(insurance as any)[0].count}`);
    console.log('\nFeature 10 - Trust & Safety:');
    console.log(`  Licenses: ${(licenses as any)[0].count}`);
    console.log(`  Hospitals: ${(hospitals as any)[0].count}`);
    console.log(`  Trust Scores: ${(trustScores as any)[0].count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
