import { useState, useRef, useEffect } from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Send, Volume2, AlertTriangle, MicOff, VolumeX } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { aiService } from '@/services/aiService';
import { speechService } from '@/services/speechService';
import { languageService } from '@/services/languageService';
import { emergencyDetector } from '@/services/emergencyDetector';
import { debugGeminiAPI } from '@/utils/debugApi';

export const Chat = () => {
  const navigate = useNavigate();
  const { chatHistory, addChatMessage, isOnline, selectedLanguageCode, autoPlay, setAutoPlay } = useApp();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [emergencyDetected, setEmergencyDetected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    // When language changes, update the greeting message but only speak it on first mount
    const welcomeText = t('greeting');
    
    // Only show greeting and speak it on the very first mount
    if (isFirstMountRef.current) {
      addChatMessage({
        sender: 'assistant',
        text: welcomeText,
        hasVoice: true
      });

      // Speak welcome message only on first mount if autoPlay is enabled
      if (autoPlay && speechService.isSpeechSynthesisSupported()) {
        if (selectedLanguageCode === 'ta' && !speechService.hasVoicesForLanguage('ta')) {
          speechService.speakUsingGoogleTranslate(welcomeText, 'ta');
        } else {
          speechService.speak(welcomeText, { language: selectedLanguageCode });
        }
      }

      isFirstMountRef.current = false;
    }

    // Debug API on component mount (only in development)
    if (import.meta.env.DEV) {
      console.log('🔧 Running Gemini API debug check...');
      debugGeminiAPI().then(success => {
        console.log('API Debug result:', success ? '✅ Working' : '❌ Failed');
      });
    }
  }, [selectedLanguageCode]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addChatMessage({
      sender: 'user',
      text: userMessage,
      hasVoice: false
    });

    // Check for emergency
    const emergencyCheck = emergencyDetector.detectEmergency([], userMessage);
    if (emergencyCheck.isEmergency) {
      setEmergencyDetected(true);
      const emergencyMsg = emergencyCheck.protocol?.warningMessage ||
        t('emergency_call');

      addChatMessage({
        sender: 'assistant',
        text: emergencyMsg,
        hasVoice: true
      });

      if (autoPlay) {
        if (selectedLanguageCode === 'ta' && !speechService.hasVoicesForLanguage('ta')) {
          speechService.speakUsingGoogleTranslate(emergencyMsg, 'ta');
        } else {
          speechService.speak(emergencyMsg, { rate: 0.8, language: selectedLanguageCode });
        }
      }

      // Navigate to emergency screen after brief delay
      setTimeout(() => {
        navigate('/emergency');
      }, 3000);
      return;
    }

    // Get AI response
    setIsProcessing(true);
    try {
      console.log('🤖 Sending message to AI service:', userMessage);
      console.log('🔍 AI Service available:', aiService.isAvailable());

      const response = await aiService.chat(userMessage, undefined, selectedLanguageCode as any);
      console.log('✅ AI Response received:', response);

      addChatMessage({
        sender: 'assistant',
        text: response.text,
        hasVoice: true
      });

      // Speak response only if autoPlay is enabled
      if (autoPlay && speechService.isSpeechSynthesisSupported()) {
        // Use fallback for Tamil if no voices available
        if (selectedLanguageCode === 'ta' && !speechService.hasVoicesForLanguage('ta')) {
          speechService.speakUsingGoogleTranslate(response.text, 'ta');
        } else {
          speechService.speak(response.text, { language: selectedLanguageCode });
        }
      }
    } catch (error) {
      console.error('❌ Chat error details:', error);

      // More detailed error message
      let errorMsg = 'I apologize, I had trouble processing that. ';
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          errorMsg += 'There seems to be an issue with the AI service. ';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMsg += 'Please check your internet connection. ';
        }
      }
      errorMsg += 'Could you please try again?';

      addChatMessage({
        sender: 'assistant',
        text: errorMsg,
        hasVoice: true
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      // Stop listening
      speechService.stopListening();
      setIsListening(false);
    } else {
      // Start listening
      if (!speechService.isSpeechRecognitionSupported()) {
        alert('Speech recognition is not supported in your browser. Please type your message.');
        return;
      }

      setIsListening(true);
      speechService.startListening(
        (transcript, isFinal) => {
          setInput(transcript);
          if (isFinal) {
            setIsListening(false);
            // Auto-send after final transcript
            setTimeout(() => {
              if (transcript.trim()) {
                handleSend();
              }
            }, 500);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          alert('Could not access microphone. Please check permissions.');
        }
      );
    }
  };

  const handlePlayVoice = (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Use fallback for Tamil if no voices available
      if (selectedLanguageCode === 'ta' && !speechService.hasVoicesForLanguage('ta')) {
        speechService.speakUsingGoogleTranslate(text, 'ta', {
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } else {
        speechService.speak(text, {
          rate: 0.9,
          language: selectedLanguageCode,
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }
  };
  
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </motion.button>
        <div>
          <h1 className="font-semibold text-lg text-[#1E293B]">{t('kendall')}</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#059669]' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isOnline ? t('online') : t('offline_mode_label')}
            </span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setAutoPlay(!autoPlay)}
          className={`ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            autoPlay ? 'bg-[#2563EB]/10' : 'bg-red-100'
          }`}
          title={autoPlay ? t('disable_audio') : t('enable_audio')}
        >
          {autoPlay ? (
            <Volume2 className="w-5 h-5 text-[#2563EB]" />
          ) : (
            <VolumeX className="w-5 h-5 text-red-600" />
          )}
        </motion.button>

        {/* Debug button (only in development) */}
        {import.meta.env.DEV && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => debugGeminiAPI()}
            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"
            title="Debug API"
          >
            <span className="text-xs">🔧</span>
          </motion.button>
        )}
      </div>

      {/* Emergency Banner */}
      <AnimatePresence>
        {emergencyDetected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#DC2626] text-white px-4 py-3 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm font-semibold">{t('emergency_detected')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {chatHistory.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${message.sender === 'user'
                  ? 'bg-[#2563EB] text-white rounded-tr-sm'
                  : 'bg-white text-[#1E293B] rounded-tl-sm shadow-sm border border-gray-100'
                  }`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.hasVoice && message.sender === 'assistant' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayVoice(message.text)}
                  className="mt-2 flex items-center gap-2 text-xs text-[#2563EB] font-medium"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </motion.button>
              )}
              <span className="text-xs text-gray-500 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-[#2563EB] rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{t('processing')}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Waveform when recording */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 60 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-center gap-1"
          >
            <span className="text-sm text-[#2563EB] font-medium mr-3">
              {t('listening')}
            </span>
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [12, 32, 12] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-[#2563EB] rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('speak_now')}
              disabled={isListening || isProcessing}
              className="flex-1 bg-transparent outline-none text-base text-[#1E293B] placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceToggle}
            disabled={isProcessing}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${isListening ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </motion.button>
          {input && !isListening && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isProcessing}
              className="w-14 h-14 rounded-full bg-[#059669] flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <Send className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
