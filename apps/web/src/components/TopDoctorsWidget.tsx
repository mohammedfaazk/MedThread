'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound, Star, Heart, TrendingUp } from 'lucide-react';
import CountUp from './enhancements/CountUp';
import { useUser } from '@/context/UserContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Doctor {
  id: string;
  username: string;
  specialty: string;
  avatar?: string;
  pincode?: string;
  curedPatientCount: number;
  conversionCount: number;
  portfolioScore: number;
  helpfulnessScore: number;
}

export function TopDoctorsWidget({ specialty }: { specialty?: string }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'regional' | 'global'>('regional');
  const { user } = useUser();

  useEffect(() => {
    fetchDoctors();
  }, [view, specialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialty) params.append('specialty', specialty);
      params.append('limit', '5');
      
      // Use user's pincode for regional filtering
      if (view === 'regional' && user?.pincode) {
        params.append('region', user.pincode);
      }
      
      const response = await fetch(`${API_URL}/api/enhanced-analytics/top-doctors?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      console.error('Error fetching top doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
      <div className="px-4 py-3 border-b border-cyan-200/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-gray-800">
            {specialty ? `Top ${specialty} Doctors` : 'Top Doctors'}
          </h3>
          <TrendingUp className="w-4 h-4 text-cyan-600" />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('regional')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              view === 'regional'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Regional
          </button>
          <button
            onClick={() => setView('global')}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              view === 'global'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-xs text-center text-gray-500 py-4">No doctors found</p>
        ) : (
          doctors.map((doctor, idx) => (
            <Link
              key={doctor.id}
              href={`/u/${doctor.username}`}
              className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-xl px-2 cursor-pointer transition-all"
            >
              <span className="text-sm font-bold text-gray-500 w-4">{idx + 1}</span>
              
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserRound className="w-4 h-4 text-blue-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Dr. {doctor.username}</p>
                <p className="text-xs text-gray-500 truncate">{doctor.specialty}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                  <Star className="w-3 h-3 fill-blue-600" />
                  <CountUp from={0} to={doctor.portfolioScore} duration={1} className="inline" />
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Heart className="w-3 h-3 fill-green-600" />
                  <CountUp from={0} to={doctor.curedPatientCount} duration={1} className="inline" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/doctors"
        className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-cyan-50/50 border-t border-cyan-200/30 font-semibold transition-all"
      >
        View All Doctors
      </Link>
    </div>
  );
}
