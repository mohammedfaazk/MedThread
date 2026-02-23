'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { Bell, Mail, Smartphone, Clock, TrendingUp, Save, RotateCcw } from 'lucide-react';

interface NotificationPreferences {
  userId: string;
  inApp: Record<string, boolean>;
  email: Record<string, 'instant' | 'digest' | 'off'>;
  push: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  digestFrequency: 'daily' | 'weekly';
  upvoteThreshold?: number;
}

const NOTIFICATION_TYPES = [
  { value: 'REPLY', label: 'Replies', description: 'When someone replies to your post or comment' },
  { value: 'MENTION', label: 'Mentions', description: 'When someone mentions you with @username' },
  { value: 'AWARD', label: 'Awards', description: 'When someone gives you an award' },
  { value: 'FOLLOWER', label: 'New Followers', description: 'When someone follows you' },
  { value: 'APPOINTMENT_REQUEST', label: 'Appointment Requests', description: 'When someone requests an appointment' },
  { value: 'APPOINTMENT_UPDATE', label: 'Appointment Updates', description: 'When appointment status changes' },
  { value: 'VERIFICATION_STATUS', label: 'Verification Status', description: 'Updates about your verification status' },
  { value: 'COMMUNITY_INVITE', label: 'Community Invites', description: 'When invited to moderate a community' },
  { value: 'DIRECT_MESSAGE', label: 'Direct Messages', description: 'When you receive a direct message' },
  { value: 'SYSTEM_ANNOUNCEMENT', label: 'System Announcements', description: 'Important platform announcements' },
  { value: 'UPVOTE_MILESTONE', label: 'Upvote Milestones', description: 'When your post reaches upvote thresholds' },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useJWTAuth();
  const router = useRouter();

  // Fetch preferences
  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/preferences`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(preferences),
        }
      );

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (!preferences) return;

    const defaultPrefs: NotificationPreferences = {
      ...preferences,
      inApp: NOTIFICATION_TYPES.reduce((acc, type) => {
        acc[type.value] = true;
        return acc;
      }, {} as Record<string, boolean>),
      email: NOTIFICATION_TYPES.reduce((acc, type) => {
        acc[type.value] = type.value === 'SYSTEM_ANNOUNCEMENT' ? 'instant' : 'off';
        return acc;
      }, {} as Record<string, 'instant' | 'digest' | 'off'>),
      push: NOTIFICATION_TYPES.reduce((acc, type) => {
        acc[type.value] = false;
        return acc;
      }, {} as Record<string, boolean>),
      quietHoursStart: undefined,
      quietHoursEnd: undefined,
      digestFrequency: 'daily',
      upvoteThreshold: undefined,
    };

    setPreferences(defaultPrefs);
  };

  // Update preference
  const updatePreference = (
    channel: 'inApp' | 'email' | 'push',
    type: string,
    value: boolean | 'instant' | 'digest' | 'off'
  ) => {
    if (!preferences) return;

    setPreferences({
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [type]: value,
      },
    });
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!user || loading || !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
          <p className="text-gray-600">
            Customize how and when you receive notifications
          </p>
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-sm">
            ✓ Preferences saved successfully
          </div>
        )}

        {/* Notification Types Table */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-300/10 border-b border-neutral-400/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Notification Type
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    <Bell className="w-4 h-4 inline mr-1" />
                    In-App
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Push
                  </th>
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPES.map((type, index) => (
                  <tr
                    key={type.value}
                    className={`border-b border-neutral-400/10 last:border-b-0 ${
                      index % 2 === 0 ? 'bg-white/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.inApp[type.value] || false}
                        onChange={(e) =>
                          updatePreference('inApp', type.value, e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={preferences.email[type.value] || 'off'}
                        onChange={(e) =>
                          updatePreference('email', type.value, e.target.value as any)
                        }
                        className="px-3 py-1 text-xs border border-neutral-400/20 rounded-lg focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-100/50"
                      >
                        <option value="off">Off</option>
                        <option value="instant">Instant</option>
                        <option value="digest">Digest</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.push[type.value] || false}
                        onChange={(e) =>
                          updatePreference('push', type.value, e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Quiet Hours */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quiet Hours</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Suppress notifications during these hours
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quietHoursStart: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-100/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd || ''}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quietHoursEnd: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-100/50"
                />
              </div>
            </div>
          </div>

          {/* Digest Frequency */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Email Digest</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              How often to receive digest emails
            </p>
            <select
              value={preferences.digestFrequency}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  digestFrequency: e.target.value as 'daily' | 'weekly',
                })
              }
              className="w-full px-4 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-100/50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Upvote Threshold */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upvote Threshold</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Notify when post reaches this many upvotes
            </p>
            <input
              type="number"
              min="0"
              step="10"
              value={preferences.upvoteThreshold || ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  upvoteThreshold: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="e.g., 100"
              className="w-full px-4 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-100/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-400/20 rounded-xl text-sm font-medium text-gray-700 hover:bg-neutral-300/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
