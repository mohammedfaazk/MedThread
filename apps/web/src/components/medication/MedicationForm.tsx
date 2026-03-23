'use client';

import { useState } from 'react';

interface MedicationFormProps {
  onSubmit: (medication: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export default function MedicationForm({ onSubmit, onCancel, initialData }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || 'ONCE_DAILY',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || '',
    prescribedBy: initialData?.prescribedBy || '',
    purpose: initialData?.purpose || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dosage) {
      setError('Please fill in required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medication Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="e.g., Aspirin"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dosage *
        </label>
        <input
          type="text"
          value={formData.dosage}
          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="e.g., 100mg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frequency *
        </label>
        <select
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="ONCE_DAILY">Once daily</option>
          <option value="TWICE_DAILY">Twice daily</option>
          <option value="THREE_TIMES_DAILY">3 times daily</option>
          <option value="FOUR_TIMES_DAILY">4 times daily</option>
          <option value="WEEKLY">Once weekly</option>
          <option value="AS_NEEDED">As needed</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prescribed By
        </label>
        <input
          type="text"
          value={formData.prescribedBy}
          onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Doctor's name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose / Notes
        </label>
        <textarea
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          rows={3}
          placeholder="What is this medication for?"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Add Medication'}
        </button>
      </div>
    </form>
  );
}
