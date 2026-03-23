import { useEffect, useState } from 'react';
import { Map } from './components/Map';
import { HospitalList } from './components/HospitalList';
import { Hospital, hospitalService } from './services/hospitalService';
import { MapPin, AlertCircle, Loader2, Search } from 'lucide-react';
import axios from 'axios';

// Default to Mumbai if location fails
const DEFAULT_LOCATION = { lat: 19.0760, lng: 72.8777 };

function App() {
    // Initialize with null to try finding location first, but we handle the fallback gracefully
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true); // Start loading
    const [error, setError] = useState<string | null>(null);
    const [usingDefault, setUsingDefault] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        // Attempt to get location on mount
        initializeLocation();
    }, []);

    const initializeLocation = async () => {
        setLoading(true);
        setUsingDefault(false);
        setError(null);

        // 1. Try Browser Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleLocationUpdate(latitude, longitude);
                },
                (err) => {
                    console.warn("Geolocation failed:", err);
                    // 2. Fallback to IP Location
                    fallbackToIp();
                },
                { timeout: 5000, enableHighAccuracy: false } // fast timeout
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
            // 3. Last Resort: Default Location
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            // Use OpenStreetMap Nominatim for geocoding
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                setUsingDefault(false);
                handleLocationUpdate(latitude, longitude);
            } else {
                setError("Location not found. Please try another search.");
            }
        } catch (err) {
            setError("Search failed. Please check internet connection.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-20 shrink-0 gap-3">
                <div className="flex items-center gap-2">
                    <div className="bg-red-600 p-1.5 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <h1 className="text-lg font-bold text-gray-800">Hospital Finder</h1>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md w-full relative">
                    <input
                        type="text"
                        placeholder="Search city or area..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        <Search size={16} />
                    </button>
                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />}
                </form>

                <div className={`text-xs font-medium px-2 py-1 rounded-full ${usingDefault ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {loading ? "Loading..." : usingDefault ? "Default Location" : "Location Found"}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Error / Loading Overlays */}
                {error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white border-l-4 border-red-500 text-gray-700 px-4 py-3 rounded shadow-lg flex items-center gap-3 text-sm max-w-xs md:max-w-md animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={20} className="text-red-500 shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                            &times;
                        </button>
                    </div>
                )}

                {/* Map Section */}
                <div className="h-[45%] md:h-full md:w-1/2 md:order-2 shadow-inner relative z-0">
                    {/* Map Component - Only render when we have a location (default or real) */}
                    {(userLocation || usingDefault) ? (
                        <Map
                            userLocation={userLocation || DEFAULT_LOCATION}
                            hospitals={hospitals}
                            selectedHospitalId={selectedHospitalId}
                            onSelectHospital={(id) => setSelectedHospitalId(id)}
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="h-[55%] md:h-full md:w-1/2 md:order-1 bg-white flex flex-col shadow-xl z-10 md:z-auto">
                    <div className="p-4 border-b border-gray-100 shrink-0 bg-white">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">
                                    Nearby Facilities
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {hospitals.length} hospitals found
                                </p>
                            </div>
                            {usingDefault && (
                                <button
                                    onClick={initializeLocation}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Retry My Location
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <HospitalList
                            hospitals={hospitals}
                            selectedHospitalId={selectedHospitalId}
                            onSelectHospital={(hospital) => setSelectedHospitalId(hospital.id)}
                            loading={loading && hospitals.length === 0}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
