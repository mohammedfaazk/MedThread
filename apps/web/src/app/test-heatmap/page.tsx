'use client';
import { useState, useEffect } from 'react';
import SimpleHeatmap from '../trends/components/SimpleHeatmap';

// Mock data for testing
const MOCK_DATA = [
  { regionName: 'Tamil Nadu', symptomTag: 'Fever', caseCount: 12, severityAvg: 2.5, alertLevel: 'none' as const },
  { regionName: 'Tamil Nadu', symptomTag: 'Headache', caseCount: 8, severityAvg: 2.0, alertLevel: 'none' as const },
  { regionName: 'Delhi', symptomTag: 'Cough', caseCount: 7, severityAvg: 2.2, alertLevel: 'none' as const },
  { regionName: 'Karnataka', symptomTag: 'Cough', caseCount: 7, severityAvg: 2.1, alertLevel: 'none' as const },
  { regionName: '600026', symptomTag: 'Fever', caseCount: 5, severityAvg: 2.8, alertLevel: 'watch' as const },
  { regionName: '560001', symptomTag: 'Cough', caseCount: 7, severityAvg: 2.5, alertLevel: 'epidemic' as const },
  { regionName: '110001', symptomTag: 'Cough', caseCount: 7, severityAvg: 2.3, alertLevel: 'epidemic' as const },
  { regionName: 'Chennai', symptomTag: 'Headache', caseCount: 8, severityAvg: 2.4, alertLevel: 'watch' as const },
  { regionName: 'Mumbai', symptomTag: 'Cough', caseCount: 6, severityAvg: 2.1, alertLevel: 'none' as const },
];

export default function TestHeatmapPage() {
  const [regionType, setRegionType] = useState('state');
  const [colorScale, setColorScale] = useState<'red' | 'green'>('red');

  // Filter data based on region type
  const filteredData = MOCK_DATA.filter(item => {
    if (regionType === 'state') {
      return !item.regionName.match(/^\d+$/) && !['Chennai', 'Mumbai'].includes(item.regionName);
    } else if (regionType === 'pincode') {
      return item.regionName.match(/^\d+$/);
    } else if (regionType === 'city') {
      return ['Chennai', 'Mumbai'].includes(item.regionName);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Heatmap Test Page</h1>
      
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Region Type:</label>
          <select 
            value={regionType}
            onChange={(e) => setRegionType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="state">State</option>
            <option value="city">City</option>
            <option value="pincode">Pincode</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Color Scale:</label>
          <select 
            value={colorScale}
            onChange={(e) => setColorScale(e.target.value as 'red' | 'green')}
            className="px-3 py-2 border rounded"
          >
            <option value="red">Red (Alert)</option>
            <option value="green">Green (Safe)</option>
          </select>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="text-sm">
          <strong>Current Data:</strong> {filteredData.length} records for {regionType} level
        </p>
        <div className="mt-2 text-xs">
          {filteredData.map((item, i) => (
            <span key={i} className="mr-4">
              {item.regionName}: {item.caseCount} {item.symptomTag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Interactive Heatmap</h2>
        <SimpleHeatmap
          data={filteredData}
          regionType={regionType}
          colorScale={colorScale}
        />
      </div>
    </div>
  );
}