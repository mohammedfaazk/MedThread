// Application-wide constants for VitaVoice

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', code: 'en-IN' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' },
} as const;

export const EMERGENCY_KEYWORDS = {
  en: ['chest pain', 'breathing difficulty', 'unconscious', 'severe bleeding', 'stroke', 'heart attack', 'poisoning', 'snake bite'],
  ta: ['மார்பு வலி', 'மூச்சுத் திணறல்', 'மயக்கம்', 'கடுமையான இரத்தப்போக்கு', 'பக்கவாதம்'],
  te: ['ఛాతీ నొప్పి', 'శ్వాస ఇబ్బంది', 'అపస్మారక స్థితి', 'తీవ్రమైన రక్తస్రావం'],
  hi: ['सीने में दर्द', 'सांस लेने में कठिनाई', 'बेहोश', 'गंभीर रक्तस्राव', 'स्ट्रोक'],
  bn: ['বুকে ব্যথা', 'শ্বাসকষ্ট', 'অজ্ঞান', 'গুরুতর রক্তপাত'],
  kn: ['ಎದೆ ನೋವು', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಪ್ರಜ್ಞಾಹೀನತೆ', 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ'],
  ml: ['നെഞ്ചുവേദന', 'ശ്വാസതടസ്സം', 'അബോധാവസ്ഥ', 'കടുത്ത രക്തസ്രാവം'],
};

export const SEVERITY_THRESHOLDS = {
  LOW: { min: 0, max: 3, color: '#059669', label: 'Mild' },
  MEDIUM: { min: 4, max: 6, color: '#F59E0B', label: 'Moderate' },
  HIGH: { min: 7, max: 10, color: '#DC2626', label: 'Severe' },
} as const;

export const RISK_CATEGORIES = {
  SAFE_HOME_CARE: {
    label: 'Safe Home Care',
    color: '#059669',
    icon: 'home',
    description: 'Can be managed at home with rest and basic care',
  },
  VISIT_PHC: {
    label: 'Visit Health Center',
    color: '#F59E0B',
    icon: 'hospital',
    description: 'Should visit Primary Health Center within 24-48 hours',
  },
  EMERGENCY: {
    label: 'Emergency',
    color: '#DC2626',
    icon: 'alert',
    description: 'Seek immediate medical attention - Call 108',
  },
} as const;

export const COMMON_DISEASES = {
  FEVER_VIRAL: {
    name: 'Viral Fever',
    symptoms: ['fever', 'body ache', 'headache', 'fatigue', 'weakness'],
    duration: '3-7 days',
    severity: 'LOW',
  },
  DENGUE: {
    name: 'Dengue (Suspected)',
    symptoms: ['high fever', 'severe headache', 'pain behind eyes', 'joint pain', 'rash'],
    duration: '2-7 days',
    severity: 'MEDIUM',
  },
  MALARIA: {
    name: 'Malaria (Suspected)',
    symptoms: ['fever', 'chills', 'sweating', 'headache', 'nausea', 'vomiting'],
    duration: 'Recurring',
    severity: 'MEDIUM',
  },
  TYPHOID: {
    name: 'Typhoid (Suspected)',
    symptoms: ['prolonged fever', 'weakness', 'stomach pain', 'headache', 'loss of appetite'],
    duration: '1-3 weeks',
    severity: 'MEDIUM',
  },
  COLD_FLU: {
    name: 'Common Cold/Flu',
    symptoms: ['runny nose', 'cough', 'sore throat', 'mild fever', 'sneezing'],
    duration: '5-7 days',
    severity: 'LOW',
  },
  PNEUMONIA: {
    name: 'Pneumonia (Suspected)',
    symptoms: ['cough', 'fever', 'breathing difficulty', 'chest pain', 'fatigue'],
    duration: '1-3 weeks',
    severity: 'HIGH',
  },
  DIARRHEA: {
    name: 'Diarrhea/Gastroenteritis',
    symptoms: ['loose stools', 'stomach pain', 'nausea', 'vomiting', 'dehydration'],
    duration: '1-3 days',
    severity: 'MEDIUM',
  },
  DEHYDRATION: {
    name: 'Dehydration',
    symptoms: ['dry mouth', 'dizziness', 'dark urine', 'weakness', 'reduced urination'],
    duration: 'Immediate',
    severity: 'MEDIUM',
  },
} as const;

export const EMERGENCY_AMBULANCE = '108';

export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.8, max: 1.0, label: 'High Confidence' },
  MEDIUM: { min: 0.5, max: 0.79, label: 'Medium Confidence' },
  LOW: { min: 0, max: 0.49, label: 'Low Confidence' },
} as const;
