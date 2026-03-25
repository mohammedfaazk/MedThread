'use client';

import { useState } from 'react';
import axios from 'axios';

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState('');

  const createFullBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/v1/backup/full');
      setMessage(`Backup created: ${res.data.backupId}`);
      loadStatus();
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const res = await axios.get('/api/v1/backup/status');
      setStatus(res.data);
    } catch (error) {
      console.error('Failed to load status');
    }
  };

  const cleanupOld = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/backup/cleanup');
      setMessage(`Cleaned up ${res.data.deletedCount} old backups`);
      loadStatus();
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Database Backup</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={createFullBackup}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Full Backup'}
            </button>
            <button
              onClick={loadStatus}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Refresh Status
            </button>
            <button
              onClick={cleanupOld}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Cleanup Old Backups
            </button>
          </div>
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              {message}
            </div>
          )}
        </div>

        {status && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Backup Status</h2>
            <div className="space-y-2">
              <p><strong>Last Backup:</strong> {status.lastBackup ? new Date(status.lastBackup.createdAt).toLocaleString() : 'Never'}</p>
              <p><strong>Total Backups:</strong> {status.totalBackups}</p>
              <p><strong>Total Size:</strong> {(status.totalSize / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Oldest Backup:</strong> {status.oldestBackup ? new Date(status.oldestBackup.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
