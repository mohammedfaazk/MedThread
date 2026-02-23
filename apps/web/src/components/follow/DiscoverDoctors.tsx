'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Stethoscope, Users, Briefcase } from 'lucide-react';
import FollowButton from './FollowButton';

interface Doctor {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  specialty?: string;
  subSpecialty?: string;
  yearsOfExperience?: number;
  hospitalAffiliation?: string;
  totalKarma: number;
  verified: boolean;
  _count: {
    followers: number;
    posts: number;
  };
}

interface DiscoverDoctorsProps {
  specialty?: string;
}

export default function DiscoverDoctors({ specialty }: DiscoverDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async (loadMore = false) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const url = new URL(`${API_URL}/api/follow/discover`);
      if (specialty) {
        url.searchParams.append('specialty', specialty);
      }
      if (loadMore && cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();

      if (loadMore) {
        setDoctors((prev) => [...prev, ...data.data]);
      } else {
        setDoctors(data.data);
      }

      setCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <Stethoscope size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No doctors found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <Link href={`/u/${doctor.username}`} className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xl flex-shrink-0">
                {doctor.avatar ? (
                  <img
                    src={doctor.avatar}
                    alt={doctor.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  doctor.username.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{doctor.username}</h3>
                  <Stethoscope size={18} className="text-blue-600" />
                  {doctor.verified && (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {doctor.specialty && (
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    {doctor.specialty}
                    {doctor.subSpecialty && ` • ${doctor.subSpecialty}`}
                  </p>
                )}

                {doctor.bio && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doctor.bio}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {doctor.yearsOfExperience && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {doctor.yearsOfExperience} years exp.
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {doctor._count.followers} followers
                  </span>
                  <span>{doctor._count.posts} posts</span>
                  <span>{doctor.totalKarma} karma</span>
                </div>

                {doctor.hospitalAffiliation && (
                  <p className="text-xs text-gray-500 mt-1">
                    {doctor.hospitalAffiliation}
                  </p>
                )}
              </div>
            </Link>

            <FollowButton userId={doctor.id} size="md" variant="primary" />
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchDoctors(true)}
          disabled={isLoadingMore}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-semibold"
        >
          {isLoadingMore ? (
            <Loader2 className="animate-spin inline" size={20} />
          ) : (
            'Load More Doctors'
          )}
        </button>
      )}
    </div>
  );
}
