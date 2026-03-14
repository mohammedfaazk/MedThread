'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CommunityActivity {
  communityId: string;
  communityName: string;
  displayName: string;
  activityTier: 'HIGHLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'INACTIVE';
  totalPosts: number;
  totalComments: number;
  avgPostsPerDay: string;
  avgCommentsPerPost: string;
}

export function CommunityActivityInsights({ communityId }: { communityId?: string }) {
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [communityId]);

  const fetchData = async () => {
    try {
      const url = communityId
        ? `${API_URL}/api/enhanced-analytics/community-activity?communityId=${communityId}`
        : `${API_URL}/api/enhanced-analytics/community-activity`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching community activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'HIGHLY_ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MODERATELY_ACTIVE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'HIGHLY_ACTIVE':
        return <TrendingUp className="w-4 h-4" />;
      case 'MODERATELY_ACTIVE':
        return <Minus className="w-4 h-4" />;
      case 'INACTIVE':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Community Activity Insights</h3>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Community Activity Insights</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.communityId}
            className="bg-white/60 rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{activity.displayName}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getTierColor(activity.activityTier)}`}>
                {getTierIcon(activity.activityTier)}
                {activity.activityTier.replace('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Posts (30d):</span> {activity.totalPosts}
              </div>
              <div>
                <span className="font-medium">Comments:</span> {activity.totalComments}
              </div>
              <div>
                <span className="font-medium">Avg Posts/Day:</span> {activity.avgPostsPerDay}
              </div>
              <div>
                <span className="font-medium">Avg Comments/Post:</span> {activity.avgCommentsPerPost}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
