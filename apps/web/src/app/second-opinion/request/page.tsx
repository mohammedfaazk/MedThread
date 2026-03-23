'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle } from 'lucide-react';

export default function RequestSecondOpinionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    condition: '',
    diagnosis: '',
    treatmentPlan: '',
    symptoms: '',
    urgency: 'NORMAL',
    budget: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Convert files to base64
      const medicalRecords = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            filename: file.name,
            data: base64,
            type: file.type
          };
        })
      );

      const response = await fetch(`${API_URL}/api/v1/second-opinion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          symptoms: formData.symptoms.split(',').map(s => s.trim()),
          treatmentPlan: JSON.parse(formData.treatmentPlan || '{}'),
          medicalRecords,
          budget: formData.budget ? parseFloat(formData.budget) : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      const data = await response.json();
      router.push(`/second-opinion/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request Second Opinion</h1>
          <p className="mt-2 text-gray-600">
            Get expert opinions from multiple verified doctors
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition / Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Type 2 Diabetes"
            />
          </div>

          {/* Original Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe the original diagnosis..."
            />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Treatment Plan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe the recommended treatment plan..."
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Symptoms <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., fatigue, increased thirst, frequent urination"
            />
            <p className="mt-1 text-sm text-gray-500">Separate multiple symptoms with commas</p>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="LOW">Low - Can wait</option>
              <option value="NORMAL">Normal - Within a week</option>
              <option value="URGENT">Urgent - Need response ASAP</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (Optional)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your budget in USD"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Records (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium"
              >
                Click to upload
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PDF, JPG, PNG, DOC up to 10MB each
              </p>
              {files.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {files.map((file, index) => (
                      <li key={index}>• {file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
