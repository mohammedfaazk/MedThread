'use client';
import { useState, useEffect } from 'react';

interface SymptomData {
  regionName: string;
  symptomTag: string;
  caseCount: number;
}

export default function TrendsSimplePage() {
  const [data, setData] = useState<SymptomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30');
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Symptom Trends</h1>
        <div className="bg-blue-50 p-4 rounded">
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Symptom Trends</h1>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Symptom Trends</h1>
      
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Data Summary</h2>
        <p className="mb-4">Found {data.length} symptom records</p>
        
        {data.length > 0 && (
          <div className="space-y-2">
            {data.slice(0, 10).map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{item.regionName}</div>
                <div className="text-sm text-gray-600">
                  {item.symptomTag}: {item.caseCount} cases
                </div>
              </div>
            ))}
            {data.length > 10 && (
              <p className="text-sm text-gray-500">...and {data.length - 10} more records</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}