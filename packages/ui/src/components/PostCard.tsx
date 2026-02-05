import React from 'react';

interface PostCardProps {
  patientUsername: string;
  symptoms: string[];
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  doctorResponseCount: number;
  replyCount: number;
  upvotes: number;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  patientUsername,
  symptoms,
  severity,
  doctorResponseCount,
  replyCount,
  upvotes,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#FFF3E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {patientUsername[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 600 }}>{patientUsername}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {symptoms.map((symptom, idx) => (
          <span key={idx} style={{
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: '#FFF3E8',
            color: '#FF8C42',
            fontSize: '14px'
          }}>
            {symptom}
          </span>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4B5563' }}>
        <span>💬 {replyCount} replies</span>
        {doctorResponseCount > 0 && (
          <span style={{ color: '#FF8C42', fontWeight: 600 }}>
            ✓ {doctorResponseCount} doctor responses
          </span>
        )}
        <span>👍 {upvotes}</span>
      </div>
    </div>
  );
};
