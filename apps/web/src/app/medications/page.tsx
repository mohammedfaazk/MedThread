'use client';

import { useState, useEffect } from 'react';
import MedicationList from '@/components/medication/MedicationList';
import MedicationForm from '@/components/medication/MedicationForm';
import { useJWTAuth } from '@/context/JWTAuthContext';
import PageLoader from '@/components/PageLoader';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export default function MedicationsPage() {
  const { user, loading: authLoading } = useJWTAuth();
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    // Only fetch data if user is authenticated and has an ID
    if (user?.id && !authLoading) {
      fetchMedications();
      fetchAdherence();
      fetchInteractions();
    } else if (!authLoading && !user) {
      // If not loading and no user, stop loading state
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/health-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch medications:', response.status, response.statusText);
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setMedications(result.data.currentMedications || []);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherence = async () => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/medications/adherence/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdherenceRate(data.adherenceRate || 0);
      }
    } catch (error) {
      console.error('Failed to fetch adherence:', error);
    }
  };

  const fetchInteractions = async () => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/medications/interactions/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInteractions(data.interactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch interactions:', error);
    }
  };

  const handleAddMedication = async (medicationData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Get current health profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/health-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileResult = await profileResponse.json();
      const currentProfile = profileResult.data || {};
      
      // Add new medication to the list
      const updatedMedications = [
        ...(currentProfile.currentMedications || []),
        medicationData
      ];
      
      // Update health profile with new medication
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/health-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentProfile,
          currentMedications: updatedMedications
        })
      });

      if (response.ok) {
        await fetchMedications();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to add medication:', error);
      throw error;
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Get current health profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/health-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profileResult = await profileResponse.json();
      const currentProfile = profileResult.data || {};
      
      // Remove medication from the list
      const updatedMedications = (currentProfile.currentMedications || []).filter(
        (med: any, index: number) => index.toString() !== medicationId
      );
      
      // Update health profile
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/health-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...currentProfile,
          currentMedications: updatedMedications
        })
      });

      if (response.ok) {
        await fetchMedications();
      }
    } catch (error) {
      console.error('Failed to delete medication:', error);
    }
  };

  const handleAddReminder = (medication: any) => {
    // Navigate to reminder setup
    window.location.href = `/medications/reminders?med=${medication.id}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to manage medications</p>
          <a href="/login" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <NavbarEnhanced />
      
      <div className="max-w-[1440px] mx-auto flex gap-0">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Tracker</h1>
                <p className="text-gray-600">Manage your medications and stay on track</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm text-gray-600 mb-1">Active Medications</div>
                  <div className="text-3xl font-bold text-orange-600">{medications.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm text-gray-600 mb-1">Adherence Rate</div>
                  <div className="text-3xl font-bold text-green-600">{Math.round(adherenceRate)}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm text-gray-600 mb-1">Interactions Found</div>
                  <div className="text-3xl font-bold text-red-600">{interactions.length}</div>
                </div>
              </div>

              {/* Interactions Warning */}
              {interactions.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Medication Interactions Detected</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {interactions.map((interaction: any, i: number) => (
                            <li key={i}>
                              {interaction.medication1} + {interaction.medication2}: {interaction.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-2 text-sm text-red-700">Please consult your doctor about these interactions.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Add Medication
                </button>
              </div>

              {/* Medication List */}
              <MedicationList
                medications={medications}
                onEdit={(med) => {
                  setEditingMed(med);
                  setShowForm(true);
                }}
                onDelete={handleDeleteMedication}
                onAddReminder={handleAddReminder}
              />

              {/* Form Modal */}
              {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {editingMed ? 'Edit Medication' : 'Add New Medication'}
                      </h2>
                      <MedicationForm
                        initialData={editingMed}
                        onSubmit={handleAddMedication}
                        onCancel={() => {
                          setShowForm(false);
                          setEditingMed(null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
