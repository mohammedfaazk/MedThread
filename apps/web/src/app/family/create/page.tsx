'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';

export default function CreateFamilyGroupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [members, setMembers] = useState<Array<{ name: string; relation: string; email: string }>>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{ name: string; phone: string; relation: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMember = () => {
    setMembers([...members, { name: '', relation: '', email: '' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relation: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/v1/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          members: members.filter(m => m.name && m.relation),
          emergencyContacts: emergencyContacts.filter(c => c.name && c.phone)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create family group');
      }

      const data = await response.json();
      router.push(`/family/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create family group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Family Group</h1>
          <p className="mt-2 text-gray-600">
            Manage your family's health together in one place
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group Name */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g., Smith Family"
              />
            </div>
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Family Members</h2>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Plus className="h-5 w-5" />
                Add Member
              </button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={member.relation}
                      onChange={(e) => updateMember(index, 'relation', e.target.value)}
                      placeholder="Relation (e.g., Spouse, Child)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      placeholder="Email (optional)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {members.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No members added yet. Click "Add Member" to get started.
                </p>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
              <button
                type="button"
                onClick={addEmergencyContact}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Plus className="h-5 w-5" />
                Add Contact
              </button>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                      placeholder="Phone"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={contact.relation}
                      onChange={(e) => updateEmergencyContact(index, 'relation', e.target.value)}
                      placeholder="Relation"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEmergencyContact(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}

              {emergencyContacts.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No emergency contacts added yet. Click "Add Contact" to get started.
                </p>
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
              disabled={loading || !formData.name}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Family Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
