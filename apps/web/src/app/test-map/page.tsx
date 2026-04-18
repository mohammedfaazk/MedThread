'use client';

import { useEffect, useState } from 'react';

export default function TestMapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/trends/geographic-data?disease=tuberculosis')
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test - Tuberculosis Data</h1>
      
      {data && data.success ? (
        <div>
          <p className="text-green-600 font-semibold mb-4">
            ✅ API is working! Received {data.count} countries
          </p>
          
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-bold mb-2">Sample Data:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(data.data.slice(0, 3), null, 2)}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">Countries with data:</h3>
            <div className="grid grid-cols-3 gap-2">
              {data.data.map((country: any) => (
                <div key={country.country} className="text-sm">
                  {country.country} - <span className={`font-bold ${
                    country.riskLevel === 'critical' ? 'text-red-600' :
                    country.riskLevel === 'high' ? 'text-orange-600' :
                    country.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>{country.riskLevel}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <a 
              href="/trends" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Trends Page →
            </a>
          </div>
        </div>
      ) : (
        <div className="text-red-600">
          ❌ API Error: {JSON.stringify(data)}
        </div>
      )}
    </div>
  );
}
