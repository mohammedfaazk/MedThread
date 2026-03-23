'use client';
import { useState, useEffect } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('Loading...');

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API...');
        const response = await fetch('http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        setResult(`Success: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        console.error('API Error:', error);
        setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  );
}