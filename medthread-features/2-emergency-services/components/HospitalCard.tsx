import { Phone, MapPin, Navigation } from 'lucide-react';
import { Hospital } from '../../services/hospitalService';

interface HospitalCardProps {
    hospital: Hospital;
    isSelected?: boolean;
    onSelect: (hospital: Hospital) => void;
}

export const HospitalCard = ({ hospital, isSelected, onSelect }: HospitalCardProps) => {
    return (
        <div
            onClick={() => onSelect(hospital)}
            className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isSelected
                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md'
                : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{hospital.name}</h3>
                    {hospital.emergency && (
                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full mt-1">
                            EMERGENCY
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-blue-600 text-sm whitespace-nowrap">
                        {hospital.distance} km
                    </span>
                </div>
            </div>

            <div className="flex items-start gap-1.5 text-gray-500 text-sm mb-4">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <p className="line-clamp-2 leading-tight">
                    {hospital.address ? hospital.address : "View on map for exact location"}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
                {hospital.phone ? (
                    <a
                        href={`tel:${hospital.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                    >
                        <Phone size={14} />
                        Call
                    </a>
                ) : (
                    <span className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed">
                        <Phone size={14} />
                        No Phone
                    </span>
                )}

                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Navigation size={14} />
                    Directions
                </a>
            </div>
        </div>
    );
};
