import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth.refactored';
import { seoService } from '../services/seo.service';

export const seoRouter = Router();

/**
 * GET /api/seo/doctor/:slug
 * Get doctor SEO profile by slug
 */
seoRouter.get('/seo/doctor/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const profile = await prisma.$queryRaw<any[]>`
      SELECT 
        dsp.*,
        u.id as doctor_id,
        u.username,
        u.avatar,
        u.specialty,
        u.bio,
        u."yearsOfExperience",
        u.verified,
        dr.overall_rating,
        dr.total_reviews,
        dr.response_time_minutes,
        dr.consultation_success_rate
      FROM "DoctorSEOProfile" dsp
      INNER JOIN "User" u ON dsp.doctor_id = u.id
      LEFT JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      WHERE dsp.slug = ${slug} AND dsp.is_published = true
    `;

    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found'
      });
    }

    // Increment page views
    await prisma.$executeRaw`
      UPDATE "DoctorSEOProfile"
      SET page_views = page_views + 1
      WHERE slug = ${slug}
    `;

    await prisma.$executeRaw`
      UPDATE "User"
      SET profile_views = profile_views + 1
      WHERE id = ${profile[0].doctor_id}
    `;

    // Track analytics
    await seoService.trackSEOAnalytics('doctor_profile', profile[0].doctor_id, {
      organicViews: 1
    });

    res.json({
      success: true,
      data: profile[0]
    });
  } catch (error) {
    console.error('[API] Error fetching SEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor profile'
    });
  }
});

/**
 * POST /api/seo/doctor/:doctorId/profile
 * Create or update doctor SEO profile
 */
seoRouter.post('/seo/doctor/:doctorId/profile', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = (req as any).userId;

    // Check if user is the doctor or admin
    if (userId !== doctorId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized'
        });
      }
    }

    const result = await seoService.createDoctorSEOProfile(doctorId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[API] Error creating SEO profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create SEO profile'
    });
  }
});

/**
 * POST /api/seo/testimonials
 * Submit patient testimonial
 */
seoRouter.post('/seo/testimonials', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      doctorId,
      appointmentId,
      testimonialText,
      rating,
      treatmentType,
      beforeCondition,
      afterCondition,
      photoUrl,
      videoUrl,
      isAnonymous,
      displayName
    } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if appointment exists and is completed
    let isVerified = false;
    let consentGiven = false;

    if (appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId: userId,
          doctorId,
          status: 'COMPLETED'
        }
      });
      isVerified = !!appointment;
      consentGiven = true; // Assume consent if providing appointment
    }

    // Create testimonial
    await prisma.$executeRaw`
      INSERT INTO "PatientTestimonial" (
        doctor_id, patient_id, appointment_id, testimonial_text, rating,
        treatment_type, before_condition, after_condition, photo_url, video_url,
        is_verified, consent_given, display_name, is_anonymous
      ) VALUES (
        ${doctorId}, ${userId}, ${appointmentId || null}, ${testimonialText}, ${rating},
        ${treatmentType || null}, ${beforeCondition || null}, ${afterCondition || null},
        ${photoUrl || null}, ${videoUrl || null}, ${isVerified}, ${consentGiven},
        ${displayName || null}, ${isAnonymous === true}
      )
    `;

    res.status(201).json({
      success: true,
      message: 'Testimonial submitted successfully'
    });
  } catch (error) {
    console.error('[API] Error submitting testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit testimonial'
    });
  }
});

/**
 * GET /api/seo/testimonials/:doctorId
 * Get testimonials for a doctor
 */
seoRouter.get('/seo/testimonials/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { limit = '10', offset = '0', featured = 'false' } = req.query;

    let query = `
      SELECT 
        pt.*,
        CASE 
          WHEN pt.is_anonymous THEN 'Anonymous'
          ELSE COALESCE(pt.display_name, u.username)
        END as patient_name,
        CASE 
          WHEN pt.is_anonymous THEN NULL
          ELSE u.avatar
        END as patient_avatar
      FROM "PatientTestimonial" pt
      LEFT JOIN "User" u ON pt.patient_id = u.id
      WHERE pt.doctor_id = $1
    `;

    if (featured === 'true') {
      query += ` AND pt.is_featured = true`;
    }

    query += ` ORDER BY pt.is_featured DESC, pt.created_at DESC LIMIT $2 OFFSET $3`;

    const testimonials = await prisma.$queryRawUnsafe(
      query,
      doctorId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: { testimonials }
    });
  } catch (error) {
    console.error('[API] Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch testimonials'
    });
  }
});

/**
 * POST /api/seo/doctor-response
 * Doctor responds to review or testimonial
 */
seoRouter.post('/seo/doctor-response', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { reviewId, testimonialId, responseText } = req.body;

    if (!reviewId && !testimonialId) {
      return res.status(400).json({
        success: false,
        error: 'Either reviewId or testimonialId is required'
      });
    }

    // Verify doctor owns the review/testimonial
    let doctorId: string | null = null;

    if (reviewId) {
      const review = await prisma.$queryRaw<any[]>`
        SELECT doctor_id FROM "DoctorReview" WHERE id = ${reviewId}
      `;
      if (review.length > 0) doctorId = review[0].doctor_id;
    } else if (testimonialId) {
      const testimonial = await prisma.$queryRaw<any[]>`
        SELECT doctor_id FROM "PatientTestimonial" WHERE id = ${testimonialId}
      `;
      if (testimonial.length > 0) doctorId = testimonial[0].doctor_id;
    }

    if (doctorId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Create response
    await prisma.$executeRaw`
      INSERT INTO "DoctorResponse" (
        review_id, testimonial_id, doctor_id, response_text
      ) VALUES (
        ${reviewId || null}, ${testimonialId || null}, ${userId}, ${responseText}
      )
    `;

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully'
    });
  } catch (error) {
    console.error('[API] Error submitting response:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit response'
    });
  }
});

/**
 * POST /api/seo/content/blog
 * Generate blog post (admin only)
 */
seoRouter.post('/seo/content/blog', authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { city, specialty } = req.body;

    // Check admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const blogPost = await seoService.generateTopDoctorsBlogPost(city, specialty);

    // Save to database
    await prisma.$executeRaw`
      INSERT INTO "SEOContent" (
        content_type, slug, title, content, excerpt, author_id,
        meta_title, meta_description, related_doctors, is_published
      ) VALUES (
        'top_list', ${blogPost.slug}, ${blogPost.title}, ${blogPost.content},
        ${blogPost.metaDescription}, ${userId}, ${blogPost.title},
        ${blogPost.metaDescription}, ARRAY[${blogPost.doctors.join(',')}]::TEXT[],
        true
      )
      ON CONFLICT (slug) DO UPDATE
      SET content = ${blogPost.content},
          updated_at = CURRENT_TIMESTAMP
    `;

    res.json({
      success: true,
      data: blogPost
    });
  } catch (error) {
    console.error('[API] Error generating blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate blog post'
    });
  }
});

/**
 * GET /api/seo/content/:slug
 * Get SEO content by slug
 */
seoRouter.get('/seo/content/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const content = await prisma.$queryRaw<any[]>`
      SELECT 
        sc.*,
        u.username as author_name
      FROM "SEOContent" sc
      LEFT JOIN "User" u ON sc.author_id = u.id
      WHERE sc.slug = ${slug} AND sc.is_published = true
    `;

    if (content.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    // Increment view count
    await prisma.$executeRaw`
      UPDATE "SEOContent"
      SET view_count = view_count + 1
      WHERE slug = ${slug}
    `;

    // Track analytics
    await seoService.trackSEOAnalytics('blog_post', content[0].id.toString(), {
      organicViews: 1
    });

    res.json({
      success: true,
      data: content[0]
    });
  } catch (error) {
    console.error('[API] Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content'
    });
  }
});

/**
 * GET /api/seo/sitemap
 * Generate sitemap for SEO subdomain
 */
seoRouter.get('/seo/sitemap', async (req, res) => {
  try {
    // Get all published doctor profiles
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT slug, last_updated
      FROM "DoctorSEOProfile"
      WHERE is_published = true
      ORDER BY page_views DESC
    `;

    // Get all published content
    const content = await prisma.$queryRaw<any[]>`
      SELECT slug, updated_at
      FROM "SEOContent"
      WHERE is_published = true
      ORDER BY view_count DESC
    `;

    const sitemap = {
      doctors: doctors.map(d => ({
        url: `https://reviews.medthread.com/${d.slug}`,
        lastmod: d.last_updated
      })),
      content: content.map(c => ({
        url: `https://reviews.medthread.com/blog/${c.slug}`,
        lastmod: c.updated_at
      }))
    };

    res.json({
      success: true,
      data: sitemap
    });
  } catch (error) {
    console.error('[API] Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sitemap'
    });
  }
});

export default seoRouter;
