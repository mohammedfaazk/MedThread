'use client';

import { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface ProtectionRecord {
  id: string;
  consultationId: string;
  patientName: string;
  date: string;
  disclaimerSigned: boolean;
  recordsArchived: boolean;
  status: 'active' | 'archived';
}

export default function LiabilityProtectionPage() {
  const [records, setRecords] = useState<ProtectionRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProtectionData();
  }, []);

  const fetchProtectionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [recordsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liability-protection/records`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liability-protection/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const recordsData = await recordsRes.json();
      const statsData = await statsRes.json();
      setRecords(recordsData.records || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching protection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecord = async (recordId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/liability-protection/download/${recordId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liability-record-${recordId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading record:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Liability Protection</h1>
          </div>
          <p className="text-gray-600">Legal protection and documentation for your consultations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-600">Total Records</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalRecords || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-sm font-medium text-gray-600">Protected</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.protectedRecords || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.pendingRecords || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Protection Records</h2>
          </div>
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{record.patientName}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Consultation ID: {record.consultationId}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                      <span className={`flex items-center gap-1 ${record.disclaimerSigned ? 'text-green-600' : 'text-yellow-600'}`}>
                        {record.disclaimerSigned ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        {record.disclaimerSigned ? 'Disclaimer Signed' : 'Pending Signature'}
                      </span>
                      <span className={`flex items-center gap-1 ${record.recordsArchived ? 'text-green-600' : 'text-gray-500'}`}>
                        {record.recordsArchived ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {record.recordsArchived ? 'Archived' : 'Active'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadRecord(record.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-5 w-5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
