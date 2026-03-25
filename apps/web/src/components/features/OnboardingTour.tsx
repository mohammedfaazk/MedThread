'use client';

import React, { useState, useEffect } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'welcome',
    title: 'Welcome to MedThread! 👋',
    content: 'MedThread connects you with verified doctors and a supportive health community. Let us show you around.',
    position: 'bottom'
  },
  {
    target: 'search',
    title: 'Find Doctors 🔍',
    content: 'Search for doctors by specialty, location, or experience. You can filter by ratings and languages too.',
    position: 'bottom'
  },
  {
    target: 'create-post',
    title: 'Ask Questions 💬',
    content: 'Share your health concerns and get advice from verified doctors. Your posts are private and secure.',
    position: 'left'
  },
  {
    target: 'chat',
    title: 'Direct Messaging 📨',
    content: 'Chat directly with doctors for personalized advice. All conversations are confidential.',
    position: 'left'
  },
  {
    target: 'profile',
    title: 'Your Health Profile 👤',
    content: 'Complete your health profile to get better recommendations and personalized care.',
    position: 'left'
  },
  {
    target: 'emergency',
    title: '🚨 Emergency Help',
    content: 'For medical emergencies, always call 112 (India) or 911 (US). This platform is not for emergencies.',
    position: 'bottom'
  }
];

export const OnboardingTour: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('onboarding_tour_completed');
    if (!tourCompleted) {
      setTimeout(() => setIsActive(true), 1000);
    } else {
      setIsCompleted(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setIsActive(false);
    setIsCompleted(true);
  };

  if (!isActive || isCompleted) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleSkip} />

      {/* Tour Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 max-w-md w-full z-50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Skip Tour
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">{step.content}</p>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Accessibility note for elderly users */}
        {currentStep === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            💡 <strong>Tip:</strong> You can restart this tour anytime from Settings → Help
          </div>
        )}
      </div>
    </>
  );
};
