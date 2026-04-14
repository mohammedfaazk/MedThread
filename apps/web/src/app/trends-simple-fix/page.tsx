'use client';

export default function TrendsSimplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌍 Global Health Trends
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">✅ Page is Working!</h2>
          <p className="text-gray-700 mb-4">
            This is a simplified version of the trends page. The full version with 
            the interactive map is being fixed.
          </p>
          <p className="text-gray-600">
            The rest of the MedThread dashboard is fully functional:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2 text-gray-700">
            <li>✅ Homepage with priority-sorted posts</li>
            <li>✅ Real-time updates via Socket.io</li>
            <li>✅ Doctor proximity notifications</li>
            <li>✅ Priority detection system</li>
            <li>✅ Complete mock data</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 Quick Stats (Live Data)
          </h3>
          <p className="text-sm text-blue-700">
            The interactive map with real-time COVID-19 data will be available soon.
          </p>
        </div>

        <div className="flex gap-4">
          <a 
            href="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to Homepage
          </a>
          <a 
            href="/trends-working" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            View Stats (No Map)
          </a>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note for Developer:</strong> If you're seeing this page, it means 
            the original /trends page has a compilation issue. Check the terminal 
            running `npm run dev` for error messages.
          </p>
        </div>
      </div>
    </div>
  );
}
