'use client';

import { useState, useEffect } from 'react';
import { Calendar, Activity, Pill, Stethoscope, FileText, Plus, Filter } from 'lucide-react';

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  date: string;
  metadata?: any;
  appointment?: any;
  medication?: any;
  symptomEntry?: any;
}

interface TimelineDay {
  date: string;
  events: TimelineEvent[];
}

export default function HealthTimelinePage() {
  const [timeline, setTimeline] = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [filter]);

  const fetchTimeline = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.length > 0) {
        params.append('eventTypes', filter.join(','));
      }

      const response = await fetch(`/api/v1/health-timeline?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: 'appointment', label: 'Appointments', icon: Stethoscope, color: 'blue' },
    { value: 'medication', label: 'Medications', icon: Pill, color: 'green' },
    { value: 'symptom', label: 'Symptoms', icon: Activity, color: 'red' },
    { value: 'test', label: 'Tests', icon: FileText, color: 'purple' },
    { value: 'other', label: 'Other', icon: Calendar, color: 'gray' }
  ];

  const getEventIcon = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType || eventTypes[eventTypes.length - 1];
  };

  const toggleFilter = (type: string) => {
    setFilter(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your health timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Timeline</h1>
              <p className="text-gray-600 mt-1">Track your health journey over time</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Event
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(type => {
              const Icon = type.icon;
              const isActive = filter.length === 0 || filter.includes(type.value);
              
              return (
                <button
                  key={type.value}
                  onClick={() => toggleFilter(type.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? `bg-${type.color}-50 border-${type.color}-200 text-${type.color}-700`
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {timeline.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your health journey by adding events</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Event
              </button>
            </div>
          ) : (
            timeline.map(day => (
              <div key={day.date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 bg-gray-50 py-2 z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                </div>

                {/* Events */}
                <div className="ml-8 space-y-4 mt-4">
                  {day.events.map(event => {
                    const eventType = getEventIcon(event.eventType);
                    const Icon = eventType.icon;
                    
                    return (
                      <div
                        key={event.id}
                        className="relative bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute -left-8 top-6 w-4 h-4 rounded-full bg-${eventType.color}-500 border-4 border-gray-50`}></div>
                        
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-${eventType.color}-100 rounded-lg`}>
                            <Icon className={`h-5 w-5 text-${eventType.color}-600`} />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            {event.description && (
                              <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                            )}
                            
                            {event.appointment && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Doctor: {event.appointment.doctor.name}</p>
                                <p>Specialization: {event.appointment.doctor.specialization}</p>
                              </div>
                            )}
                            
                            {event.medication && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Dosage: {event.medication.dosage}</p>
                                <p>Frequency: {event.medication.frequency}</p>
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-500">
                              {new Date(event.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
