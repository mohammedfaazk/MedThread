'use client';
import { useState, useEffect } from 'react';

export default function TrendsMinimalPage() {
  const [message, setMessage] = useState('Page loaded, waiting for user action...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
  }, []);

  const testFetch = async () => {
    setMessage('Testing...');
    addLog('Starting API test');
    
    try {
      addLog('Making fetch request to test endpoint');
      const response = await fetch('http://127.0.0.1:3001/api/analytics/test');
      addLog(`Response received: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addLog(`Data parsed: ${JSON.stringify(data)}`);
      
      setMessage(`Success: ${data.message}`);
      addLog('Test completed successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown';
      addLog(`Error occurred: ${errorMsg}`);
      setMessage(`Error: ${errorMsg}`);
    }
  };

  const testHeatmap = async () => {
    setMessage('Testing heatmap...');
    addLog('Starting heatmap API test');
    
    try {
      addLog('Making fetch request to heatmap endpoint');
      const response = await fetch('http://127.0.0.1:3001/api/analytics/symptom-heatmap?region_type=state&days=30');
      addLog(`Response received: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      addLog(`Data parsed: ${data.success ? 'Success' : 'Failed'}, Records: ${data.data?.length || 0}`);
      
      setMessage(`Heatmap: ${data.data?.length || 0} records`);
      addLog('Heatmap test completed successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown';
      addLog(`Error occurred: ${errorMsg}`);
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Minimal Trends Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={testFetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Simple API
          </button>
          
          <button 
            onClick={testHeatmap}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Heatmap API
          </button>
          
          <button 
            onClick={() => {
              setMessage('JavaScript is working!');
              addLog('JavaScript test button clicked');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test JS
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-medium">Current Result:</p>
          <p>{message}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <p className="font-medium mb-2">Activity Log:</p>
          <div className="max-h-64 overflow-y-auto text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}