import React from 'react';

interface SymptomTagProps {
  label: string;
  category?: 'general' | 'urgent' | 'chronic';
}

export const SymptomTag: React.FC<SymptomTagProps> = ({ label, category = 'general' }) => {
  const colors = {
    general: { bg: '#FFF3E8', text: '#FF8C42' },
    urgent: { bg: '#FEE2E2', text: '#E5484D' },
    chronic: { bg: '#E0F2FE', text: '#2F6FED' }
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
      fontWeight: 500
    }}>
      {label}
    </span>
  );
};
