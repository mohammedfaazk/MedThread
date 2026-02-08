import React from 'react';
import { CheckCircle, ThumbsUp } from 'lucide-react';

interface ThreadReplyProps {
  authorName: string;
  authorRole: string;
  content: string;
  isDoctorVerified: boolean;
  helpfulCount: number;
  depth?: number;
}

export const ThreadReply: React.FC<ThreadReplyProps> = ({
  authorName,
  authorRole,
  content,
  isDoctorVerified,
  helpfulCount,
  depth = 0
}) => {
  const isDoctor = authorRole === 'VERIFIED_DOCTOR';
  
  return (
    <div style={{
      marginLeft: `${depth * 24}px`,
      borderLeft: depth > 0 ? '2px solid rgba(229, 231, 235, 0.5)' : 'none',
      paddingLeft: depth > 0 ? '16px' : '0',
      marginTop: '16px'
    }}>
      <div style={{
        backgroundColor: isDoctor ? 'rgba(255, 241, 224, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '16px',
        border: isDoctor ? '2px solid rgba(255, 209, 102, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, color: '#2D2D2D' }}>{authorName}</span>
          {isDoctorVerified && (
            <span style={{
              backgroundColor: '#2D2D2D',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle style={{ width: '12px', height: '12px' }} />
              Verified Doctor
            </span>
          )}
        </div>
        <p style={{ margin: 0, lineHeight: 1.6, color: '#374151' }}>{content}</p>
        <div style={{ 
          marginTop: '12px', 
          fontSize: '14px', 
          color: '#4B5563',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ThumbsUp style={{ width: '16px', height: '16px' }} />
          {helpfulCount} helpful
        </div>
      </div>
    </div>
  );
};
