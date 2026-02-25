import { prisma } from '@medthread/database';

async function auditAllFeatures() {
  console.log('🔍 COMPREHENSIVE FEATURE AUDIT\n');
  console.log('='.repeat(60));
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 1. Check all feature tables exist
    console.log('\n1. CHECKING FEATURE TABLES...\n');
    
    const featureTables = [
      // Area-wise doctor replies
      'DoctorLocation', 'DoctorAvailability', 'ClinicLocation',
      // Regional top doctors
      'DoctorRating', 'DoctorReview', 'DoctorRanking',
      // SEO rating website
      'SEOProfile', 'SEOBlogPost', 'SEOKeyword',
      // Doctor business dashboard
      'BusinessMetrics', 'RevenueMetrics', 'PatientMetrics',
      // Patient journey
      'PatientJourney', 'JourneyStep', 'JourneyAnalytics',
      // Doctor gamification
      'Badge', 'DoctorBadge', 'Achievement', 'DoctorAchievement', 'Leaderboard', 'LeaderboardEntry', 'DoctorPoints', 'PointsTransaction',
      // Smart matching
      'DoctorPreferences', 'PatientPreferences', 'MatchingScore',
      // Revenue streams
      'Subscription', 'SubscriptionPlan', 'PlatformRevenue',
      // Trust & safety
      'TrustScore', 'SafetyFlag', 'ContentModeration',
      // Cron jobs
      'CronJobExecution', 'CronJobSchedule'
    ];
    
    for (const table of featureTables) {
      const result = await prisma.$queryRaw<any[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = ${table}
      `;
      
      if (result.length === 0) {
        issues.push(`❌ Table missing: ${table}`);
        console.log(`❌ ${table} - MISSING`);
      } else {
        console.log(`✅ ${table}`);
      }
    }
    
    // 2. Check database functions
    console.log('\n2. CHECKING DATABASE FUNCTIONS...\n');
    
    const functions = [
      'check_and_award_badges',
      'update_leaderboards',
      'calculate_trust_score',
      'update_doctor_ranking'
    ];
    
    for (const func of functions) {
      const result = await prisma.$queryRaw<any[]>`
        SELECT proname 
        FROM pg_proc 
        WHERE proname = ${func}
      `;
      
      if (result.length === 0) {
        issues.push(`❌ Function missing: ${func}`);
        console.log(`❌ ${func} - MISSING`);
      } else {
        console.log(`✅ ${func}`);
      }
    }
    
    // 3. Check seed data
    console.log('\n3. CHECKING SEED DATA...\n');
    
    const userCount = await prisma.user.count();
    const communityCount = await prisma.community.count();
    const postCount = await prisma.post.count();
    const awardCount = await prisma.award.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Communities: ${communityCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Awards: ${awardCount}`);
    
    if (userCount === 0) issues.push('❌ No users in database');
    if (communityCount === 0) warnings.push('⚠️  No communities seeded');
    if (postCount === 0) warnings.push('⚠️  No posts seeded');
    
    // 4. Check user passwords
    console.log('\n4. CHECKING USER PASSWORDS...\n');
    
    const usersWithoutPassword = await prisma.user.findMany({
      where: { passwordHash: null },
      select: { email: true, role: true }
    });
    
    if (usersWithoutPassword.length > 0) {
      issues.push(`❌ ${usersWithoutPassword.length} users without passwords`);
      usersWithoutPassword.forEach(u => {
        console.log(`❌ ${u.email} (${u.role}) - NO PASSWORD`);
      });
    } else {
      console.log('✅ All users have passwords');
    }
    
    // 5. Check email configuration
    console.log('\n5. CHECKING EMAIL CONFIGURATION...\n');
    
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    if (!emailConfigured) {
      warnings.push('⚠️  Email not configured (EMAIL_USER/EMAIL_PASSWORD missing)');
      console.log('⚠️  Email system not configured');
    } else {
      console.log('✅ Email configured');
    }
    
    // 6. Check Cloudinary configuration
    console.log('\n6. CHECKING CLOUDINARY CONFIGURATION...\n');
    
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_API_KEY && 
                                  process.env.CLOUDINARY_API_SECRET;
    if (!cloudinaryConfigured) {
      issues.push('❌ Cloudinary not configured');
      console.log('❌ Cloudinary not configured');
    } else {
      console.log('✅ Cloudinary configured');
    }
    
    // 7. Check Stripe configuration
    console.log('\n7. CHECKING STRIPE CONFIGURATION...\n');
    
    const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
                             process.env.STRIPE_SECRET_KEY !== 'sk_test_your_key_here';
    if (!stripeConfigured) {
      warnings.push('⚠️  Stripe not configured (using placeholder keys)');
      console.log('⚠️  Stripe not configured');
    } else {
      console.log('✅ Stripe configured');
    }
    
    // 8. Check for orphaned data
    console.log('\n8. CHECKING DATA INTEGRITY...\n');
    
    // Check posts without authors
    const orphanedPosts = await prisma.post.count({
      where: { authorId: null }
    });
    if (orphanedPosts > 0) {
      warnings.push(`⚠️  ${orphanedPosts} posts without authors`);
      console.log(`⚠️  ${orphanedPosts} posts without authors`);
    } else {
      console.log('✅ All posts have authors');
    }
    
    // Check comments without authors
    const orphanedComments = await prisma.comment.count({
      where: { authorId: null }
    });
    if (orphanedComments > 0) {
      warnings.push(`⚠️  ${orphanedComments} comments without authors`);
      console.log(`⚠️  ${orphanedComments} comments without authors`);
    } else {
      console.log('✅ All comments have authors');
    }
    
    // 9. Check appointments
    console.log('\n9. CHECKING APPOINTMENTS...\n');
    
    const appointmentCount = await prisma.appointment.count();
    console.log(`Total appointments: ${appointmentCount}`);
    
    if (appointmentCount === 0) {
      warnings.push('⚠️  No appointments in database');
    }
    
    // 10. Check notifications
    console.log('\n10. CHECKING NOTIFICATIONS...\n');
    
    const notificationCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM notifications
    `.catch(() => [{ count: 0 }]);
    
    console.log(`Total notifications: ${notificationCount[0]?.count || 0}`);
    
  } catch (error: any) {
    issues.push(`❌ Audit error: ${error.message}`);
    console.error('Error during audit:', error.message);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ NO ISSUES FOUND - All features working properly!');
  } else {
    if (issues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES (Must Fix):');
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Optional):');
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  await prisma.$disconnect();
}

auditAllFeatures();
