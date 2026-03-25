'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
}

export function VoiceInput({ onTranscript, language = 'en', className = '' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable microphone permissions.');
      } else {
        setError('Speech recognition error. Please try again.');
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      setError('');
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDone = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
      setInterimTranscript('');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError('');
  };

  return (
    <div className={`voice-input ${className}`}>
      {/* Recording Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!error && error.includes('not supported')}
          className={`relative p-4 rounded-full transition-all ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 animate-pulse'
              : error && error.includes('not supported')
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white shadow-lg hover:shadow-xl disabled:opacity-50`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Status Text */}
        <div className="flex-1">
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Listening...</span>
            </div>
          )}
          {!isRecording && !transcript && !error && (
            <span className="text-sm text-gray-600">Tap to start voice input</span>
          )}
        </div>
      </div>

      {/* Live Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {isRecording ? 'Listening...' : 'Transcribed'}
                </span>
              </div>
              <p className="text-gray-900">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-500 italic">{interimTranscript}</span>
                )}
              </p>
            </div>
            {!isRecording && transcript && (
              <button
                onClick={clearTranscript}
                className="p-1 hover:bg-blue-100 rounded-lg transition"
                aria-label="Clear transcript"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          
          {/* Done button */}
          {!isRecording && transcript && (
            <button
              onClick={handleDone}
              className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Use This Text
            </button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="p-1 hover:bg-red-100 rounded-lg transition"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !transcript && !error && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-900">
            💡 Tip: Speak clearly and the text will appear in real-time. Click "Use This Text" when done.
          </p>
        </div>
      )}
    </div>
  );
}
