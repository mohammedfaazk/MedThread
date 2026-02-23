import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const DEFAULT_SEO = {
  siteName: 'MedThread',
  title: 'MedThread - Medical Community & Healthcare Platform',
  description: 'Connect with verified doctors, share medical experiences, and get expert healthcare advice. Join the trusted medical community platform.',
  keywords: [
    'medical community',
    'healthcare platform',
    'doctor consultation',
    'medical advice',
    'health forum',
    'verified doctors',
    'medical threads',
    'patient community',
    'healthcare discussion',
    'medical Q&A',
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://medthread.com',
  image: '/og-image.jpg',
  twitterHandle: '@medthread',
  locale: 'en_US',
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
  } = config;

  const fullTitle = title.includes('MedThread') ? title : `${title} | ${DEFAULT_SEO.siteName}`;
  const fullUrl = url.startsWith('http') ? url : `${DEFAULT_SEO.url}${url}`;
  const fullImage = image.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: DEFAULT_SEO.siteName,
    publisher: DEFAULT_SEO.siteName,
    
    // Open Graph
    openGraph: {
      type,
      locale: DEFAULT_SEO.locale,
      url: fullUrl,
      siteName: DEFAULT_SEO.siteName,
      title: fullTitle,
      description,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        section,
        tags,
        authors: author ? [author] : undefined,
      }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: DEFAULT_SEO.twitterHandle,
      creator: DEFAULT_SEO.twitterHandle,
      title: fullTitle,
      description,
      images: [fullImage],
    },

    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    },

    // Alternate languages
    alternates: {
      canonical: fullUrl,
    },

    // App links
    appleWebApp: {
      capable: true,
      title: DEFAULT_SEO.siteName,
      statusBarStyle: 'default',
    },

    // Format detection
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

// Pre-configured metadata generators
export const seoConfig = {
  home: (): Metadata =>
    generateMetadata({
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      url: '/',
    }),

  post: (title: string, description: string, image?: string, author?: string): Metadata =>
    generateMetadata({
      title,
      description,
      image,
      author,
      type: 'article',
      publishedTime: new Date().toISOString(),
    }),

  profile: (username: string, bio: string, avatar?: string): Metadata =>
    generateMetadata({
      title: `${username}'s Profile`,
      description: bio || `View ${username}'s profile on MedThread`,
      image: avatar,
      type: 'profile',
    }),

  thread: (title: string, description: string): Metadata =>
    generateMetadata({
      title,
      description,
      type: 'article',
      section: 'Medical Discussion',
    }),

  community: (name: string, description: string, icon?: string): Metadata =>
    generateMetadata({
      title: `${name} Community`,
      description,
      image: icon,
    }),
};
