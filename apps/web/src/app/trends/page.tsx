'use client';
import { useState, useEffect } from 'react';
import HybridMap from './components/HybridMap';

interface HeatmapRow {
  regionName: string;
  symptomTag: string;
  caseCount: number;
  severityAvg: number;
  alertLevel: 'none' | 'watch' | 'epidemic' | 'outbreak';
}

export default function TrendsPage() {
  const [regionType, setRegionType] = useState('state');
  const [activeSymptom, setActiveSymptom] = useState('');
  const [data, setData] = useState<HeatmapRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.set('region_type', regionType);
      params.set('days', '30');
      if (activeSymptom) params.set('symptom', activeSymptom);
      
      const url = `http://localhost:3001/api/analytics/symptom-heatmap?${params}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionType, activeSymptom]);

  const symptoms = Array.from(new Set(data.map(d => d.symptomTag))).sort();

  // Process data for display
  const regionData: Record<string, { total: number; symptoms: string[] }> = {};
  
  data.forEach(item => {
    if (!regionData[item.regionName]) {
      regionData[item.regionName] = { total: 0, symptoms: [] };
    }
    regionData[item.regionName].total += item.caseCount;
    if (!regionData[item.regionName].symptoms.includes(item.symptomTag)) {
      regionData[item.regionName].symptoms.push(item.symptomTag);
    }
  });

  const sortedRegions = Object.entries(regionData)
    .filter(([_, info]) => info.total > 0)
    .sort(([,a], [,b]) => b.total - a.total);

  const getColorClass = (count: number) => {
    if (count <= 2) return 'bg-green-100 border-green-300 text-green-800';
    if (count <= 5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (count <= 10) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Symptom Heatmap</h1>
        <p className="text-gray-600 mt-2">Symptom tracking by region</p>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View by:</label>
            <select 
              value={regionType}
              onChange={(e) => setRegionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="country">Country</option>
              <option value="state">State</option>
              <option value="district">District</option>
              <option value="city">City</option>
              <option value="pincode">Pincode</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Symptom:</label>
            <select 
              value={activeSymptom}
              onChange={(e) => setActiveSymptom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Symptoms</option>
              {symptoms.map(symptom => (
                <option key={symptom} value={symptom}>{symptom}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={fetchData}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">Loading symptom data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
              <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Cases</h3>
              <p className="text-2xl font-bold text-gray-900">
                {data.reduce((sum, item) => sum + item.caseCount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-500">Outbreaks</h3>
              <p className="text-2xl font-bold text-red-600">
                {data.filter(d => d.alertLevel === 'outbreak').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-medium text-gray-500">Regions</h3>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(data.map(d => d.regionName)).size}
              </p>
            </div>
          </div>

          {/* Interactive Heatmap */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <HybridMap data={data} regionType={regionType} />
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Cases by {regionType}</h2>
            
            {sortedRegions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRegions.map(([regionName, info]) => (
                  <div 
                    key={regionName}
                    className={`p-4 rounded-lg border-2 ${getColorClass(info.total)}`}
                  >
                    <h4 className="font-semibold mb-2">{regionName}</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Cases:</span> {info.total}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Symptoms:</span>
                      </p>
                      <div className="text-xs">
                        {info.symptoms.slice(0, 3).map(symptom => (
                          <span key={symptom} className="inline-block bg-white bg-opacity-50 rounded px-2 py-1 mr-1 mb-1">
                            {symptom}
                          </span>
                        ))}
                        {info.symptoms.length > 3 && (
                          <span className="text-xs opacity-75">+{info.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg">No symptom data available</p>
                <p className="text-sm">Try selecting a different region type or refresh the data</p>
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">Detailed Data ({regionType} level)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symptom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cases</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.slice(0, 20).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.symptomTag}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.regionName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.caseCount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.alertLevel === 'outbreak' ? 'bg-red-100 text-red-800' :
                            item.alertLevel === 'epidemic' ? 'bg-orange-100 text-orange-800' :
                            item.alertLevel === 'watch' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.alertLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 20 && (
                <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
                  Showing first 20 of {data.length} records
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}