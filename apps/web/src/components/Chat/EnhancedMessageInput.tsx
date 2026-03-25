'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Loader2, Globe } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { useTypingIndicator } from '@/hooks/useSocket';
import { useTranslation } from '@/hooks/useTranslation';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface EnhancedMessageInputProps {
  conversationId: string;
  userId: string;
  username: string;
  onSend: (message: string) => void;
  placeholder?: string;
}

export function EnhancedMessageInput({
  conversationId,
  userId,
  username,
  onSend,
  placeholder = 'Type a message...'
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { startTyping, stopTyping } = useTypingIndicator(conversationId, userId, username);
  const { translate, isTranslating, currentLanguage } = useTranslation();
  const { settings } = useAccessibility();

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Trigger typing indicator
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    stopTyping();

    try {
      // Translate if needed
      let finalMessage = message;
      if (currentLanguage !== 'en' && settings.language !== 'en') {
        // Optionally translate to English for storage
        // finalMessage = await translate(message, 'en');
      }

      await onSend(finalMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + text);
    setShowVoiceInput(false);
    
    // Focus back on textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Voice Input Modal */}
      {showVoiceInput && (
        <div className="mb-4">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            language={currentLanguage}
          />
          <button
            onClick={() => setShowVoiceInput(false)}
            className="mt-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Language Indicator */}
      {currentLanguage !== 'en' && (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
          <Globe className="w-3 h-3" />
          <span>Messages will be in {currentLanguage.toUpperCase()}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Voice Button */}
        {settings.voiceEnabled && (
          <button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            className={`p-3 rounded-full transition ${
              showVoiceInput
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={stopTyping}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
          
          {/* Character Count (optional) */}
          {message.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {message.length}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || isTranslating}
          className={`p-3 rounded-full transition ${
            message.trim() && !isSending && !isTranslating
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isSending || isTranslating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
