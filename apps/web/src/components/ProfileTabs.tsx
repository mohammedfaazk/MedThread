'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ProfileTabsProps {
  username: string
  profileUser: any
}

export function ProfileTabs({ username, profileUser }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts')
  const [posts, setPosts] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts()
    } else if (activeTab === 'comments') {
      fetchComments()
    }
  }, [activeTab, username])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/profile/${username}/posts`)
      if (response.data.success) {
        setPosts(response.data.data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/profile/${username}/comments`)
      if (response.data.success) {
        setComments(response.data.data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'posts'
              ? 'border-b-2 border-[#00BCD4] text-[#00BCD4]'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'comments'
              ? 'border-b-2 border-[#00BCD4] text-[#00BCD4]'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'about'
              ? 'border-b-2 border-[#00BCD4] text-[#00BCD4]'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          About
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No posts yet</p>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="block bg-white/60 rounded-lg p-4 hover:bg-white/80 transition border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <button className="text-gray-400 hover:text-orange-500">
                            ▲
                          </button>
                          <span className="text-sm font-semibold">{post.score}</span>
                          <button className="text-gray-400 hover:text-blue-500">
                            ▼
                          </button>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>m/{post.community.name}</span>
                            <span>•</span>
                            <span>{post.commentCount} comments</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/post/${comment.post.id}`}
                      className="block bg-white/60 rounded-lg p-4 hover:bg-white/80 transition border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <button className="text-gray-400 hover:text-orange-500">
                            ▲
                          </button>
                          <span className="text-sm font-semibold">{comment.score}</span>
                          <button className="text-gray-400 hover:text-blue-500">
                            ▼
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-600 mb-2">
                            Comment on{' '}
                            <span className="font-semibold text-gray-900">
                              {comment.post.title}
                            </span>
                            {' '}in m/{comment.post.community.name}
                          </div>
                          <p className="text-gray-800">{comment.content}</p>
                          <div className="text-sm text-gray-600 mt-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white/60 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                {profileUser.bio ? (
                  <p className="text-gray-700 mb-4">{profileUser.bio}</p>
                ) : (
                  <p className="text-gray-600 italic mb-4">No bio yet</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Joined:</span>
                    <span className="text-gray-700">
                      {new Date(profileUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {profileUser.specialty && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Specialty:</span>
                      <span className="text-gray-700">{profileUser.specialty}</span>
                    </div>
                  )}
                  
                  {profileUser.yearsOfExperience && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Experience:</span>
                      <span className="text-gray-700">{profileUser.yearsOfExperience} years</span>
                    </div>
                  )}
                  
                  {profileUser.hospitalAffiliation && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">Hospital:</span>
                      <span className="text-gray-700">{profileUser.hospitalAffiliation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
