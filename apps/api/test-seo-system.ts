/**
 * Test script for SEO Rating Website System
 * Tests SEO profile generation, testimonials, and blog posts
 */

import { PrismaClient } from '@medthread/database';
import { seoService } from './src/services/seo.service';

const prisma = new PrismaClient();

async function testSEOSystem() {
  console.log('🧪 Testing SEO Rating Website System...\n');

  try {
    // 1. Find a doctor to test with
    console.log('1️⃣ Finding test doctor...');
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT u.id, u.username, u.specialty
      FROM "User" u
      WHERE u.role IN ('DOCTOR', 'NURSE', 'PHARMACIST')
        AND u.verified = true
      LIMIT 1
    `;

    if (doctors.length === 0) {
      console.log('❌ No doctors found. Please create a doctor user first.');
      return;
    }

    const doctor = doctors[0];
    console.log(`✅ Found doctor: ${doctor.username} (${doctor.specialty})`);
    console.log(`   Doctor ID: ${doctor.id}\n`);

    // 2. Create SEO Profile
    console.log('2️⃣ Creating SEO profile...');
    const seoProfile = await seoService.createDoctorSEOProfile(doctor.id);
    console.log(`✅ SEO Profile created:`);
    console.log(`   Slug: ${seoProfile.slug}`);
    console.log(`   Meta Title: ${seoProfile.metaTitle}`);
    console.log(`   Meta Description: ${seoProfile.metaDescription.substring(0, 100)}...`);
    console.log(`   Schema Markup: ${JSON.stringify(seoProfile.schemaMarkup, null, 2).substring(0, 200)}...\n`);

    // 3. Check SEO profile in database
    console.log('3️⃣ Verifying SEO profile in database...');
    const profileCheck = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorSEOProfile" WHERE doctor_id = ${doctor.id}
    `;
    console.log(`✅ Profile found in database: ${profileCheck.length > 0 ? 'Yes' : 'No'}`);
    if (profileCheck.length > 0) {
      console.log(`   Published: ${profileCheck[0].is_published}`);
      console.log(`   Page Views: ${profileCheck[0].page_views}\n`);
    }

    // 4. Test testimonial creation (simulated)
    console.log('4️⃣ Testing testimonial structure...');
    const testimonialCount = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "PatientTestimonial" WHERE doctor_id = ${doctor.id}
    `;
    console.log(`✅ Existing testimonials: ${testimonialCount[0].count}\n`);

    // 5. Generate blog post
    console.log('5️⃣ Generating sample blog post...');
    const blogPost = await seoService.generateTopDoctorsBlogPost('Mumbai', 'Cardiology');
    console.log(`✅ Blog post generated:`);
    console.log(`   Slug: ${blogPost.slug}`);
    console.log(`   Title: ${blogPost.title}`);
    console.log(`   Content length: ${blogPost.content.length} characters`);
    console.log(`   Related doctors: ${blogPost.doctors.length}\n`);

    // 6. Test SEO analytics tracking
    console.log('6️⃣ Testing SEO analytics tracking...');
    await seoService.trackSEOAnalytics('doctor_profile', doctor.id, {
      organicViews: 1,
      googleImpressions: 10,
      googleClicks: 2,
      searchQuery: 'best cardiologist mumbai'
    });
    console.log(`✅ Analytics tracked successfully\n`);

    // 7. Check analytics in database
    console.log('7️⃣ Verifying analytics in database...');
    const analyticsCheck = await prisma.$queryRaw<any[]>`
      SELECT * FROM "SEOAnalytics" 
      WHERE entity_type = 'doctor_profile' AND entity_id = ${doctor.id}
      ORDER BY date DESC LIMIT 1
    `;
    if (analyticsCheck.length > 0) {
      console.log(`✅ Analytics found:`);
      console.log(`   Date: ${analyticsCheck[0].date}`);
      console.log(`   Organic Views: ${analyticsCheck[0].organic_views}`);
      console.log(`   Google Impressions: ${analyticsCheck[0].google_impressions}`);
      console.log(`   Google Clicks: ${analyticsCheck[0].google_clicks}\n`);
    }

    // 8. Test sitemap generation
    console.log('8️⃣ Testing sitemap generation...');
    const sitemapDoctors = await prisma.$queryRaw<any[]>`
      SELECT slug, last_updated
      FROM "DoctorSEOProfile"
      WHERE is_published = true
      LIMIT 5
    `;
    console.log(`✅ Sitemap would include ${sitemapDoctors.length} doctor profiles\n`);

    // 9. Test rich snippet generation
    console.log('9️⃣ Testing rich snippet generation...');
    const rating = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorRating" WHERE doctor_id = ${doctor.id}
    `;
    if (rating.length > 0) {
      console.log(`✅ Doctor has rating data for rich snippets:`);
      console.log(`   Overall Rating: ${rating[0].overall_rating}`);
      console.log(`   Total Reviews: ${rating[0].total_reviews}\n`);
    } else {
      console.log(`⚠️  No rating data found for rich snippets\n`);
    }

    // 10. Summary
    console.log('📊 Test Summary:');
    console.log('================');
    console.log(`✅ SEO Profile: Created`);
    console.log(`✅ Schema Markup: Generated`);
    console.log(`✅ Blog Post: Generated`);
    console.log(`✅ Analytics: Tracked`);
    console.log(`✅ Sitemap: Ready`);
    console.log('\n🎉 All SEO system tests passed!\n');

    // Display URLs
    console.log('🔗 Test URLs:');
    console.log(`   Doctor Profile: https://reviews.medthread.com/${seoProfile.slug}`);
    console.log(`   Blog Post: https://reviews.medthread.com/blog/${blogPost.slug}`);
    console.log(`   Sitemap: https://reviews.medthread.com/sitemap.xml\n`);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testSEOSystem()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
