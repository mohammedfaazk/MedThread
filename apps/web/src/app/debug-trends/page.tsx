'use client';
import { useState, useEffect } from 'react';

export default function DebugTrendsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        addLog('Starting data fetch...');
        setLoading(true);
        setError('');

        const url = 'http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30';
        addLog(`Fetching from: ${url}`);

        const response = await fetch(url);
        addLog(`Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        addLog(`Data received: ${result.data?.length || 0} records`);

        setData(result.data || []);
        addLog('Data set successfully');

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        addLog(`Error: ${errorMsg}`);
        setError(errorMsg);
      } finally {
        setLoading(false);
        addLog('Fetch completed');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Trends Page</h1>
      
      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold">Loading Status</h3>
          <p className={loading ? 'text-blue-600' : 'text-green-600'}>
            {loading ? '🔄 Loading...' : '✅ Complete'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold">Error Status</h3>
          <p className={error ? 'text-red-600' : 'text-green-600'}>
            {error ? `❌ ${error}` : '✅ No errors'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold">Data Count</h3>
          <p className="text-lg font-bold">{data.length} records</p>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-gray-50 p-4 rounded border mb-6">
        <h3 className="font-semibold mb-2">Debug Logs</h3>
        <div className="max-h-40 overflow-y-auto text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 font-mono">{log}</div>
          ))}
        </div>
      </div>

      {/* Data Preview */}
      {data.length > 0 && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Data Preview (First 5 records)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Region</th>
                  <th className="p-2 text-left">Symptom</th>
                  <th className="p-2 text-right">Cases</th>
                  <th className="p-2 text-left">Alert</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{item.regionName}</td>
                    <td className="p-2">{item.symptomTag}</td>
                    <td className="p-2 text-right">{item.caseCount}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 text-xs rounded ${
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
        </div>
      )}

      {/* Test Buttons */}
      <div className="mt-6 flex gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
        
        <button 
          onClick={() => {
            setLogs([]);
            setData([]);
            setError('');
            setLoading(true);
            // Trigger useEffect again
            window.location.reload();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Clear & Retry
        </button>
      </div>
    </div>
  );
}