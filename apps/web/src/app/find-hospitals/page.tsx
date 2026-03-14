'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import IridescenceLayout from '@/components/IridescenceLayout';
import { HospitalMap } from '@/components/map/HospitalMap';
import { HospitalList } from '@/components/map/HospitalList';
import { hospitalService, Hospital } from '@/services/hospitalService';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';

export default function FindHospitalsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Get user's current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      // Try GPS first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            await searchHospitals(location);
            setLocationLoading(false);
          },
          async (error) => {
            console.warn('GPS failed, trying IP location:', error);
            // Fallback to IP-based location
            try {
              const response = await fetch('https://ipapi.co/json/');
              const data = await response.json();
              const location = { lat: data.latitude, lng: data.longitude };
              setUserLocation(location);
              await searchHospitals(location);
            } catch (ipError) {
              console.error('IP location failed:', ipError);
              setError('Unable to get your location. Please enable location services or try again.');
            }
            setLocationLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (err) {
      console.error('Location error:', err);
      setError('Location services not available. Please try again.');
      setLocationLoading(false);
    }
  };

  // Search for hospitals near location
  const searchHospitals = async (location: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);

    try {
      const results = await hospitalService.findNearbyHospitals(location.lat, location.lng);
      setHospitals(results);
      
      if (results.length === 0) {
        setError('No hospitals found in your area. Try expanding your search radius.');
      }
    } catch (err) {
      console.error('Hospital search error:', err);
      setError('Failed to find hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle hospital selection
  const handleSelectHospital = (hospitalOrId: Hospital | number) => {
    const id = typeof hospitalOrId === 'number' ? hospitalOrId : hospitalOrId.id;
    setSelectedHospitalId(id);
  };

  // Auto-load location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Nearby Hospitals</h1>
                <p className="text-gray-600">Locate hospitals and medical facilities near you</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-white/60 rounded-lg p-1 border border-white/20">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'map' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Refresh Location Button */}
                <button
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {locationLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {locationLoading ? 'Finding Location...' : 'Refresh Location'}
                </button>
              </div>
            </div>

            {/* Location Status */}
            {userLocation && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-blue-500" />
                <span>
                  Showing hospitals near your location ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                </span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            {viewMode === 'map' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
                {/* Hospital List Sidebar */}
                <div className="lg:col-span-1 border-r border-white/20 overflow-y-auto">
                  <div className="p-4 border-b border-white/20 bg-white/20">
                    <h2 className="font-semibold text-gray-900">
                      {loading ? 'Searching...' : `${hospitals.length} hospitals found`}
                    </h2>
                  </div>
                  <HospitalList
                    hospitals={hospitals}
                    selectedHospitalId={selectedHospitalId}
                    onSelectHospital={handleSelectHospital}
                    loading={loading}
                  />
                </div>

                {/* Map */}
                <div className="lg:col-span-2 relative">
                  {userLocation ? (
                    <HospitalMap
                      userLocation={userLocation}
                      hospitals={hospitals}
                      selectedHospitalId={selectedHospitalId}
                      onSelectHospital={handleSelectHospital}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600">Getting your location...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* List View */
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {loading ? 'Searching...' : `${hospitals.length} hospitals found`}
                  </h2>
                </div>
                <HospitalList
                  hospitals={hospitals}
                  selectedHospitalId={selectedHospitalId}
                  onSelectHospital={handleSelectHospital}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use Hospital Finder</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-gray-800">Allow Location Access</p>
                  <p>Enable location services to find hospitals near you automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-gray-800">Browse Results</p>
                  <p>View hospitals on the map or in list format, sorted by distance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-gray-800">Get Directions</p>
                  <p>Call hospitals directly or get directions using Google Maps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </IridescenceLayout>
  );
}