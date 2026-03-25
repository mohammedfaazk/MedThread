'use client';

import React, { useState } from 'react';

interface LiabilityWaiverModalProps {
  doctorId: string;
  patientId: string;
  interactionType: 'CONSULTATION' | 'ADVICE' | 'COMMENT' | 'POST_REPLY';
  onAccept: () => void;
  onReject: () => void;
}

export const LiabilityWaiverModal: React.FC<LiabilityWaiverModalProps> = ({
  doctorId,
  patientId,
  interactionType,
  onAccept,
  onReject
}) => {
  const [waiver, setWaiver] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  React.useEffect(() => {
    const fetchWaiver = async () => {
      try {
        const response = await fetch('/api/v1/liability/generate-waiver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctorId, patientId, interactionType })
        });
        const data = await response.json();
        setWaiver(data.waiver);
      } catch (error) {
        console.error('Failed to fetch waiver:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWaiver();
  }, [doctorId, patientId, interactionType]);

  const handleAccept = async () => {
    try {
      await fetch('/api/v1/liability/accept-waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          patientId,
          interactionType,
          waiverText: waiver
        })
      });
      setAccepted(true);
      onAccept();
    } catch (error) {
      console.error('Failed to accept waiver:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Medical Liability Waiver</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading waiver...</div>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-64 overflow-y-auto text-sm whitespace-pre-wrap">
                {waiver}
              </div>

              <div className="flex items-start gap-3 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="accept"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="accept" className="text-sm">
                  I have read and understand this waiver. I acknowledge the risks and limitations of online medical consultation.
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onReject}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!accepted}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Accept & Continue
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
