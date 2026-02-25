'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  frequency: string;
}

interface JobExecution {
  id: number;
  job_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  records_processed: number;
  records_failed: number;
  error_message?: string;
}

export default function CronJobsDashboard() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/cron-jobs');
      setJobs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load cron jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load cron jobs' });
    } finally {
      setLoading(false);
    }
  };

  const triggerJob = async (jobName: string) => {
    try {
      setTriggering(jobName);
      setMessage(null);
      
      const response = await adminApi.post(`/cron-jobs/${jobName}/trigger`);
      
      setMessage({ 
        type: 'success', 
        text: `Job ${jobName} executed successfully in ${response.data.duration}` 
      });
      
      // Reload jobs after trigger
      await loadJobs();
    } catch (error: any) {
      console.error('Failed to trigger job:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to trigger job' 
      });
    } finally {
      setTriggering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (jobName: string) => {
    if (jobName.includes('email') || jobName.includes('Digest')) return '📧';
    if (jobName.includes('cleanup') || jobName.includes('Clean')) return '🧹';
    if (jobName.includes('badge') || jobName.includes('Badge')) return '🏅';
    if (jobName.includes('leaderboard') || jobName.includes('Leaderboard')) return '🏆';
    if (jobName.includes('appointment') || jobName.includes('Appointment')) return '📅';
    if (jobName.includes('license') || jobName.includes('License')) return '📜';
    if (jobName.includes('analytics') || jobName.includes('Analytics')) return '📊';
    if (jobName.includes('report') || jobName.includes('Report')) return '📋';
    return '⚙️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cron Jobs Management</h2>
        <p className="text-gray-600">
          Monitor and manage scheduled background tasks
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <div key={job.name} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(job.name)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {job.name.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{job.frequency}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                  {job.schedule}
                </code>
                
                <button
                  onClick={() => triggerJob(job.name)}
                  disabled={triggering === job.name}
                  className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {triggering === job.name ? (
                    <span className="flex items-center space-x-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Running...</span>
                    </span>
                  ) : (
                    'Run Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {jobs.filter(j => j.frequency.includes('Daily')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Daily Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {jobs.filter(j => j.frequency.includes('hour')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hourly Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {jobs.filter(j => j.frequency.includes('Weekly') || j.frequency.includes('Monday') || j.frequency.includes('Sunday') || j.frequency.includes('Wednesday')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Weekly Jobs</div>
          </div>
        </div>
      </div>

      {/* Job Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <span>📧</span>
            <span className="text-gray-700">Email & Notifications</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>🧹</span>
            <span className="text-gray-700">Cleanup & Maintenance</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>🏅</span>
            <span className="text-gray-700">Gamification</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span>📊</span>
            <span className="text-gray-700">Analytics & Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
