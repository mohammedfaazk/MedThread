#!/usr/bin/env node

/**
 * Test script to demonstrate the new portfolio score algorithm (0-100 scale)
 */

// Portfolio Score Algorithm Implementation
function calculatePortfolioScore(performance) {
  const {
    curedPatientCount = 0,
    notYetCount = 0,
    consultNewDoctorCount = 0,
    conversionCount = 0,
    clinicVisitCount = 0,
    totalCommentsCount = 0,
    totalPostsCommented = 0,
    totalResponses = 0,
    appointmentsCompleted = 0,
    helpfulnessScore = 0
  } = performance;

  // Calculate totals for normalization
  const totalPatients = curedPatientCount + notYetCount + consultNewDoctorCount;
  const totalEngagements = conversionCount + clinicVisitCount + totalCommentsCount;
  const totalActivity = totalPostsCommented + totalResponses + appointmentsCompleted;

  // 1. Patient Outcomes (40% weight)
  const patientOutcomeRaw = totalPatients > 0 ? (
    (curedPatientCount * 10) +           // +10 per cured patient
    (notYetCount * 2) +                  // +2 per ongoing case
    (consultNewDoctorCount * -8)         // -8 per lost patient
  ) / totalPatients : 0;
  const patientOutcomeScore = Math.min(Math.max(patientOutcomeRaw, 0) * 4, 40); // Scale to 40 max

  // 2. Engagement Quality (25% weight)  
  const engagementRaw = totalEngagements > 0 ? (
    (conversionCount * 3) +              // +3 per conversion
    (clinicVisitCount * 5) +             // +5 per clinic visit
    (totalCommentsCount * 0.5)           // +0.5 per comment
  ) / totalEngagements : 0;
  const engagementScore = Math.min(engagementRaw * 2.5, 25); // Scale to 25 max

  // 3. Professional Activity (20% weight)
  const activityRaw = totalActivity > 0 ? (
    (totalPostsCommented * 1) +          // +1 per post engagement
    (totalResponses * 0.8) +             // +0.8 per response  
    (appointmentsCompleted * 2)          // +2 per completed appointment
  ) / totalActivity : 0;
  const activityScore = Math.min(activityRaw * 2, 20); // Scale to 20 max

  // 4. Patient Satisfaction (15% weight)
  const helpfulnessNormalized = (helpfulnessScore || 0) / 5 * 10; // 0-5 → 0-10
  const cureRate = totalPatients > 0 ? (curedPatientCount / totalPatients) * 5 : 0; // 0-5
  const satisfactionScore = Math.min((helpfulnessNormalized + cureRate) * 0.75, 15); // Scale to 15 max

  // 5. Consistency Multiplier (experience bonus)
  const consistencyMultiplier = Math.min(
    1 + (Math.log(totalPatients + 1) / 10), // Logarithmic bonus for experience
    1.2  // Max 20% bonus
  );

  // 6. Final Score Calculation
  const rawScore = (
    patientOutcomeScore +
    engagementScore + 
    activityScore +
    satisfactionScore
  ) * consistencyMultiplier;

  const finalScore = Math.min(Math.max(Math.round(rawScore), 0), 100);

  return {
    finalScore,
    breakdown: {
      patientOutcomeScore: Math.round(patientOutcomeScore),
      engagementScore: Math.round(engagementScore),
      activityScore: Math.round(activityScore),
      satisfactionScore: Math.round(satisfactionScore),
      consistencyMultiplier: Math.round(consistencyMultiplier * 100) / 100
    }
  };
}

console.log('🧮 Portfolio Score Algorithm Test (0-100 Scale)\n');

// Test Case 1: Excellent Doctor
console.log('👨‍⚕️ Test Case 1: Excellent Doctor');
const excellentDoctor = {
  curedPatientCount: 50,
  notYetCount: 10,
  consultNewDoctorCount: 2,
  conversionCount: 30,
  clinicVisitCount: 25,
  totalCommentsCount: 100,
  totalPostsCommented: 80,
  totalResponses: 60,
  appointmentsCompleted: 40,
  helpfulnessScore: 4.8
};

const result1 = calculatePortfolioScore(excellentDoctor);
console.log('📊 Performance Data:', excellentDoctor);
console.log('🎯 Portfolio Score:', result1.finalScore, '/100');
console.log('📋 Breakdown:', result1.breakdown);

// Test Case 2: Average Doctor
console.log('\n👨‍⚕️ Test Case 2: Average Doctor');
const averageDoctor = {
  curedPatientCount: 15,
  notYetCount: 8,
  consultNewDoctorCount: 3,
  conversionCount: 10,
  clinicVisitCount: 8,
  totalCommentsCount: 30,
  totalPostsCommented: 25,
  totalResponses: 20,
  appointmentsCompleted: 12,
  helpfulnessScore: 3.2
};

const result2 = calculatePortfolioScore(averageDoctor);
console.log('📊 Performance Data:', averageDoctor);
console.log('🎯 Portfolio Score:', result2.finalScore, '/100');
console.log('📋 Breakdown:', result2.breakdown);

// Test Case 3: New Doctor
console.log('\n👨‍⚕️ Test Case 3: New Doctor');
const newDoctor = {
  curedPatientCount: 3,
  notYetCount: 2,
  consultNewDoctorCount: 0,
  conversionCount: 2,
  clinicVisitCount: 1,
  totalCommentsCount: 8,
  totalPostsCommented: 5,
  totalResponses: 4,
  appointmentsCompleted: 2,
  helpfulnessScore: 4.0
};

const result3 = calculatePortfolioScore(newDoctor);
console.log('📊 Performance Data:', newDoctor);
console.log('🎯 Portfolio Score:', result3.finalScore, '/100');
console.log('📋 Breakdown:', result3.breakdown);

// Test Case 4: Problematic Doctor
console.log('\n👨‍⚕️ Test Case 4: Problematic Doctor');
const problematicDoctor = {
  curedPatientCount: 5,
  notYetCount: 3,
  consultNewDoctorCount: 8, // Many patients left
  conversionCount: 15,
  clinicVisitCount: 10,
  totalCommentsCount: 40,
  totalPostsCommented: 30,
  totalResponses: 25,
  appointmentsCompleted: 8,
  helpfulnessScore: 2.1
};

const result4 = calculatePortfolioScore(problematicDoctor);
console.log('📊 Performance Data:', problematicDoctor);
console.log('🎯 Portfolio Score:', result4.finalScore, '/100');
console.log('📋 Breakdown:', result4.breakdown);

console.log('\n🎯 Algorithm Summary:');
console.log('• Patient Outcomes (40%): Rewards cures, penalizes losses');
console.log('• Engagement Quality (25%): Profile visits, appointments, comments');
console.log('• Professional Activity (20%): Posts, responses, completed appointments');
console.log('• Patient Satisfaction (15%): Helpfulness rating + cure rate');
console.log('• Consistency Multiplier: Experience bonus (up to 20%)');

console.log('\n📈 Ranking Changes:');
console.log('• OLD: Ranked by cured patient count only');
console.log('• NEW: Ranked by comprehensive portfolio score (0-100)');
console.log('• RESULT: More balanced evaluation of doctor performance');

console.log('\n✅ Top doctors will now be ranked by portfolio score!');