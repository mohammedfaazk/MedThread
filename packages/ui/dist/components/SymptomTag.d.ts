import React from 'react';
interface SymptomTagProps {
    label: string;
    category?: 'general' | 'urgent' | 'chronic';
}
export declare const SymptomTag: React.FC<SymptomTagProps>;
export {};
