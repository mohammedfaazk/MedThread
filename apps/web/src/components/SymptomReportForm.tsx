'use client';

import { useState } from 'react';
import { AnalyticsTracker } from '@/lib/analytics';

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
  'Body Aches', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath'
];

const SEVERITIES = ['mild', 'moderate', 'severe'];

export default function SymptomReportForm() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, string>>({});
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [temperature, setTemperature] = useState('');
  const [duration, setDuration] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      const newSymptoms = { ...prev };
      if (newSymptoms[symptom]) {
        delete newSymptoms[symptom];
      } else {
        newSymptoms[symptom] = 'moderate';
      }
      return newSymptoms;
    });
  };

  const handleSeverityChange = (symptom: string, severity: string) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [symptom]: severity
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const symptoms = Object.entries(selectedSymptoms).map(([name, severity]) => ({
      name: name.toLowerCase(),
      severity
    }));

    const result = await AnalyticsTracker.trackSymptomReport({
      symptoms,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      duration: duration || undefined
    });

    if (result?.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedSymptoms({});
        setAge('');
        setGender('');
        setTemperature('');
        setDuration('');
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Report Your Symptoms</h2>
      <p className="text-gray-600 mb-6">
        Help us track health trends in your area. Your report is anonymous and helps others stay informed.
      </p>

      {submitted ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Thank you! Your symptom report has been recorded.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-semibold mb-3">Select Your Symptoms:</label>
            <div className="grid grid-cols-2 gap-3">
              {COMMON_SYMPTOMS.map(symptom => (
                <div key={symptom}>
                  <button
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`w-full p-3 rounded-lg border-2 transition ${
                      selectedSymptoms[symptom]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {symptom}
                  </button>
                  {selectedSymptoms[symptom] && (
                    <select
                      value={selectedSymptoms[symptom]}
                      onChange={(e) => handleSeverityChange(symptom, e.target.value)}
                      className="w-full mt-2 p-1 border rounded text-sm"
                    >
                      {SEVERITIES.map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-semibold mb-2">Age (optional)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Your age"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Gender (optional)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Temperature (°F, optional)</label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="98.6"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Duration (optional)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="less than 1 day">Less than 1 day</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="1 week">1 week</option>
                <option value="more than 1 week">More than 1 week</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={Object.keys(selectedSymptoms).length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Submit Report
          </button>
        </form>
      )}
    </div>
  );
}
