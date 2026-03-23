'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Settings, Heart } from 'lucide-react';
import Link from 'next/link';

interface FamilyGroup {
  id: string;
  name: string;
  members: any[];
  adminUserId: string;
  createdAt: string;
}

export default function FamilyHealthPage() {
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/api/v1/family`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching family groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Family Health Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage and monitor your family's health together
              </p>
            </div>
            <Link
              href="/family/create"
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Family Group
            </Link>
          </div>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No family groups yet</h3>
            <p className="text-gray-600 mb-6">
              Create a family group to start managing health together
            </p>
            <Link
              href="/family/create"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Family Group
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/family/${group.id}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex -space-x-2">
                    {group.members?.slice(0, 5).map((member: any, index: number) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                      >
                        {member.name?.charAt(0) || 'M'}
                      </div>
                    ))}
                    {(group.members?.length || 0) > 5 && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                        +{(group.members?.length || 0) - 5}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shared Health Data</h3>
            <p className="text-gray-600 text-sm">
              View and manage health information for all family members in one place
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
            <p className="text-gray-600 text-sm">
              Quick access to emergency contacts and medical information for all members
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Controls</h3>
            <p className="text-gray-600 text-sm">
              Granular permissions to control who can view and edit health data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
