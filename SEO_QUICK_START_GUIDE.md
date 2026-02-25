# SEO Rating Website - Quick Start Guide

## Setup Instructions

### 1. Run Database Migration

The migration file is already created at:
```
packages/database/prisma/migrations/20260224_seo_rating_website/migration.sql
```

To apply it when database connections are available:
```bash
cd packages/database
npx prisma db push
```

Or run the SQL directly in your database client.

### 2. Test the System

Once migration is applied:
```bash
cd apps/api
npx ts-node test-seo-system.ts
```

This will:
- Find a test doctor
- Create SEO profile with slug and meta tags
- Generate schema markup
- Create sample blog post
- Track analytics
- Verify all components

### 3. API Endpoints

#### Doctor SEO Profile
```bash
# Get doctor profile by slug
GET /api/seo/doctor/dr-john-smith-cardiologist-mumbai

# Create/update SEO profile (authenticated)
POST /api/seo/doctor/:doctorId/profile
```

#### Testimonials
```bash
# Submit testimonial (authenticated)
POST /api/seo/testimonials
Body: {
  "doctorId": "doctor-id",
  "appointmentId": "appointment-id",
  "testimonialText": "Great doctor!",
  "rating": 5,
  "treatmentType": "Heart Surgery",
  "beforeCondition": "Chest pain",
  "afterCondition": "Fully recovered",
  "isAnonymous": false
}

# Get testimonials
GET /api/seo/testimonials/:doctorId?featured=true
```

#### Blog Content
```bash
# Generate blog post (admin only)
POST /api/seo/content/blog
Body: {
  "city": "Mumbai",
  "specialty": "Cardiology"
}

# Get blog post
GET /api/seo/content/top-10-cardiologists-in-mumbai
```

#### Sitemap
```bash
# Get sitemap data
GET /api/seo/sitemap
```

### 4. Frontend Usage

#### Doctor Profile Page
```tsx
import DoctorSEOProfile from '@/components/DoctorSEOProfile';

export default function DoctorPage({ params }: { params: { slug: string } }) {
  return <DoctorSEOProfile slug={params.slug} />;
}
```

#### Blog Post Page
```tsx
import SEOBlogPost from '@/components/SEOBlogPost';

export default function BlogPage({ params }: { params: { slug: string } }) {
  return <SEOBlogPost slug={params.slug} />;
}
```

### 5. Generate SEO Profiles for All Doctors

Create a script to generate profiles for all existing doctors:

```typescript
import { prisma } from '@medthread/database';
import { seoService } from './src/services/seo.service';

async function generateAllProfiles() {
  const doctors = await prisma.user.findMany({
    where: {
      role: { in: ['DOCTOR', 'NURSE', 'PHARMACIST'] },
      verified: true
    }
  });

  for (const doctor of doctors) {
    try {
      await seoService.createDoctorSEOProfile(doctor.id);
      console.log(`✅ Created profile for ${doctor.username}`);
    } catch (error) {
      console.error(`❌ Failed for ${doctor.username}:`, error);
    }
  }
}

generateAllProfiles();
```

### 6. Subdomain Configuration

#### DNS Setup
Add CNAME record:
```
reviews.medthread.com -> medthread.com
```

#### Next.js Configuration
Update `next.config.js`:
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:slug',
        destination: '/reviews/:slug',
        has: [
          {
            type: 'host',
            value: 'reviews.medthread.com',
          },
        ],
      },
    ];
  },
};
```

### 7. SEO Checklist

#### Before Launch
- [ ] Run database migration
- [ ] Generate SEO profiles for all doctors
- [ ] Test doctor profile pages
- [ ] Generate initial blog posts
- [ ] Verify schema markup with Google Rich Results Test
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Configure robots.txt

#### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://reviews.medthread.com/sitemap.xml
```

#### Google Search Console
1. Add property for `reviews.medthread.com`
2. Verify ownership
3. Submit sitemap
4. Monitor indexing status

### 8. Content Strategy

#### Weekly Tasks
- Generate new "Top 10" lists for different cities
- Create specialty-specific guides
- Feature new patient testimonials
- Update doctor rankings

#### Monthly Tasks
- Analyze SEO performance
- Update meta tags based on performance
- Create comparison pages for top doctors
- Generate success story blog posts

### 9. Monitoring

#### Key Metrics
- Organic traffic growth
- Google impressions and clicks
- Average position in search results
- Click-through rate (CTR)
- Conversion rate (profile view → booking)

#### Analytics Queries
```sql
-- Top performing doctor profiles
SELECT 
  dsp.slug,
  u.username,
  dsp.page_views,
  sa.google_clicks,
  sa.google_ctr
FROM "DoctorSEOProfile" dsp
JOIN "User" u ON dsp.doctor_id = u.id
LEFT JOIN "SEOAnalytics" sa ON sa.entity_id = u.id
ORDER BY dsp.page_views DESC
LIMIT 10;

-- Top performing blog posts
SELECT 
  slug,
  title,
  view_count,
  share_count
FROM "SEOContent"
WHERE is_published = true
ORDER BY view_count DESC
LIMIT 10;
```

### 10. Troubleshooting

#### Schema Markup Issues
Test with Google Rich Results Test:
```
https://search.google.com/test/rich-results
```

#### Sitemap Not Updating
Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

#### Low Rankings
- Check meta tags are unique
- Ensure content is high-quality
- Build backlinks from medical directories
- Encourage more patient reviews
- Update content regularly

## Example URLs

### Production URLs
- Doctor Profile: `https://reviews.medthread.com/dr-john-smith-cardiologist-mumbai`
- Blog Post: `https://reviews.medthread.com/blog/top-10-cardiologists-in-mumbai`
- Comparison: `https://reviews.medthread.com/compare/dr-smith-vs-dr-jones`
- Sitemap: `https://reviews.medthread.com/sitemap.xml`

### Development URLs
- Doctor Profile: `http://localhost:3000/reviews/dr-john-smith-cardiologist-mumbai`
- Blog Post: `http://localhost:3000/blog/top-10-cardiologists-in-mumbai`

## Support

For issues or questions:
1. Check migration was applied successfully
2. Verify API routes are registered in `apps/api/src/index.ts`
3. Test endpoints with Postman or curl
4. Check browser console for errors
5. Review server logs for API errors

## Success Metrics

### Month 1
- 100+ doctor profiles indexed
- 10+ blog posts published
- 1,000+ organic impressions

### Month 3
- 500+ doctor profiles indexed
- 50+ blog posts published
- 10,000+ organic impressions
- 100+ organic clicks

### Month 6
- All doctors indexed
- 100+ blog posts published
- 50,000+ organic impressions
- 1,000+ organic clicks
- 10+ bookings from organic traffic
