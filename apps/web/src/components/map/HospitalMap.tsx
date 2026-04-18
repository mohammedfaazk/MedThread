'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '@/services/hospitalService';
import { useEffect } from 'react';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const UserIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const SelectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HospitalMapProps {
  userLocation: { lat: number; lng: number } | null;
  hospitals: Hospital[];
  selectedHospitalId: number | null;
  onSelectHospital: (id: number) => void;
}

function FlyToTarget({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}
export const HospitalMap = ({ userLocation, hospitals, selectedHospitalId, onSelectHospital }: HospitalMapProps) => {
  const defaultCenter: [number, number] = [0, 0];

  // Determine center functionality
  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
  const targetCenter = selectedHospital ? { lat: selectedHospital.lat, lng: selectedHospital.lng } : userLocation;

  return (
    <div className="h-full w-full bg-gray-100">
      <MapContainer
        center={defaultCenter}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyToTarget center={targetCenter} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon} zIndexOffset={1000}>
            <Popup>
              <div className="font-bold">You are here</div>
            </Popup>
          </Marker>
        )}

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            icon={selectedHospitalId === hospital.id ? SelectedIcon : DefaultIcon}
            eventHandlers={{
              click: () => onSelectHospital(hospital.id)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-1">{hospital.name}</h3>
                {hospital.emergency && (
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-2">
                    EMERGENCY
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-2">
                  {hospital.address || "View on map for exact location"}
                </p>
                <div className="text-sm text-blue-600 font-semibold mb-3">
                  {hospital.distance} km away
                </div>
                <div className="flex gap-2">
                  {hospital.phone && (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold hover:bg-emerald-100"
                    >
                      📞 Call
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100"
                  >
                    🧭 Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};