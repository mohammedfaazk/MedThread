'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter, useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isAnonymous: boolean;
  type: string;
  upvotes: number;
  createdAt: string;
}

export default function SupportGroupDetailPage() {
  const { user } = useJWTAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchPosts();
    }
  }, [groupId]);

  useEffect(() => {
    if (group && user) {
      const members = Array.isArray(group.members) ? group.members : [];
      setIsMember(members.some((m: any) => m.userId === user.id));
    }
  }, [group, user]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/support-groups/${groupId}`);
      const data = await response.json();
      setGroup(data.group);
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/support-groups/${groupId}/posts`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/support-groups/${groupId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAnonymous: false })
      });

      if (response.ok) {
        await fetchGroup();
        alert('Successfully joined the group!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/support-groups/${groupId}/leave`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.id })
      });

      if (response.ok) {
        router.push('/support-groups');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!group) {
    return <div className="min-h-screen flex items-center justify-center">Group not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Group Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {group.condition}
              </span>
            </div>
            {isMember ? (
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
              >
                Leave Group
              </button>
            ) : (
              <button
                onClick={handleJoinGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Join Group
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-4">{group.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{group.memberCount} members</span>
            {group.isPrivate && <span>• Private Group</span>}
          </div>
        </div>

        {/* Create Post Button - Only show if member */}
        {isMember && (
          <div className="mb-6">
            <button
              onClick={() => setShowPostModal(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Share Your Experience
            </button>
          </div>
        )}

        {/* Not a member message */}
        {!isMember && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              Join this group to share your experiences and connect with others
            </p>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                  <span className="text-sm text-gray-500">
                    {post.isAnonymous ? 'Anonymous' : 'Member'} • {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {post.type}
                </span>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <span>👍</span>
                  <span>{post.upvotes}</span>
                </button>
                <button className="text-gray-600 hover:text-blue-600">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No posts yet. Be the first to share!
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <CreatePostModal
          groupId={groupId}
          userId={user?.id}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}

function CreatePostModal({ groupId, userId, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'QUESTION',
    isAnonymous: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/support-groups/${groupId}/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, authorId: userId })
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Post</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="What's on your mind?"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={6}
              placeholder="Share your experience, ask a question, or offer support..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Post Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="QUESTION">Question</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="SUPPORT">Support</option>
              <option value="RESOURCE">Resource</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Post anonymously</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
