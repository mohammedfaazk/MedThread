'use client';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-600">✅ Test Page Works!</h1>
      <p className="mt-4">If you can see this, the dev server is working.</p>
      <p className="mt-2">The issue is specific to the /trends page.</p>
      <a href="/" className="text-blue-600 hover:underline mt-4 block">
        ← Back to Homepage
      </a>
    </div>
  );
}
