import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Schema generators
export const structuredDataSchemas = {
  // Organization schema
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MedThread',
    description: 'Medical Community & Healthcare Platform',
    url: 'https://medthread.com',
    logo: 'https://medthread.com/logo.png',
    sameAs: [
      'https://twitter.com/medthread',
      'https://facebook.com/medthread',
      'https://linkedin.com/company/medthread',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      email: 'support@medthread.com',
      availableLanguage: ['English'],
    },
  }),

  // Website schema
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MedThread',
    url: 'https://medthread.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://medthread.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }),

  // Article/Post schema
  article: (post: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    modifiedDate?: string;
    image?: string;
    url: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image || 'https://medthread.com/og-image.jpg',
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate || post.publishedDate,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MedThread',
      logo: {
        '@type': 'ImageObject',
        url: 'https://medthread.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  }),

  // Medical Q&A schema
  qaPage: (thread: {
    question: string;
    answer?: string;
    author: string;
    publishedDate: string;
    url: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: thread.question,
      text: thread.question,
      answerCount: thread.answer ? 1 : 0,
      dateCreated: thread.publishedDate,
      author: {
        '@type': 'Person',
        name: thread.author,
      },
      ...(thread.answer && {
        acceptedAnswer: {
          '@type': 'Answer',
          text: thread.answer,
          dateCreated: thread.publishedDate,
          url: thread.url,
        },
      }),
    },
  }),

  // Doctor/Person schema
  person: (doctor: {
    name: string;
    jobTitle?: string;
    description?: string;
    image?: string;
    url: string;
    specialty?: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: doctor.name,
    jobTitle: doctor.jobTitle || 'Medical Professional',
    description: doctor.description,
    image: doctor.image,
    url: doctor.url,
    ...(doctor.specialty && {
      knowsAbout: doctor.specialty,
    }),
  }),

  // Medical Organization schema
  medicalOrganization: () => ({
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'MedThread',
    description: 'Online Medical Community Platform',
    url: 'https://medthread.com',
    medicalSpecialty: [
      'GeneralPractice',
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Psychiatry',
    ],
  }),

  // Breadcrumb schema
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  // FAQ schema
  faq: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),
};
