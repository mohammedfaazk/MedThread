/**
 * Medical Knowledge Base Service
 * Stores and retrieves medically-approved data from vetted sources
 * Sources: Eka-IndicMTEB (multilingual), Disease Ontology, WHO, NHS, MedQuAD
 */

export interface MedicalEntity {
  id: string;
  type: 'symptom' | 'disease' | 'condition' | 'procedure' | 'medication';
  name: string;
  aliases: string[];
  languages: Record<string, string>; // { en: 'fever', hi: 'बुखार', ta: 'காய்ச்சல்' }
  snomedId?: string;
  diseaseOntologyId?: string;
  description: string;
  symptoms?: string[]; // related symptom IDs
  relatedConditions?: string[]; // related disease IDs
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  emergencyFlags?: string[]; // conditions that trigger emergency
  source: string; // 'eka-indicmteb' | 'disease-ontology' | 'who' | 'nhs' | 'medquad'
  licence: string;
  lastUpdated: string;
  confidence: number; // 0-1, higher = more reliable
  references?: string[]; // URLs or DOIs
}

export interface SymptomDiseaseMapping {
  symptomId: string;
  diseaseId: string;
  probability: number; // 0-1
  confidence: number; // evidence strength
  source: string;
}

export interface MedicalKB {
  entities: Record<string, MedicalEntity>;
  symptomDiseaseMappings: SymptomDiseaseMapping[];
  emergencyConditions: string[]; // disease IDs that are emergencies
  lastSyncedAt: string;
}

class MedicalKnowledgeBaseService {
  private kb: MedicalKB = {
    entities: {},
    symptomDiseaseMappings: [],
    emergencyConditions: [],
    lastSyncedAt: new Date().toISOString()
  };

  constructor() {
    this.loadKnowledgeBase();
  }

  /**
   * Load KB from stored JSON (fetched from API or local storage)
   */
  private loadKnowledgeBase() {
    try {
      const stored = localStorage.getItem('vitavoice_medical_kb');
      if (stored) {
        this.kb = JSON.parse(stored);
      } else {
        this.initializeWithSeedData();
      }
    } catch (error) {
      console.warn('Failed to load KB, using seed data:', error);
      this.initializeWithSeedData();
    }
  }

