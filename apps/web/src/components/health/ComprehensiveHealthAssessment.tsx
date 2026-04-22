'use client';

import { useState } from 'react';

interface AssessmentProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function ComprehensiveHealthAssessment({ userId, onClose, onComplete }: AssessmentProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Basic Demographics
    age: '',
    gender: '',
    height: '',
    weight: '',
    waistCircumference: '',
    
    // Vital Signs & Lab Values
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    cholesterol: '',
    hdlCholesterol: '',
    ldlCholesterol: '',
    triglycerides: '',
    
    // Lifestyle Factors
    smokingStatus: '',
    alcoholConsumption: '',
    activityLevel: '',
    
    // Medical History
    familyHistory: [] as string[],
    currentConditions: [] as string[],
    medications: [] as string[],
    gestationalDiabetes: false,
    hypertensionMedication: false
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      
      console.log('[Health Assessment] Submitting assessment...');
      console.log('[Health Assessment] API URL:', apiUrl);
      console.log('[Health Assessment] User ID:', userId);
      console.log('[Health Assessment] Token present:', !!token);
      
      if (!token) {
        setError('You must be logged in to submit an assessment');
        setLoading(false);
        return;
      }

      const payload = { userId, ...formData };
      console.log('[Health Assessment] Payload:', payload);

      const response = await fetch(`${apiUrl}/api/health-risk/assess`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('[Health Assessment] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit assessment' }));
        console.error('[Health Assessment] Error response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Health Assessment] Success:', data);
      
      // Show success message with prediction count
      if (data.predictions && data.predictions.length > 0) {
        alert(`✅ Assessment Complete!\n\n${data.predictions.length} risk predictions generated.\n\nClick OK to view your results.`);
      }
      
      onComplete();
    } catch (error: any) {
      console.error('[Health Assessment] Error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Comprehensive Health Assessment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of {totalSteps}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Demographics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">📋 Basic Information</h3>
                <p className="text-sm text-gray-600 mb-6">
                  This information helps us calculate your baseline health metrics like BMI and risk factors.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 45"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 170"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 75"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Waist Circumference (cm) <span className="text-orange-500">Recommended</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waistCircumference}
                  onChange={(e) => setFormData({ ...formData, waistCircumference: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 90"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Critical for diabetes risk assessment (FINDRISC algorithm). Measure at belly button level.
                </p>
              </div>

              {formData.height && formData.weight && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Your BMI: {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2) < 18.5 ? 'Underweight' :
                     parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2) < 25 ? 'Normal weight' :
                     parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2) < 30 ? 'Overweight' : 'Obese'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Vital Signs & Lab Values */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">🩺 Vital Signs & Lab Values</h3>
                <p className="text-sm text-gray-600 mb-6">
                  These values are crucial for accurate risk prediction. If you don't have recent lab results, you can skip optional fields.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Blood Pressure <span className="text-orange-500">Recommended</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Systolic (e.g., 120)"
                  />
                  <input
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Diastolic (e.g., 80)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Essential for heart disease and stroke risk (Framingham algorithm)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fasting Blood Sugar (mg/dL) <span className="text-orange-500">Recommended</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 95"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Critical for diabetes risk. Normal: &lt;100, Prediabetes: 100-125, Diabetes: ≥126
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Cholesterol (mg/dL) <span className="text-gray-400">Optional</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    HDL Cholesterol (mg/dL) <span className="text-gray-400">Optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hdlCholesterol}
                    onChange={(e) => setFormData({ ...formData, hdlCholesterol: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Good cholesterol (higher is better)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    LDL Cholesterol (mg/dL) <span className="text-gray-400">Optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ldlCholesterol}
                    onChange={(e) => setFormData({ ...formData, ldlCholesterol: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 130"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bad cholesterol (lower is better)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Triglycerides (mg/dL) <span className="text-gray-400">Optional</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.triglycerides}
                  onChange={(e) => setFormData({ ...formData, triglycerides: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 150"
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> More data = More accurate predictions. If you have recent lab results, entering them significantly improves accuracy.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle Factors */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">🏃 Lifestyle Factors</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Lifestyle choices significantly impact your health risks. Be honest for accurate predictions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Smoking Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.smokingStatus}
                  onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Never">Never smoked</option>
                  <option value="Former">Former smoker (quit)</option>
                  <option value="Current">Current smoker</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Smoking doubles stroke risk and increases heart disease risk by 2-4x
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Alcohol Consumption <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.alcoholConsumption}
                  onChange={(e) => setFormData({ ...formData, alcoholConsumption: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="None">None</option>
                  <option value="Occasional">Occasional (1-2 drinks/week)</option>
                  <option value="Moderate">Moderate (3-7 drinks/week)</option>
                  <option value="Heavy">Heavy (>7 drinks/week)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Physical Activity Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select activity level</option>
                  <option value="Sedentary">Sedentary (little to no exercise)</option>
                  <option value="Light">Light (1-2 days/week)</option>
                  <option value="Moderate">Moderate (3-5 days/week)</option>
                  <option value="Active">Active (6-7 days/week)</option>
                  <option value="Very Active">Very Active (intense daily exercise)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Regular exercise reduces diabetes risk by 40-50%
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Family History */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">👨‍👩‍👧‍👦 Family Medical History</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Family history is a strong predictor of disease risk. Select all conditions that apply to your immediate family (parents, siblings).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Family History of Diseases
                </label>
                <div className="space-y-2">
                  {['Diabetes', 'Heart Disease', 'Stroke', 'Hypertension', 'High Cholesterol', 'Cancer'].map((condition) => (
                    <label key={condition} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.includes(condition)}
                        onChange={() => setFormData({
                          ...formData,
                          familyHistory: toggleArrayItem(formData.familyHistory, condition)
                        })}
                        className="mr-3 h-4 w-4"
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Family history adds 15-20 points to risk scores (FINDRISC, Framingham)
                </p>
              </div>

              {formData.gender === 'Female' && (
                <div>
                  <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gestationalDiabetes}
                      onChange={(e) => setFormData({ ...formData, gestationalDiabetes: e.target.checked })}
                      className="mr-3 h-4 w-4"
                    />
                    <div>
                      <span className="font-medium">History of Gestational Diabetes</span>
                      <p className="text-xs text-gray-500">Strong predictor of Type 2 Diabetes (+5 points in FINDRISC)</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Current Conditions & Medications */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">💊 Current Health Status</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Information about existing conditions and medications helps us provide more accurate risk assessments.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Current Medical Conditions
                </label>
                <div className="space-y-2">
                  {['Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol', 'Kidney Disease', 'Thyroid Disorder', 'Asthma', 'Arthritis'].map((condition) => (
                    <label key={condition} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.currentConditions.includes(condition)}
                        onChange={() => setFormData({
                          ...formData,
                          currentConditions: toggleArrayItem(formData.currentConditions, condition)
                        })}
                        className="mr-3 h-4 w-4"
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hypertensionMedication}
                    onChange={(e) => setFormData({ ...formData, hypertensionMedication: e.target.checked })}
                    className="mr-3 h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">Currently Taking Blood Pressure Medication</span>
                    <p className="text-xs text-gray-500">Important for Framingham risk calculation</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Current Medications (Optional)
                </label>
                <div className="space-y-2">
                  {['Statins (Cholesterol)', 'Metformin (Diabetes)', 'ACE Inhibitors (BP)', 'Beta Blockers (BP)', 'Aspirin', 'Insulin'].map((med) => (
                    <label key={med} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.medications.includes(med)}
                        onChange={() => setFormData({
                          ...formData,
                          medications: toggleArrayItem(formData.medications, med)
                        })}
                        className="mr-3 h-4 w-4"
                      />
                      <span>{med}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ <strong>Ready to submit!</strong> We'll analyze your data using clinically validated algorithms (FINDRISC, Framingham) to predict your 10-year health risks.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium"
                disabled={loading}
              >
                ← Back
              </button>
            )}
            
            {step < totalSteps ? (
              <button
                onClick={() => {
                  // Validate required fields for current step
                  if (step === 1 && (!formData.age || !formData.gender || !formData.height || !formData.weight)) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  if (step === 3 && (!formData.smokingStatus || !formData.alcoholConsumption || !formData.activityLevel)) {
                    setError('Please fill in all required fields');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : '✓ Complete Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
