'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  purpose?: string;
}

interface MedicationListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: string) => void;
  onAddReminder: (medication: Medication) => void;
}

export default function MedicationList({
  medications,
  onEdit,
  onDelete,
  onAddReminder
}: MedicationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getFrequencyDisplay = (frequency: string) => {
    const map: Record<string, string> = {
      'ONCE_DAILY': 'Once daily',
      'TWICE_DAILY': 'Twice daily',
      'THREE_TIMES_DAILY': '3 times daily',
      'FOUR_TIMES_DAILY': '4 times daily',
      'WEEKLY': 'Once weekly',
      'AS_NEEDED': 'As needed'
    };
    return map[frequency] || frequency;
  };

  if (medications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="text-6xl mb-4">💊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Medications Yet</h3>
        <p className="text-gray-600">Add your first medication to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medications.map((med) => (
        <div
          key={med.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <div
            className="p-4 cursor-pointer"
            onClick={() => setExpandedId(expandedId === med.id ? null : med.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    💊
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                </div>
                
                <div className="ml-15 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Frequency:</span>
                    <span>{getFrequencyDisplay(med.frequency)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Started:</span>
                    <span>{format(new Date(med.startDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>

              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expandedId === med.id ? null : med.id);
                }}
              >
                <svg
                  className={`w-6 h-6 transition-transform ${expandedId === med.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === med.id && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4 space-y-3">
                {med.purpose && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Purpose:</span>
                    <p className="text-sm text-gray-600 mt-1">{med.purpose}</p>
                  </div>
                )}
                
                {med.prescribedBy && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Prescribed by:</span>
                    <p className="text-sm text-gray-600 mt-1">{med.prescribedBy}</p>
                  </div>
                )}

                {med.endDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">End date:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(med.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onAddReminder(med)}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                  >
                    🔔 Set Reminder
                  </button>
                  <button
                    onClick={() => onEdit(med)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${med.name}?`)) {
                        onDelete(med.id);
                      }
                    }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
