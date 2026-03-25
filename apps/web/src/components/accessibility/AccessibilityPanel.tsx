'use client';

import { useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import {
  Eye,
  Type,
  Globe,
  Mic,
  Zap,
  Settings,
  X,
  Plus,
  Minus,
  Check
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    toggleHighContrast,
    toggleSimpleMode,
    increaseFontSize,
    decreaseFontSize,
    setLanguage,
    updateSettings
  } = useAccessibility();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Accessibility Settings</h2>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Visual Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Visual Settings
                </h3>

                <div className="space-y-4">
                  {/* High Contrast Mode */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">High Contrast Mode</h4>
                      <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                    </div>
                    <button
                      onClick={toggleHighContrast}
                      className={`relative w-14 h-8 rounded-full transition ${
                        settings.highContrastMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle high contrast mode"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.highContrastMode ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Simple Mode */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Simple Mode</h4>
                      <p className="text-sm text-gray-600">Simplified interface for easier navigation</p>
                    </div>
                    <button
                      onClick={toggleSimpleMode}
                      className={`relative w-14 h-8 rounded-full transition ${
                        settings.simpleMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle simple mode"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.simpleMode ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Font Size */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Type className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">Font Size</h4>
                      </div>
                      <span className="text-sm text-gray-600 capitalize">{settings.fontSize}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decreaseFontSize}
                        disabled={settings.fontSize === 'small'}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Decrease font size"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{
                            width: `${
                              { small: 25, medium: 50, large: 75, xlarge: 100 }[settings.fontSize]
                            }%`
                          }}
                        />
                      </div>
                      <button
                        onClick={increaseFontSize}
                        disabled={settings.fontSize === 'xlarge'}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Increase font size"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Reduce Motion</h4>
                      <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                      className={`relative w-14 h-8 rounded-full transition ${
                        settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle reduced motion"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.reducedMotion ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Language Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Language
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-3 rounded-xl border-2 transition text-left ${
                        settings.language === lang.code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{lang.native}</p>
                          <p className="text-xs text-gray-600">{lang.name}</p>
                        </div>
                        {settings.language === lang.code && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Voice & Audio */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                  Voice & Audio
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Voice Input</h4>
                      <p className="text-sm text-gray-600">Use voice to send messages</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
                      className={`relative w-14 h-8 rounded-full transition ${
                        settings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle voice input"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.voiceEnabled ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Screen Reader Optimization</h4>
                      <p className="text-sm text-gray-600">Optimize for screen readers</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({ screenReaderOptimized: !settings.screenReaderOptimized })
                      }
                      className={`relative w-14 h-8 rounded-full transition ${
                        settings.screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle screen reader optimization"
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          settings.screenReaderOptimized ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      updateSettings({
                        highContrastMode: false,
                        simpleMode: false,
                        fontSize: 'medium',
                        reducedMotion: false
                      });
                    }}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-left"
                  >
                    <p className="font-medium text-gray-900">Reset to Default</p>
                    <p className="text-xs text-gray-600">Restore default settings</p>
                  </button>

                  <button
                    onClick={() => {
                      updateSettings({
                        highContrastMode: true,
                        simpleMode: true,
                        fontSize: 'xlarge',
                        reducedMotion: true
                      });
                    }}
                    className="p-4 bg-blue-100 hover:bg-blue-200 rounded-xl transition text-left"
                  >
                    <p className="font-medium text-gray-900">Maximum Accessibility</p>
                    <p className="text-xs text-gray-600">Enable all features</p>
                  </button>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
