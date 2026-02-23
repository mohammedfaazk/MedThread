import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import axios from 'axios';
import StructuredData, { structuredDataSchemas } from '@/components/StructuredData';
import { seoConfig } from '@/lib/seo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrls?: string[];
  author: {
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return response.data.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return seoConfig.post(
    post.title,
    post.content.substring(0, 160),
    post.mediaUrls?.[0],
    post.author.username
  );
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  // Generate structured data
  const articleSchema = structuredDataSchemas.article({
    title: post.title,
    description: post.content.substring(0, 200),
    author: post.author.username,
    publishedDate: post.createdAt,
    modifiedDate: post.updatedAt,
    image: post.mediaUrls?.[0],
    url: `https://medthread.com/posts/${post.id}`,
  });

  const breadcrumbSchema = structuredDataSchemas.breadcrumb([
    { name: 'Home', url: 'https://medthread.com' },
    { name: 'Posts', url: 'https://medthread.com/posts' },
    { name: post.title, url: `https://medthread.com/posts/${post.id}` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
