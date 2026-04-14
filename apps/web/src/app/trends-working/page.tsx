'use client';

import { useState, useEffect } from 'react';

export default function TrendsWorkingPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Global Health Trends (Simplified)</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700">Total Cases</h3>
            <p className="text-3xl font-bold text-blue-900">{stats.cases?.toLocaleString()}</p>
          </div>
          <div className="bg-orange-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-orange-700">Active Cases</h3>
            <p className="text-3xl font-bold text-orange-900">{stats.active?.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-green-700">Recovered</h3>
            <p className="text-3xl font-bold text-green-900">{stats.recovered?.toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="text-red-600">Failed to load data</p>
      )}

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:underline">← Back to Homepage</a>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a simplified version without the map. 
          The full trends page at /trends has technical issues being resolved.
        </p>
      </div>
    </div>
  );
}
