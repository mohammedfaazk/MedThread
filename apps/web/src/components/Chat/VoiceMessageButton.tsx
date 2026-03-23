'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';
import { VoiceRecorder } from '../VoiceRecorder';

interface VoiceMessageButtonProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
}

export function VoiceMessageButton({ onSend }: VoiceMessageButtonProps) {
  const [showRecorder, setShowRecorder] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async (audioBlob: Blob, duration: number) => {
    setSending(true);
    try {
      await onSend(audioBlob, duration);
      setShowRecorder(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert('Failed to send voice message');
    } finally {
      setSending(false);
    }
  };

  if (showRecorder) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <h3 className="text-lg font-semibold mb-4">Record Voice Message</h3>
          <VoiceRecorder
            onSend={handleSend}
            onCancel={() => setShowRecorder(false)}
          />
          {sending && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Sending voice message...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowRecorder(true)}
      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Send voice message"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
}
