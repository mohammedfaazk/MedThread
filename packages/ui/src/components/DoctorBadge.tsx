import React from 'react';

interface DoctorBadgeProps {
  doctorName: string;
  specialty?: string;
  reputationScore: number;
}

export const DoctorBadge: React.FC<DoctorBadgeProps> = ({ 
  doctorName, 
  specialty, 
  reputationScore 
}) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '999px',
      border: '2px solid #FF8C42',
      backgroundColor: '#FFFFFF'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#FF8C42',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        ✓
      </div>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{doctorName}</div>
        {specialty && (
          <div style={{ fontSize: '12px', color: '#4B5563' }}>{specialty}</div>
        )}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#FF8C42',
        fontWeight: 600,
        marginLeft: '4px'
      }}>
        ⭐ {reputationScore}
      </div>
    </div>
  );
};
