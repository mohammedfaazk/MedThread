import { Hospital } from '../../services/hospitalService';
import { HospitalCard } from './HospitalCard';

interface HospitalListProps {
    hospitals: Hospital[];
    selectedHospitalId: number | null;
    onSelectHospital: (hospital: Hospital) => void;
    loading?: boolean;
}

export const HospitalList = ({ hospitals, selectedHospitalId, onSelectHospital, loading }: HospitalListProps) => {
    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-100 h-32">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (hospitals.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>No hospitals found nearby.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-3 p-4 pb-20 md:pb-4">
            {hospitals.map((hospital) => (
                <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    isSelected={selectedHospitalId === hospital.id}
                    onSelect={onSelectHospital}
                />
            ))}
        </div>
    );
};
