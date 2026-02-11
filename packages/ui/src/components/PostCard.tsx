import React from 'react';
import { MessageCircle, CheckCircle, ThumbsUp } from 'lucide-react';

interface PostCardProps {
  patientUsername: string;
  symptoms: string[];
  doctorResponseCount: number;
  replyCount: number;
  upvotes: number;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  patientUsername,
  symptoms,
  doctorResponseCount,
  replyCount,
  upvotes,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 209, 102, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          color: '#2D2D2D',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
        }}>
          {patientUsername[0].toUpperCase()}
        </div>
        <span style={{ fontWeight: 600, color: '#2D2D2D' }}>{patientUsername}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {symptoms.map((symptom, idx) => (
          <span key={idx} style={{
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 209, 102, 0.15)',
            color: '#2D2D2D',
            fontSize: '14px',
            fontWeight: 500
          }}>
            {symptom}
          </span>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4B5563', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MessageCircle style={{ width: '16px', height: '16px' }} />
          {replyCount} replies
        </span>
        {doctorResponseCount > 0 && (
          <span style={{ color: '#FFD166', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle style={{ width: '16px', height: '16px' }} />
            {doctorResponseCount} doctor responses
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ThumbsUp style={{ width: '16px', height: '16px' }} />
          {upvotes}
        </span>
      </div>
    </div>
  );
};
