export const EMERGENCY_KEYWORDS = {
  IMMEDIATE_DANGER: [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'chest pain', 'heart attack', 'cardiac arrest', 'can\'t breathe', 'cannot breathe',
    'difficulty breathing', 'choking', 'severe bleeding', 'bleeding heavily',
    'unconscious', 'passed out', 'seizure', 'convulsion', 'stroke', 'paralyzed',
    'overdose', 'poisoning', 'poisoned', 'severe burn', 'major trauma',
    'stabbed', 'shot', 'gunshot', 'severe injury', 'broken bone protruding'
  ],
  HIGH_URGENCY: [
    'severe pain', 'unbearable pain', 'excruciating pain', 'high fever', 'fever 104',
    'vomiting blood', 'blood in vomit', 'blood in stool', 'rectal bleeding',
    'severe headache', 'worst headache', 'vision loss', 'sudden blindness',
    'paralysis', 'can\'t move', 'confusion', 'disoriented', 'severe allergic reaction',
    'anaphylaxis', 'throat closing', 'swelling throat', 'severe abdominal pain',
    'pregnant and bleeding', 'miscarriage', 'labor pains'
  ],
  MENTAL_HEALTH_CRISIS: [
    'self harm', 'hurt myself', 'cutting myself', 'suicidal thoughts', 'suicide plan',
    'panic attack', 'severe anxiety', 'can\'t stop crying', 'psychotic episode',
    'hearing voices', 'hallucinating', 'want to hurt someone', 'violent thoughts',
    'manic episode', 'severe depression', 'can\'t go on'
  ]
};

export const EMERGENCY_HOTLINES = {
  INDIA: {
    emergency: '112',
    ambulance: '102',
    mentalHealth: '9152987821',
    womenHelpline: '1091',
    childHelpline: '1098'
  },
  US: {
    emergency: '911',
    suicidePrevention: '988',
    mentalHealth: '988'
  },
  UK: {
    emergency: '999',
    nhs: '111',
    samaritans: '116123'
  }
};

export type EmergencyLevel = 'IMMEDIATE' | 'HIGH' | 'MENTAL_HEALTH' | null;

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  level: EmergencyLevel;
  matchedKeywords: string[];
  confidence: number;
}
