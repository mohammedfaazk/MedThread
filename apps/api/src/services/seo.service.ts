/**
 * SEO Service
 * Handles SEO profile generation, slug creation, and schema markup
 */

import { prisma } from '@medthread/database';

export class SEOService {
  /**
   * Generate SEO-friendly slug from doctor info
   */
  generateDoctorSlug(username: string, specialty: string | null, city: string | null): string {
    const parts = [
      'dr',
      username.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      specialty?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      city?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ].filter(Boolean);
    
    return parts.join('-');
  }

  /**
   * Generate Schema.org LocalBusiness markup for doctor
   */
  generateDoctorSchema(doctor: any, clinic: any, rating: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      name: `Dr. ${doctor.username}`,
      description: doctor.bio || `${doctor.specialty} specialist`,
      image: doctor.avatar,
      '@id': `https://reviews.medthread.com/${doctor.seo_slug}`,
      url: `https://reviews.medthread.com/${doctor.seo_slug}`,
      telephone: clinic?.phone,
      address: clinic ? {
        '@type': 'PostalAddress',
        streetAddress: clinic.address,
        addressLocality: clinic.city,
        addressRegion: clinic.state,
        postalCode: clinic.postal_code,
        addressCountry: clinic.country
      } : undefined,
      geo: clinic ? {
        '@type': 'GeoCoordinates',
        latitude: clinic.latitude,
        longitude: clinic.longitude
      } : undefined,
      aggregateRating: rating ? {
        '@type': 'AggregateRating',
        ratingValue: rating.overall_rating,
        reviewCount: rating.total_reviews,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      priceRange: '$$',
      openingHoursSpecification: clinic?.hours ? this.generateOpeningHours(clinic.hours) : undefined
    };
  }

  /**
   * Generate opening hours specification
   */
  private generateOpeningHours(hours: any) {
    const daysMap: any = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };

