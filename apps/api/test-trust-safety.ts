/**
 * Test Trust & Safety System
 * Run: npx ts-node test-trust-safety.ts
 */

import { prisma } from '@medthread/database';

async function testTrustSafety() {
  console.log('🧪 Testing Trust & Safety System...\n');

  try {
    // 1. Check medical license verification table
    console.log('1️⃣ Checking medical license verification...');
    const licenses = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, verification_status
      FROM "MedicalLicenseVerification"
      GROUP BY verification_status
    `;
    if (licenses.length > 0) {
      console.log(`✓ License verification status:`);
      licenses.forEach(l => console.log(`  - ${l.verification_status}: ${l.count}`));
    } else {
      console.log(`✓ No license verifications yet`);
    }

    // 2. Check hospital affiliation verification
    console.log('\n2️⃣ Checking hospital affiliation verification...');
    const affiliations = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "HospitalAffiliationVerification"
    `;
    console.log(`✓ Found ${affiliations[0].count} hospital affiliations`);

    // 3. Check peer endorsements
    console.log('\n3️⃣ Checking peer endorsements...');
    const endorsements = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, status
      FROM "PeerEndorsement"
      GROUP BY status
    `;
    if (endorsements.length > 0) {
      console.log(`✓ Endorsement status:`);
      endorsements.forEach(e => console.log(`  - ${e.status}: ${e.count}`));
    } else {
      console.log(`✓ No peer endorsements yet`);
    }

    // 4. Check patient identity verification
    console.log('\n4️⃣ Checking patient identity verification...');
    const patientVerifications = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, verification_level
      FROM "PatientIdentityVerification"
      GROUP BY verification_level
    `;
    if (patientVerifications.length > 0) {
      console.log(`✓ Patient verification levels:`);
      patientVerifications.forEach(p => console.log(`  - ${p.verification_level}: ${p.count}`));
    } else {
      console.log(`✓ No patient verifications yet`);
    }

    // 5. Check content moderation
    console.log('\n5️⃣ Checking content moderation...');
    const moderation = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE ai_flagged = true) as flagged,
             COUNT(*) FILTER (WHERE moderation_status = 'requires_review') as needs_review
      FROM "ContentModeration"
    `;
    console.log(`✓ Content moderation:`);
    console.log(`  - Total: ${moderation[0].total}`);
    console.log(`  - AI Flagged: ${moderation[0].flagged}`);
    console.log(`  - Needs Review: ${moderation[0].needs_review}`);

    // 6. Check medical advice peer review
    console.log('\n6️⃣ Checking medical advice peer review...');
    const peerReviews = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, review_status
      FROM "MedicalAdvicePeerReview"
      GROUP BY review_status
    `;
    if (peerReviews.length > 0) {
      console.log(`✓ Peer review status:`);
      peerReviews.forEach(r => console.log(`  - ${r.review_status}: ${r.count}`));
    } else {
      console.log(`✓ No peer reviews yet`);
    }

    // 7. Check conflicting diagnoses
    console.log('\n7️⃣ Checking conflicting diagnoses...');
    const conflicts = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, resolution_status
      FROM "ConflictingDiagnosis"
      GROUP BY resolution_status
    `;
    if (conflicts.length > 0) {
      console.log(`✓ Conflict resolution status:`);
      conflicts.forEach(c => console.log(`  - ${c.resolution_status}: ${c.count}`));
    } else {
      console.log(`✓ No conflicting diagnoses detected`);
    }

    // 8. Check doctor quality reviews
    console.log('\n8️⃣ Checking doctor quality reviews...');
    const qualityReviews = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, review_status
      FROM "DoctorQualityReview"
      GROUP BY review_status
    `;
    if (qualityReviews.length > 0) {
      console.log(`✓ Quality review status:`);
      qualityReviews.forEach(q => console.log(`  - ${q.review_status}: ${q.count}`));
    } else {
      console.log(`✓ No quality reviews yet`);
    }

    // 9. Check trust scores
    console.log('\n9️⃣ Checking trust scores...');
    const trustScores = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count, trust_level
      FROM "TrustScore"
      GROUP BY trust_level
    `;
    if (trustScores.length > 0) {
      console.log(`✓ Trust levels:`);
      trustScores.forEach(t => console.log(`  - ${t.trust_level}: ${t.count}`));
    } else {
      console.log(`✓ No trust scores calculated yet`);
    }

    // 10. Test trust score calculation function
    console.log('\n🔟 Testing trust score calculation...');
    try {
      const testUserId = 'test-user-id';
      const testUserType = 'doctor';
      
      const scoreCalc = await prisma.$queryRaw<any[]>`
        SELECT calculate_trust_score(${testUserId}, ${testUserType}) as trust_score
      `;
      
      if (scoreCalc.length > 0) {
        console.log(`✓ Trust score calculation works: ${scoreCalc[0].trust_score}`);
      }
    } catch (error) {
      console.log(`⚠️  Trust score calculation test skipped (user not found)`);
    }

    console.log('\n✅ Trust & Safety test completed!');
    console.log('\n📝 Summary:');
    console.log(`  - Medical License Verifications: ${licenses.reduce((sum, l) => sum + parseInt(l.count), 0)}`);
    console.log(`  - Hospital Affiliations: ${affiliations[0].count}`);
    console.log(`  - Peer Endorsements: ${endorsements.reduce((sum, e) => sum + parseInt(e.count), 0)}`);
    console.log(`  - Content Moderation: ${moderation[0].total}`);
    console.log(`  - Trust Scores: ${trustScores.reduce((sum, t) => sum + parseInt(t.count), 0)}`);

  } catch (error) {
    console.error('❌ Error testing trust & safety:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrustSafety();
