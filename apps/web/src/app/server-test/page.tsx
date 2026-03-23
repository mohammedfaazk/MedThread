import { Suspense } from 'react';

async function getSymptomData() {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Server-side fetch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function ServerTestContent() {
  const data = await getSymptomData();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Server-Side API Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function ServerTestPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading server-side data...</div>}>
      <ServerTestContent />
    </Suspense>
  );
}