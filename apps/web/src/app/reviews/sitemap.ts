import { MetadataRoute } from 'next';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await axios.get(`${API_URL}/api/seo/sitemap`);
    
    if (!response.data.success) {
      return [];
    }

    const { doctors, content } = response.data.data;

    const doctorUrls: MetadataRoute.Sitemap = doctors.map((doc: any) => ({
      url: doc.url,
      lastModified: new Date(doc.lastmod),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const contentUrls: MetadataRoute.Sitemap = content.map((post: any) => ({
      url: post.url,
      lastModified: new Date(post.lastmod),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [
      {
        url: 'https://reviews.medthread.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...doctorUrls,
      ...contentUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}
