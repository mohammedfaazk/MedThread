import axios from 'axios';

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

class GeocodingService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * Convert address to coordinates using Google Maps Geocoding API
   * Falls back to OpenStreetMap Nominatim if Google Maps key not available
   */
  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      // Try Google Maps first if API key is available
      if (this.apiKey) {
        return await this.geocodeWithGoogle(address);
      }
      
      // Fallback to free OpenStreetMap Nominatim
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodeResult | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address,
        key: this.apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
    }

    return null;
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodeResult | null> {
    // OpenStreetMap Nominatim - free geocoding service
    const url = `https://nominatim.openstreetmap.org/search`;
    const response = await axios.get(url, {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'MedThread/1.0' // Required by Nominatim
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name
      };
    }

    return null;
  }

  /**
   * Reverse geocode: convert coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      if (this.apiKey) {
        return await this.reverseGeocodeWithGoogle(lat, lng);
      }
      
      return await this.reverseGeocodeWithNominatim(lat, lng);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  private async reverseGeocodeWithGoogle(lat: number, lng: number): Promise<string | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        latlng: `${lat},${lng}`,
        key: this.apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    return null;
  }

  private async reverseGeocodeWithNominatim(lat: number, lng: number): Promise<string | null> {
    const url = `https://nominatim.openstreetmap.org/reverse`;
    const response = await axios.get(url, {
      params: {
        lat,
        lon: lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'MedThread/1.0'
      }
    });

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }

    return null;
  }
}

export const geocodingService = new GeocodingService();
