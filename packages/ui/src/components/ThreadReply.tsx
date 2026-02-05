import React from 'react';

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
      borderLeft: depth > 0 ? '2px solid #E5E7EB' : 'none',
      paddingLeft: depth > 0 ? '16px' : '0',
      marginTop: '16px'
    }}>
      <div style={{
        backgroundColor: isDoctor ? '#FFF3E8' : '#FFFFFF',
        borderRadius: '16px',
        padding: '16px',
        border: isDoctor ? '2px solid #FF8C42' : '1px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600 }}>{authorName}</span>
          {isDoctorVerified && (
            <span style={{
              backgroundColor: '#FF8C42',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '12px'
            }}>
              ✓ Verified Doctor
            </span>
          )}
        </div>
        <p style={{ margin: 0, lineHeight: 1.6 }}>{content}</p>
        <div style={{ marginTop: '12px', fontSize: '14px', color: '#4B5563' }}>
          👍 {helpfulCount} helpful
        </div>
      </div>
    </div>
  );
};
