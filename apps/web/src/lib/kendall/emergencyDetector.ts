// Emergency detection — pure client-side, no API required

export interface EmergencyProtocol {
  condition: string
  warning: string
  actions: string[]
}

const PROTOCOLS: Record<string, EmergencyProtocol> = {
  CHEST_PAIN: {
    condition: 'Chest Pain / Possible Heart Attack',
    warning: 'This could be a heart attack. Call emergency services (911/108) immediately!',
    actions: [
      'Sit down and rest immediately',
      'Loosen tight clothing',
      'Chew one aspirin tablet if not allergic',
      'Stay calm and breathe slowly',
    ],
  },
  BREATHING_DIFFICULTY: {
    condition: 'Severe Breathing Difficulty',
    warning: 'Severe breathing difficulty requires immediate medical attention!',
    actions: [
      'Sit upright in a comfortable position',
      'Loosen clothing around neck and chest',
      'Open windows for fresh air',
      'Use inhaler if available',
    ],
  },
  HIGH_FEVER: {
    condition: 'Very High Fever (Above 103°F / 39.5°C)',
    warning: 'Very high fever can be dangerous. Seek medical help immediately!',
    actions: [
      'Remove excess clothing',
      'Apply cool damp cloth to forehead',
      'Drink plenty of water',
      'Take paracetamol if available',
    ],
  },
  UNCONSCIOUS: {
    condition: 'Unconsciousness',
    warning: 'Person is unconscious. Call emergency services (911/108) immediately!',
    actions: [
      'Check if person is breathing',
      'Place in recovery position (on side)',
      'Do NOT give anything by mouth',
      'Keep airway clear',
    ],
  },
  SEVERE_BLEEDING: {
    condition: 'Severe Bleeding',
    warning: 'Severe bleeding is life-threatening. Call emergency services now!',
    actions: [
      'Apply direct pressure with clean cloth',
      'Elevate injured area above heart level',
      'Do NOT remove cloth if soaked — add more on top',
      'Keep person lying down and warm',
    ],
  },
  STROKE: {
    condition: 'Possible Stroke',
    warning: 'FAST: Face drooping, Arm weakness, Speech difficulty — Call 911/108 NOW!',
    actions: [
      'Note the time symptoms started',
      'Keep person lying down, head slightly elevated',
      'Do NOT give food or water',
      'Stay with the person',
    ],
  },
  PREGNANCY_EMERGENCY: {
    condition: 'Pregnancy Emergency',
    warning: 'Pregnancy complications need immediate medical care. Call 911/108!',
    actions: [
      'Keep pregnant woman lying on her left side',
      'Keep her calm and comfortable',
      'Do NOT give anything by mouth',
      'Note any bleeding or fluid discharge',
    ],
  },
  POISONING: {
    condition: 'Poisoning / Toxic Ingestion',
    warning: 'Poisoning is a medical emergency. Call 911/108 immediately!',
    actions: [
      'Identify what was consumed if possible',
      'Do NOT induce vomiting',
      'Keep person sitting or lying on their side',
      'Save container/packaging of substance',
    ],
  },
  SNAKE_BITE: {
    condition: 'Snake Bite',
    warning: 'Snake bite requires anti-venom. Get to hospital immediately!',
    actions: [
      'Keep person calm and still',
      'Remove jewelry and tight clothing from affected area',
      'Keep bitten area below heart level',
      'Do NOT apply ice or tourniquet',
    ],
  },
}

// Keyword → protocol key mapping
const KEYWORD_MAP: Array<{ keywords: string[]; protocol: string }> = [
  {
    keywords: ['chest pain', 'heart attack', 'chest tightness', 'chest pressure', 'heart pain', 'cardiac arrest', 'my heart'],
    protocol: 'CHEST_PAIN',
  },
  {
    keywords: ["can't breathe", 'cannot breathe', 'breathing difficulty', 'difficulty breathing', 'shortness of breath', 'not breathing', 'choking', 'suffocating', 'gasping'],
    protocol: 'BREATHING_DIFFICULTY',
  },
  {
    keywords: ['high fever', 'very high temperature', '103', '104', '105', '106', '40 degree', '41 degree', 'burning fever', 'extreme fever'],
    protocol: 'HIGH_FEVER',
  },
  {
    keywords: ['unconscious', 'fainted', 'passed out', 'unresponsive', 'not waking up', 'collapsed', 'blacked out'],
    protocol: 'UNCONSCIOUS',
  },
  {
    keywords: ['severe bleeding', 'heavy bleeding', 'bleeding badly', 'blood everywhere', 'bleeding out', 'blood won\'t stop', 'deep cut', 'gushing blood'],
    protocol: 'SEVERE_BLEEDING',
  },
  {
    keywords: ['stroke', 'face drooping', 'arm weakness', 'slurred speech', 'sudden numbness', 'sudden confusion', 'sudden vision loss', 'sudden severe headache'],
    protocol: 'STROKE',
  },
  {
    keywords: ['pregnant bleeding', 'pregnancy emergency', 'labor pain', 'water broke', 'miscarriage', 'pregnant and bleeding', 'contractions'],
    protocol: 'PREGNANCY_EMERGENCY',
  },
  {
    keywords: ['poisoning', 'overdose', 'swallowed poison', 'toxic', 'ingested', 'drank bleach', 'drug overdose', 'pill overdose', 'swallowed pills'],
    protocol: 'POISONING',
  },
  {
    keywords: ['snake bite', 'snakebite', 'bitten by snake', 'snake attack', 'venomous bite', 'snake venom'],
    protocol: 'SNAKE_BITE',
  },
  // Seizure maps to unconscious/breathing
  {
    keywords: ['seizure', 'convulsion', 'epilepsy attack', 'fitting', 'shaking uncontrollably'],
    protocol: 'UNCONSCIOUS',
  },
]

export function detectEmergency(userInput: string): {
  isEmergency: boolean
  protocol?: EmergencyProtocol
  matchedKeywords?: string[]
} {
  const lower = userInput.toLowerCase()
  const matched: string[] = []
  let detectedProtocolKey: string | null = null

  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        matched.push(kw)
        if (!detectedProtocolKey) detectedProtocolKey = entry.protocol
      }
    }
  }

  if (matched.length === 0) return { isEmergency: false }

  return {
    isEmergency: true,
    protocol: PROTOCOLS[detectedProtocolKey!],
    matchedKeywords: matched,
  }
}
