'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { NavbarEnhanced } from '@/components/NavbarEnhanced';
import { Sidebar } from '@/components/Sidebar';
import IridescenceLayout from '@/components/IridescenceLayout';

const steps = ['Body Part', 'Symptoms', 'Duration & Severity', 'Results'];

const commonSymptoms = [
  { name: 'Fever', icon: '🌡️' },
  { name: 'Headache', icon: '🤕' },
  { name: 'Cough', icon: '😷' },
  { name: 'Fatigue', icon: '😴' },
  { name: 'Nausea', icon: '🤢' },
  { name: 'Body Ache', icon: '💪' },
  { name: 'Sore Throat', icon: '🗣️' },
  { name: 'Dizziness', icon: '😵' },
  { name: 'Chest Tightness', icon: '💔' },
  { name: 'Shortness of Breath', icon: '🫁' },
  { name: 'Runny Nose', icon: '👃' },
  { name: 'Congestion', icon: '😤' },
  { name: 'Chills', icon: '🥶' },
  { name: 'Sweating', icon: '😓' },
  { name: 'Loss of Appetite', icon: '🍽️' },
  { name: 'Sinus Pain', icon: '🤐' },
];

const bodyParts = ['Head', 'Chest', 'Stomach', 'Back', 'Arms', 'Legs'];
const durations = ['Few hours', '1-2 days', '3-5 days', '1 week', '2 weeks', 'More than 2 weeks'];

interface Condition {
  name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  reliefSteps: string[];
  when: string;
}

interface AnalysisResult {
  conditions: Condition[];
  isEmergency: boolean;
}

