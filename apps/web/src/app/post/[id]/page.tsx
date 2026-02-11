'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostDetail } from '@/components/PostDetail'
import { CommentSection } from '@/components/CommentSection'

export default function PostPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostDetail postId={params.id} />
          <CommentSection postId={params.id} />
        </main>
      </div>
    </div>
  )
}