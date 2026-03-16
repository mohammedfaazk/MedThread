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

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

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
  async findNearbyHospitals(lat: number, lng: number, radiusMeters = 10000): Promise<Hospital[]> {
    // Compact query with server-side timeout + smaller radius for speed
    const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});node["amenity"="clinic"](around:${radiusMeters},${lat},${lng}););out center;`;

    let response: any = null;
    for (const mirror of OVERPASS_MIRRORS) {
      try {
        response = await axios.get(mirror, {
          params: { data: query },
          timeout: 20000, // 20s client-side timeout per mirror
        });
        break; // success — stop trying mirrors
      } catch (err: any) {
        const status = err?.response?.status;
        // Only retry on gateway/timeout errors
        if (status === 504 || status === 502 || status === 429 || !status) continue;
        throw err;
      }
    }

    if (!response) {
      // All mirrors failed — try once more with a wider radius on the first mirror
      if (radiusMeters < 25000) {
        return this.findNearbyHospitals(lat, lng, 25000);
      }
      console.error('All Overpass mirrors failed');
      return [];
    }

    const elements = response.data.elements;

    const hospitals: Hospital[] = elements.map((el: any) => {
      const latitude = el.lat || el.center?.lat;
      const longitude = el.lon || el.center?.lon;
      const tags = el.tags || {};

      let address: string = tags['addr:full'] || (tags['addr:street']
        ? [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ')
        : '');

      if (!address) {
        address = [tags['operator'], tags['network']].filter(Boolean).join(' • ') || '';
      }

      const dist = calculateDistance(lat, lng, latitude, longitude);

      return {
        id: el.id,
        name: tags.name || 'Unnamed Facility',
        lat: latitude,
        lng: longitude,
        distance: parseFloat(dist.toFixed(1)),
        address,
        phone: tags['phone'] || tags['contact:phone'] || tags['mobile'],
        website: tags['website'] || tags['contact:website'] || tags['url'],
        emergency: tags['emergency'] === 'yes',
      };
    }).filter((h: Hospital) => h.lat && h.lng);

    // Sort by distance (closest first)
    return hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
};