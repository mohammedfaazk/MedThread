'use client'

import { useState, useEffect } from 'react';
import { MapPin, Stethoscope, Clock, Phone, Shield, Zap, Building2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorReply {
  id: string;
  content: string;
  createdAt: string;
  upvotes: number;
  score: number;
  doctor: {
    id: string;
    username: string;
    role: string;
    avatar: string | null;
    verified: boolean;
    specialty: string | null;
    subSpecialty: string | null;
    yearsOfExperience: number | null;
    hospitalAffiliation: string | null;
    clinic: {
      id: number;
      name: string;
      address: string;
      city: string;
      state: string | null;
      country: string;
      latitude: number;
      longitude: number;
      phone: string | null;
      distance: {
        km: number;
        formatted: string;
      } | null;
    } | null;
    availability: {
      telemedicineAvailable: boolean;
      inPersonAvailable: boolean;
      emergencyAvailable: boolean;
      insuranceAccepted: string[];
      acceptsAllInsurance: boolean;
      nextAvailableSlot: string | null;
    } | null;
    clinicStatus: {
      isOpen: boolean;
      opensAt: string | null;
      closesAt: string | null;
    } | null;
  };
}

interface AreaWiseDoctorRepliesProps {
  postId: string;
}

export default function AreaWiseDoctorReplies({ postId }: AreaWiseDoctorRepliesProps) {
  const [replies, setReplies] = useState<DoctorReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  // Filters
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [telemedicineFilter, setTelemedicineFilter] = useState(false);
  const [inPersonOnlyFilter, setInPersonOnlyFilter] = useState(false);
  const [emergencyFilter, setEmergencyFilter] = useState(false);
  const [insuranceFilter, setInsuranceFilter] = useState<string>('');

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    fetchDoctorReplies();
  }, [postId, userLocation, radiusFilter, telemedicineFilter, inPersonOnlyFilter, emergencyFilter, insuranceFilter]);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationPermission('denied');
          // Continue without location
        }
      );
    } else {
      setLocationPermission('denied');
    }
  };

  const fetchDoctorReplies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      if (radiusFilter) params.radius = radiusFilter;
      if (telemedicineFilter) params.telemedicine = 'true';
      if (inPersonOnlyFilter) params.inPersonOnly = 'true';
      if (emergencyFilter) params.emergency = 'true';
      if (insuranceFilter) params.insurance = insuranceFilter;

      const response = await axios.get(`${API_URL}/api/posts/${postId}/replies/doctors`, { params });
      
      if (response.data.success) {
        setReplies(response.data.data.replies);
      }
    } catch (err: any) {
      console.error('Error fetching doctor replies:', err);
      setError(err.response?.data?.error || 'Failed to load doctor replies');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getDirections = (clinic: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Status */}
      {locationPermission === 'denied' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <MapPin className="inline w-4 h-4 mr-1" />
            Location access denied. Doctors are sorted alphabetically. Enable location for distance-based sorting.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold mb-3">Filter Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <select
                value={radiusFilter || ''}
                onChange={(e) => setRadiusFilter(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              >
                <option value="">All distances</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="telemedicine"
              checked={telemedicineFilter}
              onChange={(e) => setTelemedicineFilter(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="telemedicine" className="text-sm font-medium text-gray-700">
              Telemedicine Available
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inPersonOnly"
              checked={inPersonOnlyFilter}
              onChange={(e) => setInPersonOnlyFilter(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="inPersonOnly" className="text-sm font-medium text-gray-700">
              In-Person Only
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="emergency"
              checked={emergencyFilter}
              onChange={(e) => setEmergencyFilter(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="emergency" className="text-sm font-medium text-gray-700">
              Emergency Available
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Provider
            </label>
            <input
              type="text"
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
              placeholder="e.g., Blue Cross"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Doctor Replies */}
      <div className="space-y-4">
        {replies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No doctor replies found matching your filters.
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              {/* Doctor Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {reply.doctor.avatar ? (
                    <img
                      src={reply.doctor.avatar}
                      alt={reply.doctor.username}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {reply.doctor.username[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{reply.doctor.username}</span>
                      {reply.doctor.verified && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {reply.doctor.specialty}
                      {reply.doctor.yearsOfExperience && ` • ${reply.doctor.yearsOfExperience} years exp`}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
              </div>

              {/* Reply Content */}
              <div className="mb-4">
                <p className="text-gray-800">{reply.content}</p>
              </div>

              {/* Availability Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {reply.doctor.availability?.telemedicineAvailable && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Telemedicine Available
                  </span>
                )}
                {reply.doctor.availability?.inPersonAvailable && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    In-Person Consultation
                  </span>
                )}
                {reply.doctor.availability?.emergencyAvailable && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                    <Zap className="w-3 h-3" />
                    Emergency Available
                  </span>
                )}
              </div>

              {/* Clinic Information */}
              {reply.doctor.clinic && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{reply.doctor.clinic.name}</h4>
                      <p className="text-sm text-gray-600">{reply.doctor.clinic.address}</p>
                      <p className="text-sm text-gray-600">
                        {reply.doctor.clinic.city}, {reply.doctor.clinic.state} {reply.doctor.clinic.country}
                      </p>
                      {reply.doctor.clinic.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {reply.doctor.clinic.phone}
                        </p>
                      )}
                    </div>
                    {reply.doctor.clinic.distance && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-blue-600 font-semibold">
                          <MapPin className="w-4 h-4" />
                          {reply.doctor.clinic.distance.formatted}
                        </div>
                        <button
                          onClick={() => getDirections(reply.doctor.clinic)}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Get Directions
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clinic Status */}
                  {reply.doctor.clinicStatus && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      {reply.doctor.clinicStatus.isOpen ? (
                        <span className="text-green-600 font-semibold">
                          Currently Open • Closes at {reply.doctor.clinicStatus.closesAt}
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          Closed • {reply.doctor.clinicStatus.opensAt ? `Opens ${reply.doctor.clinicStatus.opensAt}` : 'Hours not available'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Insurance */}
                  {reply.doctor.availability && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Insurance: </span>
                      {reply.doctor.availability.acceptsAllInsurance ? (
                        <span className="text-green-600">Most Insurance Accepted</span>
                      ) : reply.doctor.availability.insuranceAccepted.length > 0 ? (
                        <span>{reply.doctor.availability.insuranceAccepted.join(', ')}</span>
                      ) : (
                        <span>Contact clinic for details</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  {reply.upvotes}
                </button>
                <button className="hover:text-blue-600">Reply</button>
                <button className="hover:text-blue-600">Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
