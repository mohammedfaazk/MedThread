'use client';

import { useState, useEffect } from 'react';
import { Plus, Pill, Clock, CheckCircle, X, Calendar, Trash2 } from 'lucide-react';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import { useJWTAuth } from '@/context/JWTAuthContext';
import IridescenceLayout from '@/components/IridescenceLayout';
import SpotlightCard from '@/components/enhancements/SpotlightCard';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'four_times';
  times: string[];
  instructions: string;
  ongoing: boolean;
  startDate: string;
  endDate?: string;
  remindersEnabled: boolean;
}

interface DoseSchedule {
  medication: Medication;
  time: string;
  taken: boolean;
  takenAt?: string;
}

export default function MedicationManager() {
  const { user } = useJWTAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<DoseSchedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'twice' as 'once' | 'twice' | 'thrice' | 'four_times',
    instructions: '',
    ongoing: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  // Load medications from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`medications_${user.id}`);
      if (stored) {
        const meds = JSON.parse(stored);
        setMedications(meds);
        generateTodaySchedule(meds);
      }
    }
  }, [user]);

  // Generate today's schedule
  const generateTodaySchedule = (meds: Medication[]) => {
    const today = new Date().toISOString().split('T')[0];
    const schedule: DoseSchedule[] = [];

    meds.forEach(med => {
      // Check if medication is active today
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      const todayDate = new Date(today);

      if (todayDate >= startDate && (!endDate || todayDate <= endDate)) {
        med.times.forEach(time => {
          const takenKey = `taken_${user?.id}_${med.id}_${today}_${time}`;
          const takenData = localStorage.getItem(takenKey);
          
          schedule.push({
            medication: med,
            time,
            taken: !!takenData,
            takenAt: takenData || undefined,
          });
        });
      }
    });

    // Sort by time
    schedule.sort((a, b) => a.time.localeCompare(b.time));
    setTodaySchedule(schedule);
  };

  // Calculate statistics
  const stats = {
    todaySchedule: todaySchedule.length,
    takenToday: todaySchedule.filter(s => s.taken).length,
    overallAdherence: todaySchedule.length > 0 
      ? Math.round((todaySchedule.filter(s => s.taken).length / todaySchedule.length) * 100)
      : 0,
  };

  const handleAddMedication = () => {
    if (!formData.name || !formData.dosage || !user) return;

    const times = 
      formData.frequency === 'once' ? ['09:00'] :
      formData.frequency === 'twice' ? ['09:00', '21:00'] :
      formData.frequency === 'thrice' ? ['09:00', '14:00', '21:00'] :
      ['08:00', '12:00', '16:00', '20:00'];

    const newMed: Medication = {
      id: Date.now().toString(),
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times,
      instructions: formData.instructions,
      ongoing: formData.ongoing,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      remindersEnabled: true,
    };

    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    localStorage.setItem(`medications_${user.id}`, JSON.stringify(updatedMeds));
    generateTodaySchedule(updatedMeds);

    setShowAddForm(false);
    setFormData({
      name: '',
      dosage: '',
      frequency: 'twice',
      instructions: '',
      ongoing: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  const handleMarkTaken = (medId: string, time: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const takenKey = `taken_${user.id}_${medId}_${today}_${time}`;
    const now = new Date().toISOString();
    
    localStorage.setItem(takenKey, now);
    generateTodaySchedule(medications);
  };

  const handleDeleteMedication = (medId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this medication?')) return;

    const updatedMeds = medications.filter(m => m.id !== medId);
    setMedications(updatedMeds);
    localStorage.setItem(`medications_${user.id}`, JSON.stringify(updatedMeds));
    generateTodaySchedule(updatedMeds);
  };

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header with Stats */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Medication Manager</h1>
              <p className="text-gray-600">Track your medications and stay on schedule</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.todaySchedule}</div>
                <div className="text-sm text-gray-600">Today's Doses</div>
              </SpotlightCard>
              <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.takenToday}</div>
                <div className="text-sm text-gray-600">Taken Today</div>
              </SpotlightCard>
              <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-1">{stats.overallAdherence}%</div>
                <div className="text-sm text-gray-600">Adherence Rate</div>
              </SpotlightCard>
            </div>

            {/* Today's Schedule */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h2>
              {todaySchedule.length === 0 ? (
                <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No medications scheduled for today</p>
                </SpotlightCard>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => (
                    <SpotlightCard
                      key={index}
                      className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-4 flex items-center gap-4 transition-all ${
                        item.taken ? 'opacity-60' : ''
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          item.taken ? 'bg-green-100' : 'bg-blue-100'
                        }`}
                      >
                        {item.taken ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.medication.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.medication.dosage} • {item.time}
                        </div>
                      </div>
                      {!item.taken && (
                        <button
                          onClick={() => handleMarkTaken(item.medication.id, item.time)}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition shadow-lg"
                        >
                          Mark Taken
                        </button>
                      )}
                      {item.taken && item.takenAt && (
                        <div className="text-xs text-gray-500">
                          Taken at {new Date(item.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </SpotlightCard>
                  ))}
                </div>
              )}
            </div>

            {/* Active Medications */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Active Medications</h2>
              {medications.length === 0 ? (
                <SpotlightCard className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8 text-center">
                  <Pill className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No active medications</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg"
                  >
                    Add First Medication
                  </button>
                </SpotlightCard>
              ) : (
                <>
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <SpotlightCard
                        key={med.id}
                        className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-lg text-gray-800">{med.name}</div>
                            <div className="text-sm text-gray-600">{med.dosage}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 capitalize bg-blue-100 px-3 py-1 rounded-full">
                              {med.frequency === 'once' ? 'Once' :
                               med.frequency === 'twice' ? 'Twice' :
                               med.frequency === 'thrice' ? '3 times' :
                               '4 times'} daily
                            </div>
                            <button
                              onClick={() => handleDeleteMedication(med.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete medication"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Times: {med.times.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {med.ongoing
                              ? 'Ongoing'
                              : `Until ${new Date(med.endDate!).toLocaleDateString()}`}
                          </span>
                        </div>
                        
                        {med.instructions && (
                          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <span className="font-medium">Instructions: </span>
                            {med.instructions}
                          </div>
                        )}
                      </SpotlightCard>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full mt-4 h-14 bg-white/40 backdrop-blur-xl border-2 border-dashed border-blue-500 text-blue-600 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-white/60 transition"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Medication</span>
                  </button>
                </>
              )}
            </div>

            {/* Add Medication Modal */}
            {showAddForm && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddForm(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Add Medication</h2>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medication Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Paracetamol"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={formData.dosage}
                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: e.target.value as any })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="once">Once daily (9:00 AM)</option>
                        <option value="twice">Twice daily (9:00 AM, 9:00 PM)</option>
                        <option value="thrice">Three times daily (9:00 AM, 2:00 PM, 9:00 PM)</option>
                        <option value="four_times">Four times daily (8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) =>
                          setFormData({ ...formData, instructions: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Take after meals"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="ongoing"
                        checked={formData.ongoing}
                        onChange={(e) =>
                          setFormData({ ...formData, ongoing: e.target.checked })
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="ongoing" className="text-sm text-gray-700">
                        Ongoing medication (no end date)
                      </label>
                    </div>

                    {!formData.ongoing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                          }
                          min={formData.startDate}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMedication}
                        disabled={!formData.name || !formData.dosage}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        Add Medication
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </IridescenceLayout>
  );
}
