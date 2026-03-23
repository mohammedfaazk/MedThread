'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface DiaryEntryProps {
  entry: {
    id: string;
    symptomType: string;
    bodyPart?: string;
    photos: any[];
    userNotes?: string;
    severity: number;
    painLevel?: number;
    isResolved: boolean;
    createdAt: Date;
    resolvedAt?: Date;
  };
  onUpdate: (entryId: string, updates: any) => void;
  onAddPhoto: (entryId: string, photo: File) => void;
  onResolve: (entryId: string) => void;
}

export default function DiaryEntry({ entry, onUpdate, onAddPhoto, onResolve }: DiaryEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-600 bg-red-50';
    if (severity >= 5) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 8) return 'Severe';
    if (severity >= 5) return 'Moderate';
    return 'Mild';
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                {getSeverityLabel(entry.severity)}
              </div>
              {entry.isResolved && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
                  ✓ Resolved
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {entry.symptomType}
            </h3>
            
            {entry.bodyPart && (
              <p className="text-sm text-gray-600 mb-2">
                Location: {entry.bodyPart}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
              {entry.photos.length > 0 && (
                <span>📷 {entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}</span>
              )}
              {entry.painLevel && (
                <span>Pain: {entry.painLevel}/10</span>
              )}
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600">
            <svg
              className={`w-6 h-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4 space-y-4">
            {/* User Notes */}
            {entry.userNotes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700">{entry.userNotes}</p>
              </div>
            )}

            {/* Photos */}
            {entry.photos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {entry.photos.map((photo: any, index: number) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {photo.aiAnalysis && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          AI Analyzed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                📷 Add Photo
              </button>
              
              {!entry.isResolved && (
                <button
                  onClick={() => onResolve(entry.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  ✓ Mark Resolved
                </button>
              )}
              
              <button
                onClick={() => {/* Edit functionality */}}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
