import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface HeatmapRow {
  regionName:  string;
  symptomTag:  string;
  caseCount:   number;
  severityAvg: number;
  alertLevel:  'none' | 'watch' | 'epidemic' | 'outbreak';
}

interface Filters {
  regionType?: string;
  symptom?:    string;
  days?:       string;
  state?:      string;
}

export function useSymptomHeatmap(filters: Filters = {}) {
  return useQuery<HeatmapRow[]>({
    queryKey: ['symptom-heatmap', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.regionType) params.set('region_type', filters.regionType);
      if (filters.symptom)    params.set('symptom',     filters.symptom);
      if (filters.days)       params.set('days',        filters.days);
      if (filters.state)      params.set('state',       filters.state);
      
      const url = `${API_BASE_URL}/api/analytics/symptom-heatmap?${params}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTrendsSeries(regionName?: string, days = 30) {
  return useQuery({
    queryKey: ['trends-series', regionName, days],
    queryFn: async () => {
      const params = new URLSearchParams({ days: String(days) });
      if (regionName) params.set('region_name', regionName);
      const { data } = await axios.get(`${API_BASE_URL}/api/analytics/trends-series?${params}`);
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}