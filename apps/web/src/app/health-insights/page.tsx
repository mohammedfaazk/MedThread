'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Pill, Activity, MapPin, Calendar } from 'lucide-react';

interface TrendingInsight {
  type: string;
  title: string;
  description: string;
  growthRate: number;
  caseCount: number;
  timeframe: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface RegionalAlert {
  region: string;
  symptom: string;
  caseCount: number;
  severity: string;
  alert: string;
  recommendation: string;
}

interface MedicationPattern {
  medicationName: string;
  mentionCount: number;
  sideEffects: Array<{ effect: string; frequency: number; severity: string }>;
  efficacy: { positive: number; negative: number; neutral: number };
  commonConditions: string[];
}

export default function HealthInsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'trending' | 'regional' | 'medications' | 'diagnostics'>('trending');

  useEffect(() => {
    fetchInsights();
  }, [timeframe]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health-insights/dashboard?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Health Insights</h1>
              </div>
              <p className="text-gray-600">AI-powered health trends and patterns</p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'week' | 'month')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'trending', label: 'Trending Symptoms', icon: TrendingUp },
            { id: 'regional', label: 'Regional Alerts', icon: MapPin },
            { id: 'medications', label: 'Medication Patterns', icon: Pill },
            { id: 'diagnostics', label: 'Diagnostic Patterns', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'trending' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Trending Symptoms</h2>
            {insights?.trendingSymptoms?.map((insight: TrendingInsight, index: number) => (
              <div key={index} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {insight.growthRate > 0 ? '+' : ''}{insight.growthRate}% growth
                      </span>
                      <span>{insight.caseCount} cases</span>
                      <span className={`px-2 py-1 rounded ${getSeverityColor(insight.severity)}`}>
                        {insight.severity || 'low'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'regional' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Regional Health Alerts</h2>
            {insights?.regionalAlerts?.map((alert: RegionalAlert, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${alert.severity === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    <MapPin className={`h-6 w-6 ${alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.region}</h3>
                    <p className="text-gray-700 mb-2">{alert.alert}</p>
                    <p className="text-sm text-gray-600 mb-3">{alert.recommendation}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">{alert.symptom}</span>
                      <span>{alert.caseCount} cases</span>
                      <span className={`px-2 py-1 rounded ${alert.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {alert.severity} severity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Medication Usage Patterns</h2>
            {insights?.medicationPatterns?.map((pattern: MedicationPattern, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{pattern.medicationName}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Efficacy</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(pattern.efficacy.positive / pattern.mentionCount) * 100}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{pattern.efficacy.positive} positive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(pattern.efficacy.negative / pattern.mentionCount) * 100}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{pattern.efficacy.negative} negative</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Common Side Effects</h4>
                    <ul className="space-y-1">
                      {pattern.sideEffects.slice(0, 3).map((effect, i) => (
                        <li key={i} className="text-sm text-gray-600">• {effect.effect}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-600">Common conditions: {pattern.commonConditions.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Diagnostic Patterns</h2>
            {insights?.diagnosticPatterns?.map((pattern: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Symptoms: {pattern.symptoms}</h3>
                <p className="text-gray-600 mb-4">{pattern.caseCount} cases analyzed</p>
                {pattern.commonMisdiagnoses && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Common Diagnostic Patterns:</h4>
                    <ul className="space-y-2">
                      {pattern.commonMisdiagnoses.map((mis: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">{mis.pattern}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">{mis.count} cases</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
