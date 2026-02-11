import React from 'react';

interface SymptomTagProps {
  label: string;
  category?: 'general' | 'urgent' | 'chronic';
}

export const SymptomTag: React.FC<SymptomTagProps> = ({ label, category = 'general' }) => {
  const colors = {
    general: { bg: 'rgba(255, 209, 102, 0.15)', text: '#2D2D2D' },
    urgent: { bg: 'rgba(254, 226, 226, 0.8)', text: '#DC2626' },
    chronic: { bg: 'rgba(224, 242, 254, 0.8)', text: '#2563EB' }
  };
  
  const color = colors[category];
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '999px',
      backgroundColor: color.bg,
      color: color.text,
      fontSize: '14px',
      fontWeight: 500,
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {label}
    </span>
  );
};