// Symptom analysis engine
const analyzeSymptoms = (
  symptoms: string[],
  bodyPart: string,
  severity: number,
  duration: string
): Condition[] => {
  const conditions: Condition[] = [];
  const symptomSet = new Set(symptoms.map(s => s.toLowerCase()));

  // Fever + cough + headache = Respiratory infection
  if (symptomSet.has('fever') && symptomSet.has('cough')) {
    conditions.push({
      name: 'Upper Respiratory Infection (Cold/Flu)',
      confidence: 0.88,
      severity: severity > 7 ? 'medium' : 'low',
      description: 'Common viral infection affecting the nose, throat, and sinuses. Most people recover within 7-10 days.',
      reliefSteps: [
        'Stay well-hydrated - drink water, herbal tea, or warm lemon water',
        'Get adequate rest (7-9 hours) to help your immune system fight the infection',
        'Use a humidifier or breathe steam to ease congestion',
        'Take vitamin C-rich foods (citrus, berries, peppers)',
        'Use honey to soothe throat irritation (1 tsp when needed)',
        'Gargle with warm salt water for throat discomfort'
      ],
      when: 'See a doctor if symptoms persist beyond 10 days or worsen'
    });
  }

  // Headache patterns
  if (symptomSet.has('headache')) {
    if (severity > 8) {
      conditions.push({
        name: 'Severe Tension Headache or Migraine',
        confidence: 0.75,
        severity: 'medium',
        description: 'Intense head pain that responds well to rest and hydration in most cases.',
        reliefSteps: [
          'Rest in a dark, quiet room for 30 minutes',
          'Apply a cold compress to your forehead or a warm compress to neck',
          'Drink plenty of water - dehydration is a common trigger',
          'Try light stretching or neck exercises',
          'Avoid bright screens and loud noises',
          'Consider over-the-counter pain relief (ibuprofen or acetaminophen)'
        ],
        when: 'See a doctor if headaches become frequent (3+ per week) or change pattern'
      });
    } else {
      conditions.push({
        name: 'Mild to Moderate Headache',
        confidence: 0.70,
        severity: 'low',
        description: 'Common headache that usually resolves with rest and basic self-care.',
        reliefSteps: [
          'Stay hydrated by drinking water throughout the day',
          'Take a 20-30 minute nap or rest',
          'Apply a warm compress to tense muscles',
          'Try gentle neck and shoulder stretches',
          'Reduce caffeine intake gradually',
          'Practice deep breathing exercises'
        ],
        when: 'Monitor for improvement over 24 hours'
      });
    }
  }

  // Stomach issues
  if (bodyPart === 'Stomach' && (symptomSet.has('nausea') || symptomSet.has('body ache'))) {
    conditions.push({
      name: 'Gastroenteritis or Indigestion',
      confidence: 0.82,
      severity: 'low',
      description: 'Stomach inflammation that typically resolves within 24-48 hours with proper care.',
      reliefSteps: [
        'Drink clear fluids slowly (water, coconut water, clear broths)',
        'Eat bland foods like crackers, toast, rice, or banana',
        'Avoid heavy, spicy, or fatty foods for 24-48 hours',
        'Eat small portions every 2-3 hours instead of large meals',
        'Keep a ginger tea handy for nausea relief',
        'Rest for at least 6-8 hours'
      ],
      when: 'See a doctor if symptoms persist beyond 48 hours or you cannot keep fluids down'
    });
  }

  // Sore throat
  if (symptomSet.has('sore throat')) {
    conditions.push({
      name: 'Sore Throat/Pharyngitis',
      confidence: 0.80,
      severity: severity > 6 ? 'medium' : 'low',
      description: 'Throat inflammation that usually improves within 3-7 days with self-care.',
      reliefSteps: [
        'Gargle with warm salt water 3-4 times daily (½ tsp salt in 8oz water)',
        'Suck on throat lozenges or sugar-free candy',
        'Drink warm liquids like herbal tea with honey',
        'Avoid smoking and secondhand smoke',
        'Use a humidifier to add moisture to the air',
        'Take vitamin C supplements or eat citrus fruits'
      ],
      when: 'See a doctor if pain is severe, you have difficulty swallowing, or high fever'
    });
  }

  // Fatigue
  if (symptomSet.has('fatigue')) {
    conditions.push({
      name: 'Fatigue/Low Energy',
      confidence: 0.72,
      severity: 'low',
      description: 'Common when fighting off illness. Usually resolves with proper rest and nutrition.',
      reliefSteps: [
        'Aim for 8-10 hours of quality sleep',
        'Eat balanced meals with proteins, carbs, and healthy fats',
        'Take short 15-20 minute walks for gentle movement',
        'Stay hydrated throughout the day',
        'Include iron-rich foods (spinach, lentils, lean meat)',
        'Limit screen time 1 hour before bed'
      ],
      when: 'See a doctor if fatigue lasts more than 2 weeks without improvement'
    });
  }

  // Body ache
  if (symptomSet.has('body ache')) {
    conditions.push({
      name: 'Muscle Pain/Body Aches',
      confidence: 0.75,
      severity: severity > 6 ? 'medium' : 'low',
      description: 'Muscle soreness that typically improves within 3-5 days with rest.',
      reliefSteps: [
        'Rest the affected area and avoid strenuous activity',
        'Apply a warm compress or heating pad for 15-20 minutes',
        'Gentle stretching to prevent stiffness',
        'Ensure adequate magnesium intake (nuts, seeds, leafy greens)',
        'Stay hydrated - muscle pain can worsen with dehydration',
        'Consider over-the-counter pain relief if needed'
      ],
      when: 'See a doctor if pain is severe, worsens, or accompanied by other symptoms'
    });
  }

  // Dizziness
  if (symptomSet.has('dizziness')) {
    conditions.push({
      name: 'Dizziness/Lightheadedness',
      confidence: 0.70,
      severity: severity > 7 ? 'medium' : 'low',
      description: 'Often caused by dehydration, low blood pressure, or inner ear issues.',
      reliefSteps: [
        'Sit or lie down immediately until dizziness passes',
        'Move slowly and deliberately when changing positions',
        'Drink water and electrolyte solutions',
        'Avoid sudden movements and rapid head turns',
        'Eat balanced meals to maintain stable blood sugar',
        'Avoid caffeine and alcohol temporarily'
      ],
      when: 'See a doctor if dizziness persists, is severe, or accompanied by chest pain'
    });
  }

  // Chest tightness
  if (symptomSet.has('chest tightness')) {
    if (symptomSet.has('shortness of breath') || severity > 7) {
      conditions.push({
        name: 'Severe Chest Tightness - Seek Immediate Care',
        confidence: 0.90,
        severity: 'high',
        description: 'Chest tightness with breathing difficulty requires urgent medical evaluation.',
        reliefSteps: [
          'Stop all physical activity immediately',
          'Sit or lie down in a comfortable position',
          'Try slow, deep breathing exercises',
          'Loosen tight clothing',
          'Stay calm - anxiety can worsen symptoms',
          'Call emergency services if pain increases'
        ],
        when: 'SEEK IMMEDIATE MEDICAL ATTENTION - Call emergency services if accompanied by shortness of breath, sweating, or arm pain'
      });
    } else {
      conditions.push({
        name: 'Chest Tightness/Musculoskeletal Pain',
        confidence: 0.75,
        severity: 'medium',
        description: 'Often caused by muscle tension, anxiety, or gastric issues rather than heart problems.',
        reliefSteps: [
          'Apply a heating pad to chest area for 15-20 minutes',
          'Do gentle chest stretches and shoulder rolls',
          'Practice deep breathing and relaxation techniques',
          'Take warm baths to relax muscles',
          'Avoid heavy lifting and strenuous exercise',
          'Eat slowly and avoid large meals'
        ],
        when: 'See a doctor if tightness persists more than a few days, or if accompanied by shortness of breath or arm pain'
      });
    }
  }

  // Shortness of breath
  if (symptomSet.has('shortness of breath')) {
    conditions.push({
      name: 'Shortness of Breath',
      confidence: 0.80,
      severity: severity > 7 ? 'high' : 'medium',
      description: 'Can be caused by respiratory issues, anxiety, or deconditioning.',
      reliefSteps: [
        'Sit upright to help open airways',
        'Practice slow, deep breathing (4 counts in, hold 4, out 4)',
        'Use a humidifier to add moisture to air',
        'Avoid allergens and irritants',
        'Stay calm - panic can worsen breathing',
        'Drink warm fluids like herbal tea'
      ],
      when: 'Seek medical attention if shortness of breath is severe, persistent, or accompanied by chest pain'
    });
  }

  // Runny nose and congestion
  if (symptomSet.has('runny nose') || symptomSet.has('congestion')) {
    conditions.push({
      name: 'Common Cold or Allergies',
      confidence: 0.85,
      severity: 'low',
      description: 'Nasal congestion usually resolves within 7-10 days without treatment.',
      reliefSteps: [
        'Use a saline nasal spray or drops 3-4 times daily',
        'Use a neti pot to clear nasal passages gently',
        'Apply a warm compress to sinuses',
        'Drink plenty of water and warm liquids',
        'Elevate your head while sleeping',
        'Use a humidifier to add moisture to the air'
      ],
      when: 'See a doctor if congestion lasts more than 2 weeks or is accompanied by severe headache'
    });
  }

  // Chills
  if (symptomSet.has('chills')) {
    conditions.push({
      name: 'Chills (Often with Fever)',
      confidence: 0.78,
      severity: severity > 6 ? 'medium' : 'low',
      description: 'Chills usually indicate your body is fighting an infection.',
      reliefSteps: [
        'Bundle up with blankets and warm clothing',
        'Drink warm beverages like tea or broth',
        'Take a warm (not hot) bath',
        'Stay hydrated with water and electrolyte drinks',
        'Avoid cold environments',
        'Rest in a comfortable position'
      ],
      when: 'See a doctor if chills persist without fever or are accompanied by high fever'
    });
  }

  // Sweating
  if (symptomSet.has('sweating')) {
    conditions.push({
      name: 'Excessive Sweating',
      confidence: 0.70,
      severity: severity > 6 ? 'medium' : 'low',
      description: 'Can result from fever, anxiety, or physical exertion. Usually resolves with the underlying condition.',
      reliefSteps: [
        'Change into light, breathable clothing',
        'Wipe skin with a cool, damp cloth',
        'Drink fluids to replace lost moisture',
        'Use antiperspirant or absorbent powder',
        'Avoid caffeine and spicy foods',
        'Sleep in a cool room with light bedding'
      ],
      when: 'See a doctor if sweating is excessive, occurs at night regularly, or is unexplained'
    });
  }

  // Loss of appetite
  if (symptomSet.has('loss of appetite')) {
    conditions.push({
      name: 'Loss of Appetite',
      confidence: 0.65,
      severity: 'low',
      description: 'Common when fighting illness. Usually returns as you recover.',
      reliefSteps: [
        'Eat small, frequent meals instead of large ones',
        'Try light, easily digestible foods like soup or broth',
        'Keep hydrated with water and electrolyte drinks',
        'Eat nutrient-dense foods when you have appetite',
        'Avoid heavy or fried foods',
        'Eat in a calm, relaxed environment'
      ],
      when: 'See a doctor if appetite loss lasts more than a week or is accompanied by weight loss'
    });
  }

  // Sinus pain
  if (symptomSet.has('sinus pain')) {
    conditions.push({
      name: 'Sinus Infection or Sinusitis',
      confidence: 0.80,
      severity: severity > 6 ? 'medium' : 'low',
      description: 'Sinus inflammation that typically improves within 5-7 days with care.',
      reliefSteps: [
        'Apply a warm compress to your sinuses for 10-15 minutes',
        'Use saline nasal drops or spray regularly',
        'Drink warm fluids and herbal teas',
        'Elevate your head while sleeping to reduce pressure',
        'Use a humidifier to moisten the air',
        'Avoid cold air and smoke'
      ],
      when: 'See a doctor if pain is severe, fever is high, or symptoms persist beyond 10 days'
    });
  }

  // Default condition if no matches
  if (conditions.length === 0) {
    conditions.push({
      name: 'General Discomfort',
      confidence: 0.60,
      severity: severity > 5 ? 'low' : 'low',
      description: 'Mild symptoms that usually resolve with self-care and rest.',
      reliefSteps: [
        'Get plenty of rest',
        'Stay hydrated throughout the day',
        'Eat nutritious, balanced meals',
        'Avoid stress and take relaxation breaks',
        'Maintain good hygiene',
        'Monitor your symptoms for changes'
      ],
      when: 'Monitor for any worsening of symptoms over 2-3 days'
    });
  }

  return conditions.sort((a, b) => b.confidence - a.confidence);
};

