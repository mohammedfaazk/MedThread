'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, FileText, TrendingUp, Award, Calendar, Heart } from 'lucide-react';
import CountUp from '../enhancements/CountUp';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorStats {
  totalPosts: number;
  totalComments: number;
  conversionCount: number;
  curedPatientCount: number;
  portfolioScore: number;
  clinicVisitCount: number;
  helpfulnessScore: number;
}

export function DoctorPublicStats({ doctorId }: { doctorId: string }) {
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/enhanced-analytics/doctor-stats/${doctorId}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Live Stats</h3>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Live Stats</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-cyan-600">
            <CountUp from={0} to={stats.totalPosts} duration={1.5} />
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">Total Comments</span>
          </div>
          <p className="text-2xl font-bold text-cyan-600">
            <CountUp from={0} to={stats.totalComments} duration={1.5} />
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            <CountUp from={0} to={stats.conversionCount} duration={1.5} />
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">Patients Cured</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            <CountUp from={0} to={stats.curedPatientCount} duration={1.5} />
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">Clinic Visits</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            <CountUp from={0} to={stats.clinicVisitCount} duration={1.5} />
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Portfolio Score</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            <CountUp from={0} to={stats.portfolioScore} duration={1.5} />
          </p>
        </div>
      </div>
    </div>
  );
}
