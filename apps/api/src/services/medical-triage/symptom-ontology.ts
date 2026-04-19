/**
 * Medical Symptom Ontology
 * Based on SNOMED CT and ICD-10 classifications
 * Includes synonyms, variations, and medical terminology
 */

export interface SymptomDefinition {
  canonical: string;
  synonyms: string[];
  weight: number;
  category: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  relatedConditions: string[];
  redFlags?: string[];
}

export const SYMPTOM_ONTOLOGY: Record<string, SymptomDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════
  // CRITICAL (10) - IMMEDIATE LIFE THREAT
  // ═══════════════════════════════════════════════════════════════════════
  
  'chest_pain': {
    canonical: 'chest pain',
    synonyms: [
      'chest pain', 'chest discomfort', 'chest pressure', 'chest tightness',
      'crushing chest pain', 'squeezing chest', 'angina', 'cardiac pain',
      'precordial pain', 'retrosternal pain', 'substernal pain',
      'heart pain', 'pain in chest', 'chest hurts', 'chest ache',
      'heavy chest', 'elephant on chest', 'vise-like chest pain',
      'elephant sitting on chest', 'elephant on my chest', 'weight on chest',
      'elephant sitting on my chest', 'feels like elephant', 'like an elephant',
      'pressure on chest', 'tight chest', 'constricting chest'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['myocardial infarction', 'angina', 'aortic dissection', 'pulmonary embolism'],
    redFlags: ['radiating to arm', 'radiating to jaw', 'with sweating', 'with nausea']
  },

  'difficulty_breathing': {
    canonical: 'difficulty breathing',
    synonyms: [
      'difficulty breathing', 'shortness of breath', 'dyspnea', 'breathlessness',
      'can\'t breathe', 'hard to breathe', 'gasping', 'air hunger',
      'respiratory distress', 'SOB', 'breathing problems', 'labored breathing',
      'struggling to breathe', 'suffocating', 'choking sensation',
      'can\'t catch breath', 'winded', 'out of breath',
      'can\'t catch my breath', 'cannot breathe', 'trouble breathing',
      'breathing difficulty', 'hard time breathing'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['asthma', 'COPD', 'pulmonary embolism', 'pneumonia', 'heart failure'],
    redFlags: ['at rest', 'sudden onset', 'with chest pain', 'blue lips']
  },

  'altered_consciousness': {
    canonical: 'altered consciousness',
    synonyms: [
      'unconscious', 'unresponsive', 'not responding', 'passed out',
      'loss of consciousness', 'LOC', 'syncope', 'fainting', 'blacked out',
      'confused', 'disoriented', 'altered mental status', 'AMS',
      'not making sense', 'incoherent', 'delirious', 'stupor', 'coma'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['stroke', 'head injury', 'hypoglycemia', 'sepsis', 'overdose'],
    redFlags: ['sudden onset', 'with headache', 'after head injury', 'with fever']
  },

  'seizure': {
    canonical: 'seizure',
    synonyms: [
      'seizure', 'convulsion', 'fit', 'epileptic fit', 'shaking uncontrollably',
      'jerking movements', 'tonic-clonic', 'grand mal', 'status epilepticus',
      'convulsing', 'seizing', 'epilepsy attack'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['epilepsy', 'head injury', 'stroke', 'infection', 'withdrawal'],
    redFlags: ['first seizure', 'prolonged', 'multiple seizures', 'not recovering']
  },

  'severe_bleeding': {
    canonical: 'severe bleeding',
    synonyms: [
      'severe bleeding', 'hemorrhage', 'heavy bleeding', 'uncontrolled bleeding',
      'bleeding won\'t stop', 'blood loss', 'profuse bleeding', 'gushing blood',
      'spurting blood', 'arterial bleeding', 'massive bleeding'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['trauma', 'GI bleed', 'postpartum hemorrhage', 'coagulopathy'],
    redFlags: ['bright red', 'pulsating', 'soaking through', 'feeling faint']
  },

  'stroke_symptoms': {
    canonical: 'stroke symptoms',
    synonyms: [
      'stroke', 'CVA', 'brain attack', 'sudden weakness', 'facial drooping',
      'arm weakness', 'speech difficulty', 'slurred speech', 'face drooping',
      'one-sided weakness', 'hemiparesis', 'FAST symptoms', 'TIA',
      'sudden numbness', 'sudden confusion', 'sudden vision loss'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['ischemic stroke', 'hemorrhagic stroke', 'TIA'],
    redFlags: ['sudden onset', 'one-sided', 'with severe headache', 'time critical']
  },

  'anaphylaxis': {
    canonical: 'anaphylaxis',
    synonyms: [
      'anaphylaxis', 'severe allergic reaction', 'anaphylactic shock',
      'throat closing', 'tongue swelling', 'face swelling', 'hives all over',
      'difficulty swallowing', 'throat tightness', 'airway swelling'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['food allergy', 'drug allergy', 'insect sting'],
    redFlags: ['after exposure', 'rapid progression', 'with breathing difficulty', 'with hypotension']
  },

  'suicidal_ideation': {
    canonical: 'suicidal thoughts',
    synonyms: [
      'suicidal', 'suicidal thoughts', 'want to die', 'end my life',
      'kill myself', 'suicide plan', 'self harm', 'harm myself',
      'don\'t want to live', 'better off dead', 'suicidal ideation'
    ],
    weight: 10,
    category: 'CRITICAL',
    relatedConditions: ['depression', 'bipolar disorder', 'PTSD', 'substance abuse'],
    redFlags: ['with plan', 'with means', 'previous attempt', 'hopelessness']
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HIGH (7-9) - URGENT BUT NOT IMMEDIATELY LIFE-THREATENING
  // ═══════════════════════════════════════════════════════════════════════

  'severe_abdominal_pain': {
    canonical: 'severe abdominal pain',
    synonyms: [
      'severe abdominal pain', 'severe stomach pain', 'severe belly pain',
      'excruciating abdominal pain', 'unbearable stomach pain',
      'acute abdomen', 'abdominal emergency', 'sharp abdominal pain',
      'stabbing stomach pain', 'intense belly pain'
    ],
    weight: 9,
    category: 'HIGH',
    relatedConditions: ['appendicitis', 'bowel obstruction', 'perforation', 'ectopic pregnancy'],
    redFlags: ['rigid abdomen', 'rebound tenderness', 'with vomiting', 'with fever']
  },

  'high_fever': {
    canonical: 'high fever',
    synonyms: [
      'high fever', 'very high temperature', 'fever over 103', 'fever over 104',
      'burning up', 'extremely hot', 'hyperpyrexia', 'high grade fever',
      'temperature 39+', 'temperature 40+', 'fever won\'t break'
    ],
    weight: 8,
    category: 'HIGH',
    relatedConditions: ['infection', 'sepsis', 'meningitis', 'pneumonia'],
    redFlags: ['with stiff neck', 'with confusion', 'with rash', 'in infant']
  },

  'blood_in_stool': {
    canonical: 'blood in stool',
    synonyms: [
      'blood in stool', 'bloody stool', 'rectal bleeding', 'hematochezia',
      'melena', 'black tarry stool', 'bright red blood', 'dark stool',
      'blood when pooping', 'bloody diarrhea', 'GI bleeding'
    ],
    weight: 8,
    category: 'HIGH',
    relatedConditions: ['GI bleed', 'ulcer', 'colitis', 'diverticulosis', 'cancer'],
    redFlags: ['large amount', 'with dizziness', 'with pain', 'persistent']
  },

  'blood_in_urine': {
    canonical: 'blood in urine',
    synonyms: [
      'blood in urine', 'bloody urine', 'hematuria', 'red urine', 'pink urine',
      'blood when urinating', 'blood in pee', 'urine with blood'
    ],
    weight: 8,
    category: 'HIGH',
    relatedConditions: ['UTI', 'kidney stones', 'bladder cancer', 'kidney disease'],
    redFlags: ['painless', 'with clots', 'persistent', 'with flank pain']
  },

  'severe_headache': {
    canonical: 'severe headache',
    synonyms: [
      'severe headache', 'worst headache of life', 'thunderclap headache',
      'excruciating headache', 'unbearable headache', 'splitting headache',
      'intense head pain', 'sudden severe headache', 'explosive headache'
    ],
    weight: 9,
    category: 'HIGH',
    relatedConditions: ['subarachnoid hemorrhage', 'meningitis', 'stroke', 'migraine'],
    redFlags: ['sudden onset', 'with stiff neck', 'with fever', 'with vision changes']
  },

  'diabetic_emergency': {
    canonical: 'diabetic emergency',
    synonyms: [
      'diabetic emergency', 'blood sugar over 400', 'blood sugar under 50',
      'hypoglycemia', 'hyperglycemia', 'DKA', 'diabetic ketoacidosis',
      'very high blood sugar', 'very low blood sugar', 'sugar crisis'
    ],
    weight: 9,
    category: 'HIGH',
    relatedConditions: ['diabetes type 1', 'diabetes type 2', 'DKA', 'HHS'],
    redFlags: ['with confusion', 'with vomiting', 'fruity breath', 'not responding']
  },

  'severe_asthma': {
    canonical: 'severe asthma attack',
    synonyms: [
      'severe asthma', 'asthma attack', 'status asthmaticus', 'can\'t breathe asthma',
      'wheezing badly', 'inhaler not working', 'severe wheezing',
      'asthma emergency', 'acute asthma exacerbation'
    ],
    weight: 9,
    category: 'HIGH',
    relatedConditions: ['asthma', 'COPD', 'bronchospasm'],
    redFlags: ['inhaler ineffective', 'can\'t speak', 'blue lips', 'exhaustion']
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MEDIUM (4-6) - NEEDS ATTENTION WITHIN HOURS/DAYS
  // ═══════════════════════════════════════════════════════════════════════

  'fever': {
    canonical: 'fever',
    synonyms: [
      'fever', 'temperature', 'pyrexia', 'febrile', 'running a fever',
      'have a temperature', 'hot', 'feverish', 'elevated temperature',
      'temp', 'feeling hot', 'chills and fever'
    ],
    weight: 5,
    category: 'MEDIUM',
    relatedConditions: ['infection', 'flu', 'COVID-19', 'UTI'],
    redFlags: ['over 103F', 'with rash', 'with stiff neck', 'in infant']
  },

  'persistent_cough': {
    canonical: 'persistent cough',
    synonyms: [
      'persistent cough', 'chronic cough', 'cough won\'t go away',
      'coughing for weeks', 'constant cough', 'non-stop cough',
      'cough for months', 'lingering cough', 'prolonged cough'
    ],
    weight: 5,
    category: 'MEDIUM',
    relatedConditions: ['bronchitis', 'pneumonia', 'asthma', 'GERD', 'TB'],
    redFlags: ['with blood', 'with weight loss', 'night sweats', 'over 3 weeks']
  },

  'joint_pain': {
    canonical: 'joint pain',
    synonyms: [
      'joint pain', 'arthralgia', 'aching joints', 'painful joints',
      'joint ache', 'stiff joints', 'swollen joints', 'joint inflammation',
      'arthritis pain', 'knee pain', 'hip pain', 'shoulder pain'
    ],
    weight: 4,
    category: 'MEDIUM',
    relatedConditions: ['arthritis', 'gout', 'lupus', 'injury'],
    redFlags: ['with swelling', 'with redness', 'with fever', 'sudden onset']
  },

  'back_pain': {
    canonical: 'back pain',
    synonyms: [
      'back pain', 'backache', 'lower back pain', 'upper back pain',
      'spine pain', 'back hurts', 'lumbar pain', 'thoracic pain',
      'sciatica', 'back spasm', 'herniated disc pain'
    ],
    weight: 4,
    category: 'MEDIUM',
    relatedConditions: ['muscle strain', 'herniated disc', 'sciatica', 'kidney stones'],
    redFlags: ['with leg weakness', 'with numbness', 'with bowel/bladder changes', 'after trauma']
  },

  'abdominal_pain': {
    canonical: 'abdominal pain',
    synonyms: [
      'abdominal pain', 'stomach pain', 'belly pain', 'stomach ache',
      'tummy ache', 'gut pain', 'abdominal discomfort', 'stomach cramps',
      'belly ache', 'gastric pain', 'epigastric pain'
    ],
    weight: 5,
    category: 'MEDIUM',
    relatedConditions: ['gastritis', 'IBS', 'constipation', 'food poisoning'],
    redFlags: ['severe', 'with vomiting', 'with fever', 'rigid abdomen']
  },

  'dizziness': {
    canonical: 'dizziness',
    synonyms: [
      'dizziness', 'dizzy', 'lightheaded', 'vertigo', 'spinning sensation',
      'feeling faint', 'unsteady', 'off balance', 'room spinning',
      'woozy', 'giddy', 'balance problems', 'room is spinning',
      'everything spinning', 'world spinning', 'head spinning'
    ],
    weight: 5,
    category: 'MEDIUM',
    relatedConditions: ['vertigo', 'dehydration', 'low blood pressure', 'inner ear'],
    redFlags: ['with chest pain', 'with headache', 'with weakness', 'sudden onset']
  },

  'nausea_vomiting': {
    canonical: 'nausea and vomiting',
    synonyms: [
      'nausea', 'vomiting', 'throwing up', 'puking', 'feeling sick',
      'queasy', 'nauseated', 'sick to stomach', 'retching',
      'can\'t keep food down', 'emesis', 'vomit'
    ],
    weight: 4,
    category: 'MEDIUM',
    relatedConditions: ['gastroenteritis', 'food poisoning', 'migraine', 'pregnancy'],
    redFlags: ['with blood', 'severe', 'with abdominal pain', 'dehydration']
  },

  'headache': {
    canonical: 'headache',
    synonyms: [
      'headache', 'head pain', 'head hurts', 'cephalalgia',
      'migraine', 'tension headache', 'sinus headache',
      'pounding head', 'throbbing head', 'head ache'
    ],
    weight: 4,
    category: 'MEDIUM',
    relatedConditions: ['tension headache', 'migraine', 'sinusitis', 'hypertension'],
    redFlags: ['worst ever', 'sudden onset', 'with fever', 'with vision changes']
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LOW (1-3) - ROUTINE/WELLNESS
  // ═══════════════════════════════════════════════════════════════════════

  'common_cold': {
    canonical: 'cold',
    synonyms: [
      'cold', 'common cold', 'head cold', 'runny nose', 'stuffy nose',
      'congestion', 'sniffles', 'nasal congestion', 'blocked nose',
      'sinus congestion', 'sneezing', 'rhinitis'
    ],
    weight: 2,
    category: 'LOW',
    relatedConditions: ['viral URI', 'rhinovirus', 'sinusitis'],
    redFlags: ['over 2 weeks', 'with high fever', 'with severe pain']
  },

  'cough': {
    canonical: 'cough',
    synonyms: [
      'cough', 'coughing', 'hacking cough', 'dry cough', 'wet cough',
      'productive cough', 'tickle in throat', 'throat clearing'
    ],
    weight: 2,
    category: 'LOW',
    relatedConditions: ['viral infection', 'post-nasal drip', 'allergies'],
    redFlags: ['with blood', 'over 3 weeks', 'with weight loss', 'night sweats']
  },

  'fatigue': {
    canonical: 'fatigue',
    synonyms: [
      'fatigue', 'tired', 'exhausted', 'tiredness', 'lethargy',
      'lack of energy', 'weakness', 'worn out', 'drained',
      'no energy', 'always tired', 'chronic fatigue'
    ],
    weight: 3,
    category: 'LOW',
    relatedConditions: ['anemia', 'thyroid', 'depression', 'sleep apnea'],
    redFlags: ['sudden onset', 'with weight loss', 'with fever', 'severe']
  },

  'sore_throat': {
    canonical: 'sore throat',
    synonyms: [
      'sore throat', 'throat pain', 'painful throat', 'scratchy throat',
      'throat hurts', 'pharyngitis', 'throat irritation',
      'swollen throat', 'red throat'
    ],
    weight: 3,
    category: 'LOW',
    relatedConditions: ['viral pharyngitis', 'strep throat', 'tonsillitis'],
    redFlags: ['difficulty swallowing', 'drooling', 'with high fever', 'with rash']
  },

  'mild_headache': {
    canonical: 'mild headache',
    synonyms: [
      'mild headache', 'slight headache', 'minor headache',
      'dull headache', 'pressure in head', 'head pressure'
    ],
    weight: 2,
    category: 'LOW',
    relatedConditions: ['tension headache', 'dehydration', 'caffeine withdrawal'],
    redFlags: ['worsening', 'sudden severe', 'with vision changes']
  },

  'stress_anxiety': {
    canonical: 'stress',
    synonyms: [
      'stress', 'stressed', 'anxiety', 'anxious', 'worried',
      'nervous', 'tense', 'overwhelmed', 'panic', 'stressed out'
    ],
    weight: 3,
    category: 'LOW',
    relatedConditions: ['anxiety disorder', 'panic disorder', 'adjustment disorder'],
    redFlags: ['suicidal thoughts', 'panic attacks', 'can\'t function', 'severe']
  },

  'insomnia': {
    canonical: 'insomnia',
    synonyms: [
      'insomnia', 'can\'t sleep', 'trouble sleeping', 'sleeplessness',
      'difficulty sleeping', 'sleep problems', 'not sleeping',
      'awake all night', 'poor sleep', 'sleep disturbance'
    ],
    weight: 3,
    category: 'LOW',
    relatedConditions: ['insomnia', 'anxiety', 'depression', 'sleep apnea'],
    redFlags: ['with depression', 'affecting function', 'chronic', 'with snoring']
  }
};

// Build reverse lookup for fast synonym matching
export const SYNONYM_TO_CANONICAL: Map<string, string> = new Map();
Object.entries(SYMPTOM_ONTOLOGY).forEach(([key, def]) => {
  def.synonyms.forEach(syn => {
    SYNONYM_TO_CANONICAL.set(syn.toLowerCase(), key);
  });
});