  /**
   * Initialize with seed data (sample entities from Eka-IndicMTEB + Disease Ontology)
   * In production, this would be populated from actual dataset ingestion
   */
  private initializeWithSeedData() {
    // Sample Eka-IndicMTEB multilingual entities
    const seedEntities: Record<string, MedicalEntity> = {
      'sym_fever': {
        id: 'sym_fever',
        type: 'symptom',
        name: 'Fever',
        aliases: ['high temperature', 'pyrexia', 'elevated temperature'],
        languages: {
          en: 'Fever',
          hi: 'बुखार',
          ta: 'காய்ச்சல்',
          te: 'జ్వరం',
          kn: 'ಜ್ವರ',
          ml: 'പനി',
          bn: 'জ্বর',
          mr: 'ताप'
        },
        description: 'Body temperature above normal range (>98.6°F / 37°C)',
        severity: 'mild',
        source: 'eka-indicmteb',
        licence: 'CC-BY-SA-4.0',
        lastUpdated: new Date().toISOString(),
        confidence: 0.95,
        references: [
          'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7110163/',
          'https://huggingface.co/datasets/ekacare/Eka-IndicMTEB'
        ]
      },
      'sym_cough': {
        id: 'sym_cough',
        type: 'symptom',
        name: 'Cough',
        aliases: ['tussis', 'dry cough', 'wet cough'],
        languages: {
          en: 'Cough',
          hi: 'खांसी',
          ta: 'இருமல்',
          te: 'దగ్గు',
          kn: 'ಕೆಮ್ಮೆ',
          ml: 'ചുമ',
          bn: 'কাশি',
          mr: 'खोकला'
        },
        description: 'Sudden expulsion of air from lungs, often involuntary',
        severity: 'mild',
        source: 'eka-indicmteb',
        licence: 'CC-BY-SA-4.0',
        lastUpdated: new Date().toISOString(),
        confidence: 0.93
      },
      'sym_headache': {
        id: 'sym_headache',
        type: 'symptom',
        name: 'Headache',
        aliases: ['head pain', 'cephalgia'],
        languages: {
          en: 'Headache',
          hi: 'सिरदर्द',
          ta: 'தலைவலி',
          te: 'తలనొప్పి',
          kn: 'ತಲೆ ನೋವು',
          ml: 'തലവേദന',
          bn: 'মাথাব্যথা',
          mr: 'डोकेदुखी'
        },
        description: 'Pain in the head or upper neck region',
        severity: 'mild',
        source: 'eka-indicmteb',
        licence: 'CC-BY-SA-4.0',
        lastUpdated: new Date().toISOString(),
        confidence: 0.92
      },
      'dis_covid19': {
        id: 'dis_covid19',
        type: 'disease',
        name: 'COVID-19',
        aliases: ['coronavirus disease 2019', 'SARS-CoV-2', 'corona'],
        languages: {
          en: 'COVID-19',
          hi: 'कोविड-19',
          ta: 'கோவிட்-19',
          te: 'కోవిడ్-19',
          kn: 'ಕೋವಿಡ್-19',
          ml: 'കോവിഡ്-19',
          bn: 'কোভিড-19',
          mr: 'कोविड-19'
        },
        snomedId: '840539006',
        diseaseOntologyId: 'DOID:0080600',
        description:
          'Infectious disease caused by SARS-CoV-2 virus, highly contagious respiratory illness',
        symptoms: ['sym_fever', 'sym_cough', 'sym_headache'],
        severity: 'moderate',
        emergencyFlags: [
          'severe_respiratory_distress',
          'oxygen_saturation_below_90',
          'sepsis_indicators'
        ],
        source: 'disease-ontology',
        licence: 'https://www.disease-ontology.org/about/DO_FAIR',
        lastUpdated: new Date().toISOString(),
        confidence: 0.99,
        references: [
          'https://www.disease-ontology.org/do',
          'https://www.who.int/emergencies/diseases/novel-coronavirus-2019'
        ]
      },
      'dis_influenza': {
        id: 'dis_influenza',
        type: 'disease',
        name: 'Influenza',
        aliases: ['flu', 'seasonal flu', 'swine flu', 'bird flu'],
        languages: {
          en: 'Influenza',
          hi: 'इन्फ्लूएंजा',
          ta: 'இன்ஃப்ளூயன்ஸா',
          te: 'ఇన్ఫ్లుయెంజా',
          kn: 'ಇನ್ಫ್ಲುಯೆಂಜಾ',
          ml: 'ഇന്ഫ്ലുവെൻസ',
          bn: 'ইনফ্লুয়েঞ্জা',
          mr: 'इन्फ्लुएंजा'
        },
        snomedId: '6142004',
        diseaseOntologyId: 'DOID:8469',
        description: 'Contagious respiratory illness caused by influenza virus',
        symptoms: ['sym_fever', 'sym_cough', 'sym_headache'],
        severity: 'moderate',
        source: 'disease-ontology',
        licence: 'https://www.disease-ontology.org/about/DO_FAIR',
        lastUpdated: new Date().toISOString(),
        confidence: 0.98
      },
      'dis_common_cold': {
        id: 'dis_common_cold',
        type: 'disease',
        name: 'Common Cold',
        aliases: ['cold', 'viral rhinitis', 'acute coryza'],
        languages: {
          en: 'Common Cold',
          hi: 'सर्दी',
          ta: 'சளி',
          te: 'జలుబా',
          kn: 'ಸಿಹುಬು',
          ml: 'ജലദോഷം',
          bn: 'সর্দি',
          mr: 'सर्दी'
        },
        diseaseOntologyId: 'DOID:0001816',
        description: 'Common viral infection of upper respiratory tract',
        symptoms: ['sym_cough', 'sym_headache'],
        severity: 'mild',
        source: 'disease-ontology',
        licence: 'https://www.disease-ontology.org/about/DO_FAIR',
        lastUpdated: new Date().toISOString(),
        confidence: 0.95
      }
    };

    // Symptom-disease mappings
    const mappings: SymptomDiseaseMapping[] = [
      {
        symptomId: 'sym_fever',
        diseaseId: 'dis_covid19',
        probability: 0.88,
        confidence: 0.95,
        source: 'eka-indicmteb'
      },
      {
        symptomId: 'sym_cough',
        diseaseId: 'dis_covid19',
        probability: 0.85,
        confidence: 0.93,
        source: 'eka-indicmteb'
      },
      {
        symptomId: 'sym_headache',
        diseaseId: 'dis_covid19',
        probability: 0.67,
        confidence: 0.85,
        source: 'eka-indicmteb'
      },
      {
        symptomId: 'sym_fever',
        diseaseId: 'dis_influenza',
        probability: 0.90,
        confidence: 0.96,
        source: 'eka-indicmteb'
      },
      {
        symptomId: 'sym_cough',
        diseaseId: 'dis_influenza',
        probability: 0.88,
        confidence: 0.94,
        source: 'eka-indicmteb'
      },
      {
        symptomId: 'sym_cough',
        diseaseId: 'dis_common_cold',
        probability: 0.75,
        confidence: 0.90,
        source: 'disease-ontology'
      }
    ];

    this.kb = {
      entities: seedEntities,
      symptomDiseaseMappings: mappings,
      emergencyConditions: ['dis_covid19'],
      lastSyncedAt: new Date().toISOString()
    };

    this.persist();
  }