export default function SymptomChecker() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('1-2 days');
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const severityEmojis = ['😊', '🙂', '😐', '😟', '😰', '😣', '😖', '😫', '😩', '😱'];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyze = () => {
    const conditions = analyzeSymptoms(selectedSymptoms, selectedBodyPart, severity, duration);
    setResults({
      conditions,
      isEmergency: conditions[0]?.severity === 'high' && severity > 7
    });
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handleAnalyze();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const canContinue = 
    (currentStep === 0 && selectedBodyPart) ||
    (currentStep === 1 && selectedSymptoms.length > 0) ||
    currentStep === 2;

  const reset = () => {
    setCurrentStep(0);
    setSelectedBodyPart('');
    setSelectedSymptoms([]);
    setSeverity(5);
    setDuration('1-2 days');
    setResults(null);
  };

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Symptom Checker</h1>
              <p className="text-gray-600 mt-2">Get personalized health insights based on your symptoms</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex gap-2 mb-3">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}: <span className="font-semibold">{steps[currentStep]}</span>
              </p>
            </div>

            {/* Content */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
          {/* Step 1: Body Part */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Where does it hurt?</h2>
                <p className="text-gray-600">Tap on the affected body part</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {bodyParts.map((part) => (
                  <button
                    key={part}
                    onClick={() => setSelectedBodyPart(part)}
                    className={`p-4 rounded-xl border-2 font-medium transition-all ${
                      selectedBodyPart === part
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Symptoms */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Symptoms</h2>
                <p className="text-gray-600">You can select multiple symptoms</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom.name}
                    onClick={() => toggleSymptom(symptom.name)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedSymptoms.includes(symptom.name)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{symptom.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{symptom.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Duration & Severity */}
          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Severity */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">How severe is it?</h3>
                    <p className="text-gray-600 text-sm mt-1">Rate your symptoms</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-1">{severityEmojis[severity - 1]}</div>
                    <div className="text-2xl font-bold text-blue-600">{severity}/10</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Mild</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">How long have you had this?</h3>
                <div className="grid grid-cols-2 gap-2">
                  {durations.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        duration === dur
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 3 && results && (
            <div className="space-y-6">
              {/* Alert */}
              <div className={`p-4 rounded-xl flex gap-3 ${
                results.isEmergency
                  ? 'bg-red-50 border-2 border-red-200'
                  : 'bg-green-50 border-2 border-green-200'
              }`}>
                {results.isEmergency ? (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-bold ${results.isEmergency ? 'text-red-900' : 'text-green-900'}`}>
                    {results.isEmergency ? 'Seek Emergency Care' : 'Assessment Complete'}
                  </p>
                  <p className={`text-sm ${results.isEmergency ? 'text-red-700' : 'text-green-700'}`}>
                    {results.isEmergency
                      ? 'Please contact emergency services immediately'
                      : 'Based on your symptoms, here are possible conditions'}
                  </p>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">What Might Be Going On</h3>
                <div className="space-y-4">
                  {results.conditions.slice(0, 3).map((condition, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">{condition.name}</h4>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          {Math.round(condition.confidence * 100)}% match
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4">{condition.description}</p>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-800 text-sm mb-2">💡 Steps to Feel Better:</h5>
                        <ul className="space-y-2">
                          {condition.reliefSteps.slice(0, 4).map((step, stepIdx) => (
                            <li key={stepIdx} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-green-600 font-bold">✓</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                        <span className="font-semibold">When to see a doctor: </span>{condition.when}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  ℹ️ <span className="font-semibold">Important:</span> This is an educational tool based on your symptoms. It&apos;s not a substitute for professional medical advice. If you&apos;re concerned or symptoms worsen, please consult a healthcare professional.
                </p>
              </div>
            </div>
          )}
            </div>

            {/* Navigation */}
            {currentStep < 3 && (
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 h-14 bg-white/40 backdrop-blur-xl border border-white/20 text-gray-700 rounded-xl font-semibold hover:bg-white/60 transition"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="flex-1 h-14 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {currentStep === 2 ? 'Get Results' : 'Continue'}
                </button>
              </div>
            )}

            {/* Reset button on results */}
            {currentStep === 3 && (
              <button
                onClick={reset}
                className="w-full h-14 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Start Over
              </button>
            )}
          </div>
        </main>
      </div>
    </IridescenceLayout>
  );
}
