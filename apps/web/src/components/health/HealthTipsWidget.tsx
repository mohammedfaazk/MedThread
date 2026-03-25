'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, X, ChevronRight, Pill, Heart } from 'lucide-react';
import { useJWTAuth } from '@/context/JWTAuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MedicationReminder {
  id: string;
  medication: string;
  dosage: string;
  time: string;
  reminder: string;
  icon: string;
}

export function HealthTipsWidget() {
  const { user } = useJWTAuth();
  const [dailyTip, setDailyTip] = useState<HealthTip | null>(null);
  const [medicationReminders, setMedicationReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWidget, setShowWidget] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDailyTip();
      fetchMedicationReminders();
    }
  }, [user]);

  const fetchDailyTip = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/health-tips/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.success) {
        setDailyTip(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily tip:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicationReminders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/health-tips/medication-reminders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.success) {
        setMedicationReminders(result.data);
      }
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-red-300 bg-red-50';
      case 'MEDIUM': return 'border-yellow-300 bg-yellow-50';
      case 'LOW': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (!showWidget || !user) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily Health Tip */}
      {dailyTip && (
        <div className={`rounded-xl border-2 p-4 shadow-sm relative ${getPriorityColor(dailyTip.priority)}`}>
          <button
            onClick={() => setShowWidget(false)}
            className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-lg transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <div className="flex items-start gap-3">
            <div className="text-3xl">{dailyTip.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <h3 className="font-bold text-gray-900">{dailyTip.title}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{dailyTip.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {dailyTip.category}
                </span>
                <button
                  onClick={fetchDailyTip}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  New Tip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medication Reminders */}
      {medicationReminders.length > 0 && (
        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">Medication Reminders</h3>
          </div>
          <div className="space-y-2">
            {medicationReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{reminder.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{reminder.medication}</p>
                    <p className="text-xs text-gray-600">{reminder.dosage} • {reminder.time}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Health Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900">Today's Health Goals</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-2xl mb-1">💧</div>
            <p className="text-xs text-gray-600">Water</p>
            <p className="text-sm font-bold text-blue-600">6/8</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-2xl mb-1">🏃</div>
            <p className="text-xs text-gray-600">Steps</p>
            <p className="text-sm font-bold text-green-600">5.2k</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg">
            <div className="text-2xl mb-1">😴</div>
            <p className="text-xs text-gray-600">Sleep</p>
            <p className="text-sm font-bold text-purple-600">7h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