  /**
   * Get entity by ID
   */
  getEntity(id: string): MedicalEntity | null {
    return this.kb.entities[id] || null;
  }

  /**
   * Search entities by name (across all languages)
   */
  searchEntities(query: string, language: string = 'en'): MedicalEntity[] {
    const q = query.toLowerCase();
    return Object.values(this.kb.entities).filter((entity) => {
      // Search in name, aliases, and language variants
      const match =
        entity.name.toLowerCase().includes(q) ||
        entity.aliases.some((a) => a.toLowerCase().includes(q)) ||
        (entity.languages[language] &&
          entity.languages[language].toLowerCase().includes(q));
      return match;
    });
  }

  /**
   * Get diseases related to a symptom
   */
  getDiseasesForSymptom(symptomId: string): MedicalEntity[] {
    const mappings = this.kb.symptomDiseaseMappings.filter(
      (m) => m.symptomId === symptomId
    );
    return mappings
      .map((m) => this.kb.entities[m.diseaseId])
      .filter((e) => !!e);
  }

  /**
   * Get symptoms for a disease
   */
  getSymptomsForDisease(diseaseId: string): MedicalEntity[] {
    const disease = this.kb.entities[diseaseId];
    if (!disease || !disease.symptoms) return [];
    return disease.symptoms
      .map((id) => this.kb.entities[id])
      .filter((e) => !!e);
  }

  /**
   * Check if condition is emergency
   */
  isEmergencyCondition(diseaseId: string): boolean {
    return this.kb.emergencyConditions.includes(diseaseId);
  }

  /**
   * Get entity in specific language
   */
  getEntityInLanguage(
    entity: MedicalEntity,
    language: string
  ): string {
    return entity.languages[language] || entity.languages['en'] || entity.name;
  }

  /**
   * Persist KB to localStorage
   */
  private persist() {
    localStorage.setItem('vitavoice_medical_kb', JSON.stringify(this.kb));
  }

  /**
   * Get knowledge base statistics
   */
  getStats() {
    return {
      totalEntities: Object.keys(this.kb.entities).length,
      symptoms: Object.values(this.kb.entities).filter(
        (e) => e.type === 'symptom'
      ).length,
      diseases: Object.values(this.kb.entities).filter(
        (e) => e.type === 'disease'
      ).length,
      mappings: this.kb.symptomDiseaseMappings.length,
      emergencyConditions: this.kb.emergencyConditions.length,
      lastUpdated: this.kb.lastSyncedAt
    };
  }

  /**
   * Get all entities of a specific type
   */
  getEntitiesByType(type: MedicalEntity['type']): MedicalEntity[] {
    return Object.values(this.kb.entities).filter((e) => e.type === type);
  }
}

export const medicalKnowledgeBaseService = new MedicalKnowledgeBaseService();

// Make available globally for browser console
declare global {
  interface Window {
    medicalKnowledgeBase: MedicalKnowledgeBaseService;
  }
}

if (typeof window !== 'undefined') {
  (window as any).medicalKnowledgeBase = medicalKnowledgeBaseService;
}
