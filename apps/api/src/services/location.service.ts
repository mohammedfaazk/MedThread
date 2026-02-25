/**
 * Location Service
 * Handles geolocation, distance calculations, and spatial queries
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DistanceResult {
  km: number;
  formatted: string;
}

export class LocationService {
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  /**
   * Calculate distance with formatting
   */
  calculateDistanceFormatted(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): DistanceResult {
    const km = this.calculateDistance(lat1, lon1, lat2, lon2);
    return {
      km,
      formatted: this.formatDistance(km)
    };
  }

  /**
   * Batch calculate distances for multiple destinations
   */
  batchCalculateDistances(
    origin: Coordinates,
    destinations: Array<Coordinates & { id: string }>
  ): Array<{ id: string; distance: DistanceResult }> {
    return destinations.map(dest => ({
      id: dest.id,
      distance: this.calculateDistanceFormatted(
        origin.latitude,
        origin.longitude,
        dest.latitude,
        dest.longitude
      )
    }));
  }
}

export const locationService = new LocationService();
