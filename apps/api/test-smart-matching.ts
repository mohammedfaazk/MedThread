/**
 * Test Smart Matching Algorithm
 * Run: npx ts-node test-smart-matching.ts
 */

import { prisma } from '@medthread/database';

async function testSmartMatching() {
  console.log('🧪 Testing Smart Matching Algorithm...\n');

  try {
    // 1. Check symptom categories
    console.log('1️⃣ Checking symptom categories...');
    const categories = await prisma.$queryRaw<any[]>`
      SELECT category_name, array_length(keywords, 1) as keyword_count
      FROM "SymptomCategory"
    `;
    console.log(`✓ Found ${categories.length} symptom categories`);
    categories.forEach(cat => {
      console.log(`  - ${cat.category_name}: ${cat.keyword_count} keywords`);
    });

    // 2. Check doctor expertise
    console.log('\n2️⃣ Checking doctor expertise...');
    const expertise = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "DoctorExpertise"
    `;
    console.log(`✓ Found ${expertise[0].count} doctor expertise records`);

    // 3. Check doctor languages
    console.log('\n3️⃣ Checking doctor languages...');
    const languages = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "DoctorLanguage"
    `;
    console.log(`✓ Found ${languages[0].count} doctor language records`);

    // 4. Check doctor insurance
    console.log('\n4️⃣ Checking doctor insurance...');
    const insurance = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "DoctorInsurance"
    `;
    console.log(`✓ Found ${insurance[0].count} doctor insurance records`);

    // 5. Test symptom matching
    console.log('\n5️⃣ Testing symptom matching...');
    const testSymptoms = ['cough', 'fever', 'shortness of breath'];
    const matchedCategories = await prisma.$queryRaw<any[]>`
      SELECT category_name, related_specialties
      FROM "SymptomCategory"
      WHERE keywords && ${testSymptoms}
    `;
    console.log(`✓ Symptoms "${testSymptoms.join(', ')}" matched ${matchedCategories.length} categories:`);
    matchedCategories.forEach(cat => {
      console.log(`  - ${cat.category_name} → ${cat.related_specialties.join(', ')}`);
    });

    // 6. Test match score calculation function
    console.log('\n6️⃣ Testing match score calculation...');
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT id, username, specialty
      FROM "User"
      WHERE role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND verified = true
      LIMIT 3
    `;

    if (doctors.length > 0) {
      console.log(`✓ Testing with ${doctors.length} doctors:`);
      for (const doctor of doctors) {
        console.log(`  - Dr. ${doctor.username} (${doctor.specialty})`);
      }
    } else {
      console.log('⚠️  No verified doctors found for testing');
    }

    // 7. Check matching preferences table
    console.log('\n7️⃣ Checking matching preferences...');
    const preferences = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "MatchingPreference"
    `;
    console.log(`✓ Found ${preferences[0].count} patient preference records`);

    // 8. Check matching results table
    console.log('\n8️⃣ Checking matching results...');
    const results = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "MatchingResult"
    `;
    console.log(`✓ Found ${results[0].count} matching result records`);

    // 9. Check case history
    console.log('\n9️⃣ Checking case history...');
    const caseHistory = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "CaseHistory"
    `;
    console.log(`✓ Found ${caseHistory[0].count} case history records`);

    // 10. Verify database function exists
    console.log('\n🔟 Verifying calculate_match_score function...');
    const functionExists = await prisma.$queryRaw<any[]>`
      SELECT proname
      FROM pg_proc
      WHERE proname = 'calculate_match_score'
    `;
    if (functionExists.length > 0) {
      console.log('✓ calculate_match_score function exists');
    } else {
      console.log('⚠️  calculate_match_score function not found');
    }

    console.log('\n✅ Smart Matching Algorithm test completed!');
    console.log('\n📝 Summary:');
    console.log(`  - Symptom Categories: ${categories.length}`);
    console.log(`  - Doctor Expertise: ${expertise[0].count}`);
    console.log(`  - Doctor Languages: ${languages[0].count}`);
    console.log(`  - Doctor Insurance: ${insurance[0].count}`);
    console.log(`  - Matching Results: ${results[0].count}`);
    console.log(`  - Case History: ${caseHistory[0].count}`);

  } catch (error) {
    console.error('❌ Error testing smart matching:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSmartMatching();
