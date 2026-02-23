import { NextResponse } from 'next/server';
import { prisma } from '@medthread/database';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medthread.com';

export async function GET() {
  try {
    // Fetch all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED',
      },
      select: {
        username: true,
        updatedAt: true,
      },
      take: 1000,
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${doctors
    .map((doctor) => {
      return `
  <url>
    <loc>${BASE_URL}/u/${doctor.username}</loc>
    <lastmod>${new Date(doctor.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating doctors sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
