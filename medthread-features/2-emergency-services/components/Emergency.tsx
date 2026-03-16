import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'; // Removed MapPin, Navigation as they are used in sub-components
import { Map } from '../components/map/Map';
import { HospitalList } from '../components/map/HospitalList';
import { Hospital, hospitalService } from '../services/hospitalService';
import { useTranslation } from '@/hooks/useTranslation';

const firstAidSteps = [
  {
    title: 'Bleeding',
    steps: ['Apply direct pressure', 'Elevate the wound', 'Keep the person calm', 'Call for help if severe']
  },
  {
    title: 'Choking',
    steps: ['Encourage coughing', 'Give 5 back blows', 'Perform 5 abdominal thrusts', 'Call 108 if unsuccessful']
  },
  {
    title: 'Burns',
    steps: ['Cool the burn with water', 'Remove jewelry', 'Cover with clean cloth', 'Seek medical help']
  }
];

// Default to Mumbai if location fails
const DEFAULT_LOCATION = { lat: 19.0760, lng: 72.8777 };

export const Emergency = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Map & Location State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDefault, setUsingDefault] = useState(false);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setLoading(true);
    setUsingDefault(false);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationUpdate(latitude, longitude);
        },
        (err) => {
          console.warn("Geolocation failed:", err);
          fallbackToIp();
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      fallbackToIp();
    }
  };

  const fallbackToIp = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error("IP API failed");
      const data = await response.json();
      if (data.latitude && data.longitude) {
        handleLocationUpdate(data.latitude, data.longitude);
      } else {
        throw new Error("Invalid IP data");
      }
    } catch (e) {
      console.warn("IP fallback failed, using default:", e);
      useDefaultLocation();
    }
  };

  const useDefaultLocation = () => {
    setUserLocation(DEFAULT_LOCATION);
    setUsingDefault(true);
    fetchHospitals(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
    setError("Could not find your location. Showing default area (Mumbai).");
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    fetchHospitals(lat, lng);
  };

  const fetchHospitals = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const results = await hospitalService.findNearbyHospitals(lat, lng);
      setHospitals(results);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      setError("Failed to load nearby hospitals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF2F2]">
      {/* Header */}
      <div className="bg-[#DC2626] px-4 py-4 flex items-center gap-3 text-white shadow-lg sticky top-0 z-30">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <h1 className="text-xl font-bold">Emergency Services</h1>
      </div>

      {/* Emergency Call Button */}
      <div className="px-6 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl text-center"
        >
          <div className="relative inline-block">
            {/* Ripple Animation Rings */}
            <motion.div
              animate={{
                scale: [1, 1.4],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 w-40 h-40 rounded-full border-4 border-[#DC2626]"
            />
            <motion.div
              animate={{
                scale: [1, 1.4],
                opacity: [0.4, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity, // Fixed property name
                delay: 0.5,
                ease: "easeOut"
              }}
              className="absolute inset-0 w-40 h-40 rounded-full border-4 border-[#DC2626]"
            />
            <motion.div
              animate={{
                scale: [1, 1.4],
                opacity: [0.2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
                ease: "easeOut"
              }}
              className="absolute inset-0 w-40 h-40 rounded-full border-4 border-[#DC2626]"
            />

            {/* Main Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCall('108')}
              className="relative w-40 h-40 rounded-full bg-[#DC2626] flex flex-col items-center justify-center text-white shadow-2xl z-10"
            >
              <Phone className="w-12 h-12 mb-2" />
              <span className="text-5xl font-bold">108</span>
            </motion.button>
          </div>
          <p className="mt-6 text-lg text-gray-600">Emergency Medical Services</p>
          <p className="text-sm text-gray-500 mt-1">Tap to call immediately</p>
        </motion.div>
      </div>

      {/* Dynamic Map & Facilities Section */}
      <div className="px-6 pb-6">

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-center gap-2">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-2xl p- overflow-hidden shadow-md mb-6 h-64 border-2 border-white relative z-0">
          {/* Map Component - Only render when we have a location (default or real) */}
          {(userLocation || usingDefault) ? (
            <Map
              userLocation={userLocation || DEFAULT_LOCATION}
              hospitals={hospitals}
              selectedHospitalId={selectedHospitalId}
              onSelectHospital={(id) => setSelectedHospitalId(id)}
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center animate-pulse">
              <span className="text-gray-500">Locating...</span>
            </div>
          )}
          {usingDefault && (
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-amber-600 font-bold z-[1001]">
              Default Location
            </div>
          )}
        </div>

        <h2 className="font-bold text-lg text-[#1E293B] mb-3 flex justify-between items-center">
          <span>Nearest Facilities</span>
          {hospitals.length > 0 && <span className="text-sm font-normal text-gray-500">{hospitals.length} found</span>}
        </h2>

        {/* Dynamic Hospital List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          <HospitalList
            hospitals={hospitals}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={(hospital) => setSelectedHospitalId(hospital.id)}
            loading={loading && hospitals.length === 0}
          />
        </div>

        {/* First Aid Guide */}
        <h2 className="font-bold text-lg text-[#1E293B] mt-6 mb-3">First Aid Guide</h2>
        <div className="space-y-2">
          {firstAidSteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-md"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-[#1E293B]">{item.title}</span>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-4 pb-4"
                >
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    {item.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

