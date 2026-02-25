"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seoRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const auth_refactored_1 = require("../middleware/auth.refactored");
const seo_service_1 = require("../services/seo.service");
exports.seoRouter = (0, express_1.Router)();
/**
 * GET /api/seo/doctor/:slug
 * Get doctor SEO profile by slug
 */
exports.seoRouter.get('/seo/doctor/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const profile = await database_1.prisma.$queryRaw `
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
        await database_1.prisma.$executeRaw `
      UPDATE "DoctorSEOProfile"
      SET page_views = page_views + 1
      WHERE slug = ${slug}
    `;
        await database_1.prisma.$executeRaw `
      UPDATE "User"
      SET profile_views = profile_views + 1
      WHERE id = ${profile[0].doctor_id}
    `;
        // Track analytics
        await seo_service_1.seoService.trackSEOAnalytics('doctor_profile', profile[0].doctor_id, {
            organicViews: 1
        });
        res.json({
            success: true,
            data: profile[0]
        });
    }
    catch (error) {
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
exports.seoRouter.post('/seo/doctor/:doctorId/profile', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const userId = req.userId;
        // Check if user is the doctor or admin
        if (userId !== doctorId) {
            const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
            if (user?.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
        }
        const result = await seo_service_1.seoService.createDoctorSEOProfile(doctorId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
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
exports.seoRouter.post('/seo/testimonials', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { doctorId, appointmentId, testimonialText, rating, treatmentType, beforeCondition, afterCondition, photoUrl, videoUrl, isAnonymous, displayName } = req.body;
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
            const appointment = await database_1.prisma.appointment.findFirst({
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
        await database_1.prisma.$executeRaw `
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
    }
    catch (error) {
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
exports.seoRouter.get('/seo/testimonials/:doctorId', async (req, res) => {
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
        const testimonials = await database_1.prisma.$queryRawUnsafe(query, doctorId, parseInt(limit), parseInt(offset));
        res.json({
            success: true,
            data: { testimonials }
        });
    }
    catch (error) {
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
exports.seoRouter.post('/seo/doctor-response', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { reviewId, testimonialId, responseText } = req.body;
        if (!reviewId && !testimonialId) {
            return res.status(400).json({
                success: false,
                error: 'Either reviewId or testimonialId is required'
            });
        }
        // Verify doctor owns the review/testimonial
        let doctorId = null;
        if (reviewId) {
            const review = await database_1.prisma.$queryRaw `
        SELECT doctor_id FROM "DoctorReview" WHERE id = ${reviewId}
      `;
            if (review.length > 0)
                doctorId = review[0].doctor_id;
        }
        else if (testimonialId) {
            const testimonial = await database_1.prisma.$queryRaw `
        SELECT doctor_id FROM "PatientTestimonial" WHERE id = ${testimonialId}
      `;
            if (testimonial.length > 0)
                doctorId = testimonial[0].doctor_id;
        }
        if (doctorId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }
        // Create response
        await database_1.prisma.$executeRaw `
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
    }
    catch (error) {
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
exports.seoRouter.post('/seo/content/blog', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userId = req.userId;
        const { city, specialty } = req.body;
        // Check admin
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        const blogPost = await seo_service_1.seoService.generateTopDoctorsBlogPost(city, specialty);
        // Save to database
        await database_1.prisma.$executeRaw `
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
    }
    catch (error) {
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
exports.seoRouter.get('/seo/content/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const content = await database_1.prisma.$queryRaw `
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
        await database_1.prisma.$executeRaw `
      UPDATE "SEOContent"
      SET view_count = view_count + 1
      WHERE slug = ${slug}
    `;
        // Track analytics
        await seo_service_1.seoService.trackSEOAnalytics('blog_post', content[0].id.toString(), {
            organicViews: 1
        });
        res.json({
            success: true,
            data: content[0]
        });
    }
    catch (error) {
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
exports.seoRouter.get('/seo/sitemap', async (req, res) => {
    try {
        // Get all published doctor profiles
        const doctors = await database_1.prisma.$queryRaw `
      SELECT slug, last_updated
      FROM "DoctorSEOProfile"
      WHERE is_published = true
      ORDER BY page_views DESC
    `;
        // Get all published content
        const content = await database_1.prisma.$queryRaw `
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
    }
    catch (error) {
        console.error('[API] Error generating sitemap:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate sitemap'
        });
    }
});
exports.default = exports.seoRouter;
