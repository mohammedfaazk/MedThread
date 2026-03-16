import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '../../services/hospitalService';
import { useEffect } from 'react';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const SelectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapProps {
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

export const Map = ({ userLocation, hospitals, selectedHospitalId, onSelectHospital }: MapProps) => {
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                        {/* Removing popup to cleaner interaction - selection happens on click */}
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
