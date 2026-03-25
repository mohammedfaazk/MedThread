'use client';

import { useState } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import { Brain, Search, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import IridescenceLayout from '@/components/IridescenceLayout';

interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

interface DiagnosisResult {
  condition: string;
  probability: number;
  severity: string;
  urgency: string;
  reasoning: string[];
  recommendations: string[];
  relatedSymptoms: string[];
  whenToSeekCare: string;
}

interface AnalysisResponse {
  diagnoses: DiagnosisResult[];
  specialtyRecommendation?: string;
}

export default function AIDiseaseDetectivePage() {
  const { user } = useJWTAuth();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendedSpecialty, setRecommendedSpecialty] = useState<string>('');

  const addSymptom = () => {
    if (currentSymptom.trim() && duration) {
      setSymptoms([...symptoms, { name: currentSymptom, severity, duration }]);
      setCurrentSymptom('');
      setDuration('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      alert('Please add at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Analyzing symptoms:', symptoms);
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_URL}/api/v1/ai-detective/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          symptoms: symptoms.map(s => s.name),
          severities: symptoms.map(s => s.severity),
          durations: symptoms.map(s => s.duration)
        })
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      console.log('Response status:', response.status);
      console.log('Diagnoses exists?', 'diagnoses' in data);
      console.log('Diagnoses value:', data.diagnoses);
      console.log('Diagnoses is array?', Array.isArray(data.diagnoses));
      console.log('Diagnoses length:', data.diagnoses?.length);
      
      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to analyze symptoms'}`);
        throw new Error(data.error || 'Failed to analyze symptoms');
      }
      
      // Check if diagnoses exist
      const diagnoses = data.diagnoses || [];
      const specialty = data.specialtyRecommendation || 'General Medicine';
      console.log('Extracted diagnoses:', diagnoses);
      console.log('Recommended specialty:', specialty);
      
      if (diagnoses.length === 0) {
        console.error('No diagnoses in response');
        alert('No diagnoses found. The symptoms may not match any known patterns. Please consult a doctor.');
        setShowResults(false);
        return;
      }
      
      console.log('Setting results with', diagnoses.length, 'diagnoses');
      setResults(diagnoses);
      setRecommendedSpecialty(specialty);
      setShowResults(true);
      console.log('State updated - showResults should be true');
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      alert(`Failed to analyze symptoms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'severe': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!user) {
    return (
      <IridescenceLayout>
        <NavbarEnhanced />
        <div className="max-w-[1440px] mx-auto flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Sign in to use AI Disease Detective</h2>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Sign In
              </button>
            </div>
          </main>
        </div>
      </IridescenceLayout>
    );
  }

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1440px] mx-auto flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-10 w-10 text-blue-600" />
              <h1 className="text-3xl font-bold">AI Disease Detective</h1>
            </div>
            <p className="text-gray-600">
              Advanced AI-powered symptom analysis and preliminary diagnosis suggestions
            </p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Medical Disclaimer:</strong> This tool provides preliminary insights only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                </div>
              </div>
            </div>
          </div>

          {!showResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Describe Your Symptoms</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Symptom</label>
                      <input
                        type="text"
                        value={currentSymptom}
                        onChange={(e) => setCurrentSymptom(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                        placeholder="e.g., headache, fever, cough"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Severity</label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value as any)}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <input
                          type="text"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="e.g., 2 days, 1 week"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      onClick={addSymptom}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Symptom
                    </button>
                  </div>

                  {symptoms.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Added Symptoms ({symptoms.length})</h3>
                      <div className="space-y-2">
                        {symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <span className="font-medium">{symptom.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded ${getSeverityColor(symptom.severity)}`}>
                                  {symptom.severity}
                                </span>
                                <span className="text-sm text-gray-600">• {symptom.duration}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeSymptom(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={analyzeSymptoms}
                        disabled={loading}
                        className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="h-5 w-5" />
                            Analyze Symptoms
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold mb-3">How It Works</h3>
                  <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600">1.</span>
                      <span>Describe your symptoms with severity and duration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600">2.</span>
                      <span>Our AI analyzes patterns and medical data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600">3.</span>
                      <span>Receive possible conditions ranked by probability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600">4.</span>
                      <span>Get recommendations and when to seek care</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Pro Tip</h3>
                  <p className="text-sm text-blue-800">
                    Be as specific as possible about your symptoms. Include details like location, timing, and what makes them better or worse.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                }}
                className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
              >
                ← Back to Symptom Input
              </button>

              <div className="space-y-6">
                {results.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No diagnoses found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adding more specific symptoms</p>
                  </div>
                ) : (
                  <>
                    {results.map((result, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{result.condition}</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">
                                Probability: <strong>{(result.probability * 100).toFixed(0)}%</strong>
                              </span>
                              <span className={`text-sm font-semibold ${getUrgencyColor(result.urgency)}`}>
                                {result.urgency.toUpperCase()} Urgency
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                              #{index + 1}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Reasoning
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {result.reasoning.map((reason, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Recommendations
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-600">✓</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {result.relatedSymptoms && result.relatedSymptoms.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-2 text-sm">Related Symptoms to Watch For:</h4>
                            <div className="flex flex-wrap gap-2">
                              {result.relatedSymptoms.map((symptom, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className={`mt-4 pt-4 border-t ${
                          result.urgency === 'high' || result.urgency === 'emergency' 
                            ? 'bg-red-50' 
                            : 'bg-blue-50'
                        } -mx-6 -mb-6 px-6 py-4 rounded-b-lg`}>
                          <h4 className={`font-semibold mb-1 flex items-center gap-2 ${
                            result.urgency === 'high' || result.urgency === 'emergency'
                              ? 'text-red-900'
                              : 'text-blue-900'
                          }`}>
                            <AlertCircle className="h-4 w-4" />
                            When to Seek Care
                          </h4>
                          <p className={`text-sm ${
                            result.urgency === 'high' || result.urgency === 'emergency'
                              ? 'text-red-800'
                              : 'text-blue-800'
                          }`}>
                            {result.whenToSeekCare}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-6 bg-white rounded-lg shadow p-6">
                      <h3 className="font-semibold mb-2 text-center">Consult a Doctor</h3>
                      <p className="text-gray-600 mb-4 text-center">
                        Book an appointment with a specialist for proper diagnosis and treatment
                      </p>
                      <div className="flex justify-center">
                        <button
                          onClick={() => router.push(`/appointments?specialty=${encodeURIComponent(recommendedSpecialty)}`)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Find a Doctor
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </IridescenceLayout>
  );
}
