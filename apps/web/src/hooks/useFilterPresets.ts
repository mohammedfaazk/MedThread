import { useState, useEffect } from 'react';

const FILTER_PRESETS_KEY = 'medthread_filter_presets';
const MAX_PRESETS = 10;

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    specialty?: string;
    authorType?: 'all' | 'doctor' | 'patient';
    postType?: '' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL';
    dateRange?: '' | 'today' | 'week' | 'month' | 'year';
  };
  sort?: 'hot' | 'new' | 'top' | 'rising';
  createdAt: number;
  usageCount: number;
}

// Default presets for medical platform
const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'doctor-opinions',
    name: '👨‍⚕️ Doctor Opinions',
    filters: {
      authorType: 'doctor',
      postType: 'TEXT',
      dateRange: 'week'
    },
    sort: 'top',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'patient-questions',
    name: '❓ Patient Questions',
    filters: {
      authorType: 'patient',
      postType: 'TEXT',
      dateRange: 'today'
    },
    sort: 'new',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'medical-images',
    name: '🖼️ Medical Images',
    filters: {
      postType: 'IMAGE',
      dateRange: 'week'
    },
    sort: 'top',
    createdAt: Date.now(),
    usageCount: 0
  },
  {
    id: 'trending-discussions',
    name: '🔥 Trending Now',
    filters: {
      dateRange: 'today'
    },
    sort: 'rising',
    createdAt: Date.now(),
    usageCount: 0
  }
];

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FILTER_PRESETS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPresets([...DEFAULT_PRESETS, ...parsed]);
      } catch (error) {
        console.error('Failed to parse filter presets:', error);
        setPresets(DEFAULT_PRESETS);
      }
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save a new preset
  const savePreset = (name: string, filters: FilterPreset['filters'], sort?: FilterPreset['sort']) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters,
      sort,
      createdAt: Date.now(),
      usageCount: 0
    };

    setPresets((prev) => {
      // Filter out default presets and add new one
      const customPresets = prev.filter(p => !p.id.startsWith('doctor-') && 
                                              !p.id.startsWith('patient-') && 
                                              !p.id.startsWith('medical-') && 
                                              !p.id.startsWith('trending-'));
      const updated = [...customPresets, newPreset].slice(-MAX_PRESETS);
      
      // Save only custom presets to localStorage
      localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updated));
      
      return [...DEFAULT_PRESETS, ...updated];
    });

    return newPreset;
  };

  // Delete a preset
  const deletePreset = (id: string) => {
    // Can't delete default presets
    if (id.startsWith('doctor-') || id.startsWith('patient-') || 
        id.startsWith('medical-') || id.startsWith('trending-')) {
      return;
    }

    setPresets((prev) => {
      const updated = prev.filter(p => p.id !== id);
      const customPresets = updated.filter(p => !p.id.startsWith('doctor-') && 
                                                 !p.id.startsWith('patient-') && 
                                                 !p.id.startsWith('medical-') && 
                                                 !p.id.startsWith('trending-'));
      
      localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(customPresets));
      return updated;
    });
  };

  // Update usage count
  const usePreset = (id: string) => {
    setPresets((prev) => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      );
      
      const customPresets = updated.filter(p => !p.id.startsWith('doctor-') && 
                                                 !p.id.startsWith('patient-') && 
                                                 !p.id.startsWith('medical-') && 
                                                 !p.id.startsWith('trending-'));
      
      localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(customPresets));
      return updated;
    });
  };

  // Get most used presets
  const getMostUsed = (limit = 5) => {
    return [...presets]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  };

  // Get default presets
  const getDefaultPresets = () => {
    return presets.filter(p => p.id.startsWith('doctor-') || 
                               p.id.startsWith('patient-') || 
                               p.id.startsWith('medical-') || 
                               p.id.startsWith('trending-'));
  };

  // Get custom presets
  const getCustomPresets = () => {
    return presets.filter(p => p.id.startsWith('custom-'));
  };

  return {
    presets,
    savePreset,
    deletePreset,
    usePreset,
    getMostUsed,
    getDefaultPresets,
    getCustomPresets
  };
}
