'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Send, Trash2, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Broadcast {
  id: string;
  title: string;
  message: string;
  priority: string;
  type: string;
  targetAudience: string;
  targetRegion?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export default function EmergencyBroadcastAdmin() {
  const { user, role, loading: authLoading } = useJWTAuth();
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('MEDIUM');
  const [type, setType] = useState<'HEALTH_ALERT' | 'SYSTEM' | 'EMERGENCY'>('SYSTEM');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'PATIENTS' | 'DOCTORS'>('ALL');
  const [targetRegion, setTargetRegion] = useState('');
  const [expiresIn, setExpiresIn] = useState('24'); // hours

  useEffect(() => {
    if (!authLoading && (!user || role !== 'ADMIN')) {
      router.push('/');
    } else if (user && role === 'ADMIN') {
      fetchBroadcasts();
    }
  }, [user, role, authLoading, router]);

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/emergency-broadcast/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        setBroadcasts(result.data.broadcasts);
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!title || !message) {
      alert('Title and message are required');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));

      const response = await fetch(`${API_URL}/api/emergency-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          message,
          priority,
          type,
          targetAudience,
          targetRegion: targetRegion || undefined,
          expiresAt
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Broadcast sent successfully!');
        setTitle('');
        setMessage('');
        setPriority('MEDIUM');
        setType('SYSTEM');
        setTargetAudience('ALL');
        setTargetRegion('');
        fetchBroadcasts();
      } else {
        alert('Failed to send broadcast: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const deactivateBroadcast = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this broadcast?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/emergency-broadcast/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success) {
        alert('Broadcast deactivated');
        fetchBroadcasts();
      }
    } catch (error) {
      console.error('Error deactivating broadcast:', error);
      alert('Failed to deactivate broadcast');
    }
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
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Broadcast System</h1>
          <p className="text-gray-600">Send critical alerts to all users</p>
        </div>

        {/* Create Broadcast Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Broadcast</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Emergency Alert Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed message..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SYSTEM">System</option>
                  <option value="HEALTH_ALERT">Health Alert</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Users</option>
                  <option value="PATIENTS">Patients Only</option>
                  <option value="DOCTORS">Doctors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires In (hours)
                </label>
                <input
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="168"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Region (Optional)
              </label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Maharashtra, Delhi"
              />
            </div>

            <button
              onClick={sendBroadcast}
              disabled={sending}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Emergency Broadcast'}
            </button>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Broadcast History</h2>
          
          <div className="space-y-3">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className={`p-4 rounded-lg border-2 ${
                  broadcast.isActive
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{broadcast.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        broadcast.priority === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : broadcast.priority === 'HIGH'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {broadcast.priority}
                      </span>
                      {broadcast.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{broadcast.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Type: {broadcast.type}</span>
                      <span>Audience: {broadcast.targetAudience}</span>
                      {broadcast.targetRegion && <span>Region: {broadcast.targetRegion}</span>}
                      <span>Created: {new Date(broadcast.createdAt).toLocaleString()}</span>
                      {broadcast.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(broadcast.expiresAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {broadcast.isActive && (
                    <button
                      onClick={() => deactivateBroadcast(broadcast.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Deactivate"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {broadcasts.length === 0 && (
              <p className="text-gray-500 text-center py-8">No broadcasts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
