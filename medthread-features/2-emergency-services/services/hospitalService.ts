import axios from 'axios';

export interface Hospital {
    id: number;
    name: string;
    lat: number;
    lng: number;
    distance?: number; // Distance in kilometers
    address?: string;
    phone?: string;
    website?: string;
    emergency?: boolean;
}

// Haversine formula to calculate distance between two points on Earth
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export const hospitalService = {
    async findNearbyHospitals(lat: number, lng: number): Promise<Hospital[]> {
        try {
            // Overpass QL query: Find nodes/ways with amenity=hospital within 50km
            // Removed ["name"] restriction to find more result, even if minor
            const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:50000,${lat},${lng});
          way["amenity"="hospital"](around:50000,${lat},${lng});
          node["amenity"="clinic"](around:50000,${lat},${lng});
        );
        out center;
      `;

            const response = await axios.get('https://overpass-api.de/api/interpreter', {
                params: { data: query }
            });

            const elements = response.data.elements;

            const hospitals: Hospital[] = elements.map((el: any) => {
                const latitude = el.lat || el.center?.lat;
                const longitude = el.lon || el.center?.lon;

                // Extract tags
                const tags = el.tags || {};

                // Try to construct a better address
                let address = tags['addr:full'] || tags['addr:street']
                    ? [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ')
                    : null;

                if (!address) {
                    // Fallback to other meaningful tags if address is missing
                    const details = [tags['operator'], tags['network']].filter(Boolean).join(' • ');
                    address = details || "";
                }

                const dist = calculateDistance(lat, lng, latitude, longitude);

                return {
                    id: el.id,
                    name: tags.name || "Unnamed Facility",
                    lat: latitude,
                    lng: longitude,
                    distance: parseFloat(dist.toFixed(1)),
                    address: address, // Can be empty string, UI will handle
                    phone: tags['phone'] || tags['contact:phone'] || tags['mobile'],
                    website: tags['website'] || tags['contact:website'] || tags['url'],
                    emergency: tags['emergency'] === 'yes'
                };
            }).filter((h: Hospital) => h.lat && h.lng);

            // Sort by distance (closest first)
            return hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        } catch (error) {
            console.error("Error fetching hospitals:", error);
            return [];
        }
    }
};
