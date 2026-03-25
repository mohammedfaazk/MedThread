'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Pill,
  AlertCircle,
  Plus,
  X,
  Save,
  User,
  Activity,
  Droplet,
  Stethoscope
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface HealthProfile {
  age?: number;
  biologicalSex?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  preExistingConditions?: string[];
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  allergies?: string[];
  surgicalHistory?: Array<{
    procedure: string;
    date: string;
    hospital: string;
  }>;
  familyHistory?: Array<{
    condition: string;
    relation: string;
  }>;
  lifestyle?: {
    smoking?: string;
    alcohol?: string;
    exercise?: string;
    diet?: string;
  };
}

export default function HealthProfilePage() {
  const { user, loading: authLoading } = useJWTAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<HealthProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Form states
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newAllergy, setNewAllergy] = useState('');
  const [newSurgery, setNewSurgery] = useState({ procedure: '', date: '', hospital: '' });
  const [newFamilyHistory, setNewFamilyHistory] = useState({ condition: '', relation: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchHealthProfile();
    }
  }, [user, authLoading, router]);

  const fetchHealthProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/health-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching health profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHealthProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/health-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const result = await response.json();
      if (result.success) {
        alert('Health profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('Failed to save health profile');
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile(prev => ({
        ...prev,
        preExistingConditions: [...(prev.preExistingConditions || []), newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      preExistingConditions: prev.preExistingConditions?.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setProfile(prev => ({
        ...prev,
        currentMedications: [...(prev.currentMedications || []), newMedication]
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      currentMedications: prev.currentMedications?.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index)
    }));
  };

  const addSurgery = () => {
    if (newSurgery.procedure.trim()) {
      setProfile(prev => ({
        ...prev,
        surgicalHistory: [...(prev.surgicalHistory || []), newSurgery]
      }));
      setNewSurgery({ procedure: '', date: '', hospital: '' });
    }
  };

  const removeSurgery = (index: number) => {
    setProfile(prev => ({
      ...prev,
      surgicalHistory: prev.surgicalHistory?.filter((_, i) => i !== index)
    }));
  };

  const addFamilyHistory = () => {
    if (newFamilyHistory.condition.trim()) {
      setProfile(prev => ({
        ...prev,
        familyHistory: [...(prev.familyHistory || []), newFamilyHistory]
      }));
      setNewFamilyHistory({ condition: '', relation: '' });
    }
  };

  const removeFamilyHistory = (index: number) => {
    setProfile(prev => ({
      ...prev,
      familyHistory: prev.familyHistory?.filter((_, i) => i !== index)
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Profile</h1>
          <p className="text-gray-600">
            Manage your medical history and health information
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic Info', icon: User },
              { id: 'conditions', label: 'Conditions', icon: Heart },
              { id: 'medications', label: 'Medications', icon: Pill },
              { id: 'allergies', label: 'Allergies', icon: AlertCircle },
              { id: 'surgeries', label: 'Surgeries', icon: Stethoscope },
              { id: 'family', label: 'Family History', icon: Activity },
              { id: 'lifestyle', label: 'Lifestyle', icon: Droplet }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biological Sex
                    </label>
                    <select
                      value={profile.biologicalSex || ''}
                      onChange={(e) => setProfile({ ...profile, biologicalSex: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={profile.bloodGroup || ''}
                      onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter height"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={profile.weight || ''}
                      onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter weight"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === 'conditions' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a pre-existing condition"
                  />
                  <button
                    onClick={addCondition}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {profile.preExistingConditions?.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <span className="text-gray-900">{condition}</span>
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                  {(!profile.preExistingConditions || profile.preExistingConditions.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No conditions added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Medication name"
                  />
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dosage"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Frequency"
                    />
                    <button
                      onClick={addMedication}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {profile.currentMedications?.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} • {med.frequency}</p>
                      </div>
                      <button
                        onClick={() => removeMedication(index)}
                        className="p-1 hover:bg-purple-100 rounded"
                      >
                        <X className="w-4 h-4 text-purple-600" />
                      </button>
                    </div>
                  ))}
                  {(!profile.currentMedications || profile.currentMedications.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No medications added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Allergies Tab */}
            {activeTab === 'allergies' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add an allergy"
                  />
                  <button
                    onClick={addAllergy}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {profile.allergies?.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <span className="text-gray-900">{allergy}</span>
                      <button
                        onClick={() => removeAllergy(index)}
                        className="p-1 hover:bg-yellow-100 rounded"
                      >
                        <X className="w-4 h-4 text-yellow-600" />
                      </button>
                    </div>
                  ))}
                  {(!profile.allergies || profile.allergies.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No allergies added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Surgeries Tab */}
            {activeTab === 'surgeries' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newSurgery.procedure}
                    onChange={(e) => setNewSurgery({ ...newSurgery, procedure: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Procedure"
                  />
                  <input
                    type="date"
                    value={newSurgery.date}
                    onChange={(e) => setNewSurgery({ ...newSurgery, date: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSurgery.hospital}
                      onChange={(e) => setNewSurgery({ ...newSurgery, hospital: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Hospital"
                    />
                    <button
                      onClick={addSurgery}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {profile.surgicalHistory?.map((surgery, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{surgery.procedure}</p>
                        <p className="text-sm text-gray-600">{surgery.date} • {surgery.hospital}</p>
                      </div>
                      <button
                        onClick={() => removeSurgery(index)}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  ))}
                  {(!profile.surgicalHistory || profile.surgicalHistory.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No surgeries added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Family History Tab */}
            {activeTab === 'family' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFamilyHistory.condition}
                    onChange={(e) => setNewFamilyHistory({ ...newFamilyHistory, condition: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Condition"
                  />
                  <input
                    type="text"
                    value={newFamilyHistory.relation}
                    onChange={(e) => setNewFamilyHistory({ ...newFamilyHistory, relation: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Relation (e.g., Father, Mother)"
                  />
                  <button
                    onClick={addFamilyHistory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {profile.familyHistory?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.condition}</p>
                        <p className="text-sm text-gray-600">{item.relation}</p>
                      </div>
                      <button
                        onClick={() => removeFamilyHistory(index)}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        <X className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  ))}
                  {(!profile.familyHistory || profile.familyHistory.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No family history added yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Lifestyle Tab */}
            {activeTab === 'lifestyle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoking Status
                  </label>
                  <select
                    value={profile.lifestyle?.smoking || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, smoking: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Never">Never</option>
                    <option value="Former">Former Smoker</option>
                    <option value="Current">Current Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcohol Consumption
                  </label>
                  <select
                    value={profile.lifestyle?.alcohol || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, alcohol: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Never">Never</option>
                    <option value="Occasional">Occasional</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Frequency
                  </label>
                  <select
                    value={profile.lifestyle?.exercise || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, exercise: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Sedentary">Sedentary</option>
                    <option value="Light">Light (1-2 days/week)</option>
                    <option value="Moderate">Moderate (3-4 days/week)</option>
                    <option value="Active">Active (5+ days/week)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    value={profile.lifestyle?.diet || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      lifestyle: { ...profile.lifestyle, diet: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Omnivore">Omnivore</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                    <option value="Keto">Keto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveHealthProfile}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Health Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
