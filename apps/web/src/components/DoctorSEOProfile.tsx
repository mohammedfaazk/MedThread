'use client'

import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, CheckCircle, Award, Phone, Calendar, Video, Building } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorProfile {
  slug: string;
  doctor_id: string;
  username: string;
  avatar: string | null;
  specialty: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  verified: boolean;
  overall_rating: number;
  total_reviews: number;
  response_time_minutes: number;
  consultation_success_rate: number;
  meta_title: string;
  meta_description: string;
  schema_markup: any;
  page_views: number;
}

interface Testimonial {
  id: number;
  testimonial_text: string;
  rating: number;
  treatment_type: string | null;
  before_condition: string | null;
  after_condition: string | null;
  photo_url: string | null;
  video_url: string | null;
  is_verified: boolean;
  is_featured: boolean;
  patient_name: string;
  patient_avatar: string | null;
  created_at: string;
}

export default function DoctorSEOProfile({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchTestimonials();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seo/doctor/${slug}`);
      if (response.data.success) {
        setProfile(response.data.data);
        
        // Inject schema markup
        if (response.data.data.schema_markup) {
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.text = JSON.stringify(response.data.data.schema_markup);
          document.head.appendChild(script);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const doctorId = slug.split('-')[1]; // Extract from slug
      const response = await axios.get(`${API_URL}/api/seo/testimonials/${doctorId}`, {
        params: { featured: 'true' }
      });
      if (response.data.success) {
        setTestimonials(response.data.data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl shadow-lg">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Dr. {profile.username}</h1>
              {profile.verified && (
                <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>
            
            <p className="text-xl mb-4 opacity-90">{profile.specialty}</p>
            
            {profile.yearsOfExperience && (
              <p className="text-lg opacity-80 mb-4">
                {profile.yearsOfExperience} years of experience
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{parseFloat(profile.overall_rating).toFixed(1)}</span>
              </div>
              <span className="text-lg">{profile.total_reviews} verified reviews</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <Clock className="w-5 h-5 mb-1" />
                <div className="text-sm opacity-80">Response Time</div>
                <div className="font-semibold">{formatResponseTime(profile.response_time_minutes)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 mb-1" />
                <div className="text-sm opacity-80">Success Rate</div>
                <div className="font-semibold">{parseFloat(profile.consultation_success_rate).toFixed(0)}%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Award className="w-5 h-5 mb-1" />
                <div className="text-sm opacity-80">Profile Views</div>
                <div className="font-semibold">{profile.page_views.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Book Consultation
            </button>
            <button className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Call
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      {profile.bio && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">About Dr. {profile.username}</h2>
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Featured Testimonials */}
      {testimonials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Patient Success Stories</h2>
          
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="flex items-start gap-4 mb-4">
                {testimonial.patient_avatar ? (
                  <img
                    src={testimonial.patient_avatar}
                    alt={testimonial.patient_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.patient_name[0].toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{testimonial.patient_name}</span>
                    {testimonial.is_verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        Verified Patient
                      </span>
                    )}
                    {testimonial.is_featured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {testimonial.treatment_type && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {testimonial.treatment_type}
                  </span>
                </div>
              )}

              <p className="text-gray-700 mb-4">{testimonial.testimonial_text}</p>

              {/* Before/After */}
              {(testimonial.before_condition || testimonial.after_condition) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {testimonial.before_condition && (
                    <div>
                      <div className="font-semibold text-sm text-gray-600 mb-1">Before</div>
                      <p className="text-sm text-gray-700">{testimonial.before_condition}</p>
                    </div>
                  )}
                  {testimonial.after_condition && (
                    <div>
                      <div className="font-semibold text-sm text-gray-600 mb-1">After</div>
                      <p className="text-sm text-gray-700">{testimonial.after_condition}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Media */}
              {testimonial.photo_url && (
                <img
                  src={testimonial.photo_url}
                  alt="Treatment result"
                  className="mt-4 rounded-lg max-h-64 object-cover"
                />
              )}
              {testimonial.video_url && (
                <video
                  src={testimonial.video_url}
                  controls
                  className="mt-4 rounded-lg max-h-64 w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Trust Signals */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <h3 className="text-xl font-bold mb-4">Why Choose Dr. {profile.username}?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold">Verified Credentials</div>
              <div className="text-sm text-gray-600">Medical license and qualifications verified</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold">Highly Rated</div>
              <div className="text-sm text-gray-600">{profile.total_reviews} verified patient reviews</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold">Quick Response</div>
              <div className="text-sm text-gray-600">Average response time: {formatResponseTime(profile.response_time_minutes)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <div className="font-semibold">Proven Success</div>
              <div className="text-sm text-gray-600">{parseFloat(profile.consultation_success_rate).toFixed(0)}% consultation success rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-blue-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Book Your Consultation?</h3>
        <p className="mb-6 opacity-90">Join {profile.total_reviews}+ satisfied patients</p>
        <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
          Book Appointment Now
        </button>
      </div>
    </div>
  );
}
