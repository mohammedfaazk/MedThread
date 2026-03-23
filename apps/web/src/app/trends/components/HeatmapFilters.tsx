'use client';
import { SYMPTOM_DICTIONARY } from '@/lib/symptoms';

interface Props {
  filters:  any;
  onChange: (f: any) => void;
}

export default function HeatmapFilters({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <select
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700"
        value={filters.days || '30'}
        onChange={e => onChange({ ...filters, days: e.target.value })}
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 3 months</option>
      </select>

      <select
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700"
        value={filters.symptom || ''}
        onChange={e => onChange({ ...filters, symptom: e.target.value || undefined })}
      >
        <option value="">All symptoms</option>
        {Object.keys(SYMPTOM_DICTIONARY).map(s =>
          <option key={s} value={s}>{s}</option>
        )}
      </select>

      <select
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700"
        value={filters.colorScale || 'red'}
        onChange={e => onChange({ ...filters, colorScale: e.target.value })}
      >
        <option value="red">Red scale (severity)</option>
        <option value="green">Green scale (prevalence)</option>
      </select>
    </div>
  );
}