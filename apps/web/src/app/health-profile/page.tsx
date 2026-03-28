'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';
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
  ageGroup?: string;
  biologicalSex?: string;
  nationality?: string;
  weightRange?: string;
  heightRange?: string;
  activityLevel?: string;
  medicalConditions?: string[];
  currentMedications?: string;
  foodAllergies?: string[];
  riskLevel?: string;
  dietType?: string;
  religiousRestrictions?: string;
  foodsToAvoid?: string;
  cookingAccess?: string;
  primaryGoal?: string;
  sleepHours?: string;
  waterIntake?: string;
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
  const [newAllergy, setNewAllergy] = useState('');

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
      const response = await fetch(`${API_URL}/api/v1/health-profile`, {
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
      const response = await fetch(`${API_URL}/api/v1/health-profile`, {
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
        medicalConditions: [...(prev.medicalConditions || []), newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions?.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        foodAllergies: [...(prev.foodAllergies || []), newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setProfile(prev => ({
      ...prev,
      foodAllergies: prev.foodAllergies?.filter((_, i) => i !== index)
    }));
  };

  if (authLoading || loading) {
    return <PageLoader message="Loading health profile..." />;
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
              { id: 'medical', label: 'Medical', icon: Heart },
              { id: 'dietary', label: 'Dietary', icon: Pill },
              { id: 'goals', label: 'Goals & Lifestyle', icon: Activity }
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
                      Age Group
                    </label>
                    <select
                      value={profile.ageGroup || ''}
                      onChange={(e) => setProfile({ ...profile, ageGroup: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36-45">36-45</option>
                      <option value="46-60">46-60</option>
                      <option value="60+">60+</option>
                    </select>
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
                      Nationality
                    </label>
                    <select
                      value={profile.nationality || ''}
                      onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Indian">Indian</option>
                      <option value="Middle Eastern">Middle Eastern</option>
                      <option value="East Asian">East Asian</option>
                      <option value="Western">Western</option>
                      <option value="African">African</option>
                      <option value="Latin American">Latin American</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height Range
                    </label>
                    <select
                      value={profile.heightRange || ''}
                      onChange={(e) => setProfile({ ...profile, heightRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Under 150cm">Under 150cm</option>
                      <option value="150-165cm">150-165cm</option>
                      <option value="165-180cm">165-180cm</option>
                      <option value="180cm+">180cm+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight Range
                    </label>
                    <select
                      value={profile.weightRange || ''}
                      onChange={(e) => setProfile({ ...profile, weightRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Under 50kg">Under 50kg</option>
                      <option value="50-70kg">50-70kg</option>
                      <option value="70-90kg">70-90kg</option>
                      <option value="90-110kg">90-110kg</option>
                      <option value="110kg+">110kg+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Level
                    </label>
                    <select
                      value={profile.activityLevel || ''}
                      onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Sedentary">Sedentary</option>
                      <option value="Lightly Active">Lightly Active</option>
                      <option value="Moderately Active">Moderately Active</option>
                      <option value="Very Active">Very Active</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                {/* Medical Conditions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Medical Conditions</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a medical condition"
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
                    {profile.medicalConditions?.map((condition, index) => (
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
                    {(!profile.medicalConditions || profile.medicalConditions.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No conditions added yet</p>
                    )}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
                  <textarea
                    value={profile.currentMedications || ''}
                    onChange={(e) => setProfile({ ...profile, currentMedications: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="List your current medications (e.g., Aspirin 100mg daily, Metformin 500mg twice daily)"
                  />
                </div>

                {/* Food Allergies */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Food Allergies</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a food allergy"
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
                    {profile.foodAllergies?.map((allergy, index) => (
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
                    {(!profile.foodAllergies || profile.foodAllergies.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No allergies added yet</p>
                    )}
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Health Risk Level
                  </label>
                  <select
                    value={profile.riskLevel || ''}
                    onChange={(e) => setProfile({ ...profile, riskLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="NONE">None</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dietary Tab */}
            {activeTab === 'dietary' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    value={profile.dietType || ''}
                    onChange={(e) => setProfile({ ...profile, dietType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Pescatarian">Pescatarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Religious Restrictions
                  </label>
                  <select
                    value={profile.religiousRestrictions || ''}
                    onChange={(e) => setProfile({ ...profile, religiousRestrictions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                    <option value="Hindu Vegetarian">Hindu Vegetarian</option>
                    <option value="No restrictions">No restrictions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foods to Avoid
                  </label>
                  <textarea
                    value={profile.foodsToAvoid || ''}
                    onChange={(e) => setProfile({ ...profile, foodsToAvoid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="List any foods you want to avoid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooking Access
                  </label>
                  <select
                    value={profile.cookingAccess || ''}
                    onChange={(e) => setProfile({ ...profile, cookingAccess: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Full kitchen">Full kitchen</option>
                    <option value="Basic cooking">Basic cooking</option>
                    <option value="No cooking">No cooking</option>
                  </select>
                </div>
              </div>
            )}

            {/* Goals & Lifestyle Tab */}
            {activeTab === 'goals' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Health Goal
                  </label>
                  <select
                    value={profile.primaryGoal || ''}
                    onChange={(e) => setProfile({ ...profile, primaryGoal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Weight loss">Weight loss</option>
                    <option value="Weight gain">Weight gain</option>
                    <option value="Maintain weight">Maintain weight</option>
                    <option value="Manage medical condition">Manage medical condition</option>
                    <option value="General wellness">General wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Hours
                  </label>
                  <select
                    value={profile.sleepHours || ''}
                    onChange={(e) => setProfile({ ...profile, sleepHours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Less than 5">Less than 5 hours</option>
                    <option value="5-7">5-7 hours</option>
                    <option value="7-9">7-9 hours</option>
                    <option value="More than 9">More than 9 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Water Intake
                  </label>
                  <select
                    value={profile.waterIntake || ''}
                    onChange={(e) => setProfile({ ...profile, waterIntake: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Less than 1L">Less than 1L</option>
                    <option value="1-2L">1-2L</option>
                    <option value="2-3L">2-3L</option>
                    <option value="More than 3L">More than 3L</option>
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