    return Object.entries(hours).map(([day, time]: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: daysMap[day],
      opens: time.open,
      closes: time.close
    }));
  }

  /**
   * Generate Review schema markup
   */
  generateReviewSchema(review: any, doctor: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      itemReviewed: {
        '@type': 'MedicalBusiness',
        name: `Dr. ${doctor.username}`,
        image: doctor.avatar
      },
      author: {
        '@type': 'Person',
        name: review.is_anonymous ? 'Anonymous' : review.reviewer_name
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.review_text,
      datePublished: review.created_at
    };
  }

  /**
   * Create or update doctor SEO profile
   */
  async createDoctorSEOProfile(doctorId: string) {
    // Get doctor info
    const doctor = await prisma.$queryRaw<any[]>`
      SELECT u.*, dc.city, dc.state, dc.country
      FROM "User" u
      LEFT JOIN "DoctorClinic" dc ON u.id = dc.doctor_id AND dc.is_primary = true
      WHERE u.id = ${doctorId}
    `;

    if (doctor.length === 0) {
      throw new Error('Doctor not found');
    }

    const doc = doctor[0];
    const slug = this.generateDoctorSlug(doc.username, doc.specialty, doc.city);

    // Get rating info
    const rating = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorRating" WHERE doctor_id = ${doctorId}
    `;

    // Get clinic info
    const clinic = await prisma.$queryRaw<any[]>`
      SELECT * FROM "DoctorClinic" WHERE doctor_id = ${doctorId} AND is_primary = true
    `;

    const metaTitle = `Dr. ${doc.username} - ${doc.specialty || 'Doctor'} in ${doc.city || 'Your Area'} | Reviews & Ratings`;
    const metaDescription = `Read verified patient reviews for Dr. ${doc.username}, a ${doc.specialty || 'healthcare professional'} in ${doc.city || 'your area'}. ${rating[0]?.overall_rating ? `Rated ${rating[0].overall_rating}/5 by ${rating[0].total_reviews} patients.` : 'Book consultation today.'}`;
    
    const schemaMarkup = this.generateDoctorSchema(doc, clinic[0], rating[0]);

    // Upsert SEO profile
    await prisma.$executeRaw`
      INSERT INTO "DoctorSEOProfile" (
        doctor_id, slug, meta_title, meta_description, meta_keywords,
        canonical_url, og_title, og_description, og_image, schema_markup
      ) VALUES (
        ${doctorId}, ${slug}, ${metaTitle}, ${metaDescription},
        ARRAY[${doc.specialty}, ${doc.city}, 'doctor reviews', 'patient ratings']::TEXT[],
        ${'https://reviews.medthread.com/' + slug}, ${metaTitle}, ${metaDescription},
        ${doc.avatar}, ${JSON.stringify(schemaMarkup)}::jsonb
      )
      ON CONFLICT (doctor_id) DO UPDATE
      SET slug = ${slug},
          meta_title = ${metaTitle},
          meta_description = ${metaDescription},
          canonical_url = ${'https://reviews.medthread.com/' + slug},
          og_title = ${metaTitle},
          og_description = ${metaDescription},
          og_image = ${doc.avatar},
          schema_markup = ${JSON.stringify(schemaMarkup)}::jsonb,
          last_updated = CURRENT_TIMESTAMP
    `;

    // Update user seo_slug
    await prisma.$executeRaw`
      UPDATE "User"
      SET seo_slug = ${slug},
          last_seo_update = CURRENT_TIMESTAMP
      WHERE id = ${doctorId}
    `;

    return { slug, metaTitle, metaDescription, schemaMarkup };
  }

  /**
   * Generate "Top 10 Doctors in [City]" blog post
   */
  async generateTopDoctorsBlogPost(city: string, specialty?: string) {
    const slug = `top-10-${specialty ? specialty.toLowerCase().replace(/\s+/g, '-') + '-' : ''}doctors-in-${city.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Get top doctors
    const doctors = await prisma.$queryRaw<any[]>`
      SELECT u.*, dr.overall_rating, dr.total_reviews, dc.city
      FROM "User" u
      INNER JOIN "DoctorRating" dr ON u.id = dr.doctor_id
      INNER JOIN "DoctorClinic" dc ON u.id = dc.doctor_id AND dc.is_primary = true
      WHERE dc.city ILIKE ${`%${city}%`}
        ${specialty ? `AND u.specialty ILIKE ${`%${specialty}%`}` : ''}
        AND u.verified = true
      ORDER BY dr.overall_rating DESC, dr.total_reviews DESC
      LIMIT 10
    `;

    const title = `Top 10 ${specialty || ''} Doctors in ${city} - 2026 Reviews & Ratings`;
    const content = this.generateBlogContent(doctors, city, specialty);
    
    const metaDescription = `Discover the best ${specialty || ''} doctors in ${city}. Read verified patient reviews, compare ratings, and book consultations with top-rated healthcare professionals.`;

    return {
      slug,
      title,
      content,
      metaDescription,
      doctors: doctors.map(d => d.id)
    };
  }

  /**
   * Generate blog post content
   */
  private generateBlogContent(doctors: any[], city: string, specialty?: string): string {
    let content = `# Top 10 ${specialty || ''} Doctors in ${city}\n\n`;
    content += `Finding the right ${specialty || 'doctor'} in ${city} can be challenging. We've compiled a list of the top-rated ${specialty || 'healthcare professionals'} based on verified patient reviews, ratings, and consultation success rates.\n\n`;
    
    doctors.forEach((doc, index) => {
      content += `## ${index + 1}. Dr. ${doc.username}\n\n`;
      content += `**Specialty:** ${doc.specialty}\n`;
      content += `**Rating:** ${parseFloat(doc.overall_rating).toFixed(1)}/5 (${doc.total_reviews} reviews)\n`;
      if (doc.yearsOfExperience) content += `**Experience:** ${doc.yearsOfExperience} years\n`;
      if (doc.bio) content += `\n${doc.bio}\n`;
      content += `\n[View Profile & Book Consultation](/dr/${doc.seo_slug})\n\n`;
    });

    content += `## How We Rank Doctors\n\n`;
    content += `Our rankings are based on:\n`;
    content += `- Verified patient reviews and ratings\n`;
    content += `- Response time and availability\n`;
    content += `- Consultation success rates\n`;
    content += `- Years of experience and qualifications\n`;
    content += `- Patient satisfaction scores\n\n`;

    return content;
  }

  /**
   * Track SEO analytics
   */
  async trackSEOAnalytics(entityType: string, entityId: string, data: {
    organicViews?: number;
    googleImpressions?: number;
    googleClicks?: number;
    searchQuery?: string;
    referralSource?: string;
  }) {
    const today = new Date().toISOString().split('T')[0];

    await prisma.$executeRaw`
      INSERT INTO "SEOAnalytics" (
        entity_type, entity_id, date, organic_views, google_impressions,
        google_clicks, search_queries, referral_sources
      ) VALUES (
        ${entityType}, ${entityId}, ${today}::date,
        ${data.organicViews || 0}, ${data.googleImpressions || 0},
        ${data.googleClicks || 0},
        ${data.searchQuery ? JSON.stringify([data.searchQuery]) : '[]'}::jsonb,
        ${data.referralSource ? JSON.stringify([data.referralSource]) : '[]'}::jsonb
      )
      ON CONFLICT (entity_type, entity_id, date) DO UPDATE
      SET organic_views = "SEOAnalytics".organic_views + ${data.organicViews || 0},
          google_impressions = "SEOAnalytics".google_impressions + ${data.googleImpressions || 0},
          google_clicks = "SEOAnalytics".google_clicks + ${data.googleClicks || 0}
    `;
  }
}

export const seoService = new SEOService();
