'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';

interface SupportGroup {
  id: string;
  name: string;
  condition: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  members: any[];
}

export default function SupportGroupsPage() {
  const { user } = useJWTAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [myGroups, setMyGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/v1/support-groups');
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/v1/support-groups/user/${user.id}`);
      const data = await response.json();
      setMyGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching my groups:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchGroups();
      return;
    }
    try {
      const response = await fetch(`/api/v1/support-groups/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error searching groups:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/v1/support-groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, isAnonymous: false })
      });
      
      if (response.ok) {
        fetchGroups();
        fetchMyGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const isUserMember = (group: SupportGroup) => {
    return myGroups.some(g => g.id === group.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to access Support Groups</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support Groups</h1>
          <p className="text-gray-600">Connect with others facing similar health challenges</p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search groups by condition or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              All Groups ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'my'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              My Groups ({myGroups.length})
            </button>
          </div>
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="text-center py-12">Loading groups...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'all' ? groups : myGroups).map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  {group.isPrivate && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      Private
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {group.condition}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                  </span>
                  
                  {isUserMember(group) ? (
                    <button
                      onClick={() => router.push(`/support-groups/${group.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      View Group
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'all' ? groups : myGroups).length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            {activeTab === 'all' 
              ? 'No groups found. Create the first one!'
              : "You haven't joined any groups yet."}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchGroups();
            fetchMyGroups();
          }}
          userId={user.id}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onSuccess, userId }: any) {
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    description: '',
    isPrivate: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/support-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, createdBy: userId })
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Create Support Group</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Group Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Diabetes Support Network"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Condition</label>
            <input
              type="text"
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Type 2 Diabetes"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Describe the purpose of this group..."
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Make this group private</span>
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
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
