'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RiskPrediction {
  disease: string;
  probability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timeframe: string;
  preventionTips: string[];
  basedOn: string[];
}

interface RiskDashboardProps {
  userId: string;
}

export default function RiskDashboard({ userId }: RiskDashboardProps) {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskPrediction | null>(null);

  useEffect(() => {
    fetchRiskPredictions();
  }, [userId]);

  const fetchRiskPredictions = async () => {
    try {
      const response = await fetch(`/api/v1/health-risk/predictions/${userId}`);
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Failed to fetch risk predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return '✓';
      case 'MEDIUM': return '⚠';
      case 'HIGH': return '⚠';
      case 'CRITICAL': return '🚨';
      default: return '•';
    }
  };

  // Chart data for risk timeline
  const timelineData = {
    labels: ['Now', '3 Months', '6 Months', '1 Year', '2 Years', '5 Years'],
    datasets: predictions.slice(0, 3).map((pred, index) => ({
      label: pred.disease,
      data: [
        pred.probability,
        pred.probability * 1.1,
        pred.probability * 1.2,
        pred.probability * 1.3,
        pred.probability * 1.4,
        pred.probability * 1.5
      ],
      borderColor: index === 0 ? 'rgb(239, 68, 68)' : index === 1 ? 'rgb(249, 115, 22)' : 'rgb(234, 179, 8)',
      backgroundColor: index === 0 ? 'rgba(239, 68, 68, 0.1)' : index === 1 ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 179, 8, 0.1)',
      fill: true,
      tension: 0.4
    }))
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Risk Progression Timeline'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Health Risk Assessment</h1>
        <p className="text-orange-100">
          AI-powered predictions to help you stay ahead of potential health issues
        </p>
      </div>

      {/* Overall Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Overall Risk</div>
          <div className="text-3xl font-bold text-orange-600">
            {predictions.length > 0 
              ? Math.round(predictions.reduce((acc, p) => acc + p.probability, 0) / predictions.length)
              : 0}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">High Risk Conditions</div>
          <div className="text-3xl font-bold text-red-600">
            {predictions.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Medium Risk</div>
          <div className="text-3xl font-bold text-yellow-600">
            {predictions.filter(p => p.riskLevel === 'MEDIUM').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Low Risk</div>
          <div className="text-3xl font-bold text-green-600">
            {predictions.filter(p => p.riskLevel === 'LOW').length}
          </div>
        </div>
      </div>

      {/* Risk Timeline Chart */}
      {predictions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <Line data={timelineData} options={chartOptions} />
        </div>
      )}

      {/* Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedRisk(prediction)}
          >
            <div className={`p-4 border-l-4 rounded-lg ${getRiskColor(prediction.riskLevel)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{prediction.disease}</h3>
                  <p className="text-sm text-gray-600">{prediction.timeframe}</p>
                </div>
                <div className="text-2xl">{getRiskIcon(prediction.riskLevel)}</div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Risk Probability</span>
                  <span className="font-semibold">{prediction.probability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      prediction.riskLevel === 'CRITICAL' ? 'bg-red-600' :
                      prediction.riskLevel === 'HIGH' ? 'bg-orange-600' :
                      prediction.riskLevel === 'MEDIUM' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${prediction.probability}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-semibold text-gray-700 mb-1">Top Prevention Tips:</div>
                <ul className="space-y-1">
                  {prediction.preventionTips.slice(0, 2).map((tip, i) => (
                    <li key={i} className="text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {predictions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Risk Predictions Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete your health profile to get personalized risk assessments
          </p>
          <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Complete Health Profile
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRisk.disease}</h2>
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className={`p-4 rounded-lg mb-6 ${getRiskColor(selectedRisk.riskLevel)}`}>
                <div className="font-semibold mb-2">Risk Level: {selectedRisk.riskLevel}</div>
                <div className="text-2xl font-bold">{selectedRisk.probability}% Probability</div>
                <div className="text-sm mt-1">Timeframe: {selectedRisk.timeframe}</div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Prevention Strategies</h3>
                <ul className="space-y-2">
                  {selectedRisk.preventionTips.map((tip, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Based On</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRisk.basedOn.map((factor, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                  Find Specialists
                </button>
                <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Schedule Checkup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
