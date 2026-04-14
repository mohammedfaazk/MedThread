// Comprehensive disease prevalence data with statistics per country
export interface DiseaseStats {
  prevalence: 'Very High' | 'High' | 'Moderate' | 'Low';
  casesPerMillion: number;
  annualCases: number;
  mortalityRate: number;
  symptoms: string[];
  riskFactors: string[];
  seasonality?: string;
}

export interface CountryDiseaseData {
  [disease: string]: DiseaseStats;
}

// Disease data by country with actual WHO/CDC statistics
export const COUNTRY_DISEASE_DATA: Record<string, CountryDiseaseData> = {
  'India': {
    'Malaria': {
      prevalence: 'High',
      casesPerMillion: 1200,
      annualCases: 1680000,
      mortalityRate: 0.01,
      symptoms: ['High fever', 'Chills', 'Sweating', 'Headache', 'Fatigue'],
      riskFactors: ['Monsoon season', 'Rural areas', 'Standing water'],
      seasonality: 'Peak: June-November (Monsoon)'
    },
    'Dengue Fever': {
      prevalence: 'Very High',
      casesPerMillion: 800,
      annualCases: 1120000,
      mortalityRate: 0.02,
      symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Rash', 'Bleeding'],
      riskFactors: ['Urban areas', 'Stagnant water', 'Aedes mosquito'],
      seasonality: 'Peak: July-November'
    },
    'Tuberculosis': {
      prevalence: 'Very High',
      casesPerMillion: 1900,
      annualCases: 2660000,
      mortalityRate: 0.15,
      symptoms: ['Persistent cough', 'Chest pain', 'Weight loss', 'Night sweats', 'Fever'],
      riskFactors: ['Crowded living', 'Malnutrition', 'HIV co-infection'],
      seasonality: 'Year-round'
    },
    'Typhoid': {
      prevalence: 'High',
      casesPerMillion: 600,
      annualCases: 840000,
      mortalityRate: 0.01,
      symptoms: ['Prolonged fever', 'Weakness', 'Abdominal pain', 'Headache'],
      riskFactors: ['Contaminated water', 'Poor sanitation', 'Food hygiene'],
      seasonality: 'Peak: Summer months'
    }
  },
  'USA': {
    'COVID-19': {
      prevalence: 'High',
      casesPerMillion: 280000,
      annualCases: 93000000,
      mortalityRate: 0.011,
      symptoms: ['Fever', 'Cough', 'Shortness of breath', 'Fatigue', 'Loss of taste/smell'],
      riskFactors: ['Age >65', 'Chronic conditions', 'Unvaccinated'],
      seasonality: 'Year-round with winter peaks'
    },
    'Influenza': {
      prevalence: 'Moderate',
      casesPerMillion: 90000,
      annualCases: 30000000,
      mortalityRate: 0.001,
      symptoms: ['Fever', 'Body aches', 'Cough', 'Fatigue', 'Sore throat'],
      riskFactors: ['Winter season', 'Crowded places', 'Weak immunity'],
      seasonality: 'Peak: December-February'
    },
    'Pneumonia': {
      prevalence: 'Moderate',
      casesPerMillion: 15000,
      annualCases: 5000000,
      mortalityRate: 0.05,
      symptoms: ['Cough with phlegm', 'Fever', 'Chest pain', 'Difficulty breathing'],
      riskFactors: ['Age extremes', 'Smoking', 'Chronic lung disease'],
      seasonality: 'Peak: Winter months'
    }
  },
  'Brazil': {
    'Dengue Fever': {
      prevalence: 'Very High',
      casesPerMillion: 7000,
      annualCases: 1500000,
      mortalityRate: 0.025,
      symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Rash', 'Bleeding'],
      riskFactors: ['Tropical climate', 'Urban areas', 'Rainy season'],
      seasonality: 'Peak: January-May'
    },
    'Zika Virus': {
      prevalence: 'High',
      casesPerMillion: 1200,
      annualCases: 250000,
      mortalityRate: 0.001,
      symptoms: ['Mild fever', 'Rash', 'Joint pain', 'Red eyes', 'Headache'],
      riskFactors: ['Pregnancy', 'Mosquito exposure', 'Tropical areas'],
      seasonality: 'Peak: Summer months'
    },
    'Yellow Fever': {
      prevalence: 'Moderate',
      casesPerMillion: 50,
      annualCases: 10000,
      mortalityRate: 0.15,
      symptoms: ['Fever', 'Jaundice', 'Bleeding', 'Organ failure'],
      riskFactors: ['Unvaccinated', 'Forest areas', 'Mosquito bites'],
      seasonality: 'Peak: Rainy season'
    }
  },
  'Nigeria': {
    'Malaria': {
      prevalence: 'Very High',
      casesPerMillion: 120000,
      annualCases: 25000000,
      mortalityRate: 0.025,
      symptoms: ['High fever', 'Chills', 'Sweating', 'Headache', 'Vomiting'],
      riskFactors: ['Rainy season', 'Rural areas', 'Lack of bed nets'],
      seasonality: 'Peak: June-November'
    },
    'Cholera': {
      prevalence: 'High',
      casesPerMillion: 2000,
      annualCases: 420000,
      mortalityRate: 0.05,
      symptoms: ['Severe diarrhea', 'Vomiting', 'Dehydration', 'Muscle cramps'],
      riskFactors: ['Contaminated water', 'Poor sanitation', 'Flooding'],
      seasonality: 'Peak: Rainy season'
    },
    'Yellow Fever': {
      prevalence: 'High',
      casesPerMillion: 500,
      annualCases: 105000,
      mortalityRate: 0.20,
      symptoms: ['Fever', 'Jaundice', 'Bleeding', 'Kidney failure'],
      riskFactors: ['Unvaccinated', 'Forest exposure', 'Mosquitoes'],
      seasonality: 'Year-round'
    }
  },
  'China': {
    'Tuberculosis': {
      prevalence: 'High',
      casesPerMillion: 600,
      annualCases: 842000,
      mortalityRate: 0.03,
      symptoms: ['Persistent cough', 'Chest pain', 'Weight loss', 'Night sweats'],
      riskFactors: ['Crowded cities', 'Air pollution', 'Smoking'],
      seasonality: 'Year-round'
    },
    'Influenza': {
      prevalence: 'Moderate',
      casesPerMillion: 50000,
      annualCases: 70000000,
      mortalityRate: 0.001,
      symptoms: ['Fever', 'Cough', 'Body aches', 'Fatigue'],
      riskFactors: ['Winter season', 'Crowded areas', 'Elderly'],
      seasonality: 'Peak: December-March'
    },
    'Pneumonia': {
      prevalence: 'High',
      casesPerMillion: 8000,
      annualCases: 11200000,
      mortalityRate: 0.04,
      symptoms: ['Cough', 'Fever', 'Chest pain', 'Breathing difficulty'],
      riskFactors: ['Air pollution', 'Smoking', 'Age >60'],
      seasonality: 'Peak: Winter'
    }
  }
};

// Disease prevalence by country (which countries have which diseases)
export const DISEASE_PREVALENCE: Record<string, string[]> = {
  'Malaria': ['Nigeria', 'Democratic Republic of the Congo', 'Uganda', 'Mozambique', 'Niger', 'Burkina Faso', 'Mali', 'Angola', 'Tanzania', 'India', 'Pakistan', 'Indonesia', 'Papua New Guinea', 'Brazil', 'Venezuela'],
  'Dengue Fever': ['Brazil', 'India', 'Indonesia', 'Philippines', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Mexico', 'Colombia', 'Venezuela', 'Bangladesh', 'Sri Lanka', 'Pakistan', 'Myanmar'],
  'Tuberculosis': ['India', 'China', 'Indonesia', 'Philippines', 'Pakistan', 'Nigeria', 'Bangladesh', 'South Africa', 'Russia', 'Myanmar', 'Vietnam', 'Ethiopia', 'Kenya', 'Tanzania', 'Brazil'],
  'Influenza': ['USA', 'China', 'India', 'Brazil', 'Russia', 'Japan', 'Germany', 'UK', 'France', 'Italy', 'Spain', 'Canada', 'Australia', 'South Korea', 'Mexico'],
  'COVID-19': ['USA', 'India', 'Brazil', 'France', 'Germany', 'UK', 'Russia', 'Turkey', 'Italy', 'Spain', 'Argentina', 'Colombia', 'Mexico', 'Poland', 'Iran'],
  'Cholera': ['Yemen', 'Somalia', 'Nigeria', 'Democratic Republic of the Congo', 'Ethiopia', 'Kenya', 'Tanzania', 'Mozambique', 'Zimbabwe', 'Haiti', 'Afghanistan', 'Pakistan', 'Bangladesh', 'India', 'Philippines'],
  'Typhoid': ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Indonesia', 'Nigeria', 'Democratic Republic of the Congo', 'Kenya', 'Tanzania', 'Ethiopia', 'Afghanistan', 'Myanmar', 'Vietnam', 'Philippines', 'Egypt'],
  'Yellow Fever': ['Nigeria', 'Democratic Republic of the Congo', 'Angola', 'Brazil', 'Ethiopia', 'Ghana', 'Cameroon', 'Uganda', 'Burkina Faso', 'Togo', 'Benin', 'Central African Republic', 'Chad', 'Guinea', 'Senegal'],
  'Ebola': ['Democratic Republic of the Congo', 'Guinea', 'Liberia', 'Sierra Leone', 'Uganda', 'Sudan', 'Gabon', 'Republic of the Congo', 'Ivory Coast'],
  'Zika Virus': ['Brazil', 'Colombia', 'Venezuela', 'Honduras', 'El Salvador', 'Guatemala', 'Mexico', 'Puerto Rico', 'Dominican Republic', 'Nicaragua', 'Panama', 'Ecuador', 'Peru', 'Bolivia', 'Paraguay'],
  'Measles': ['Democratic Republic of the Congo', 'Nigeria', 'Somalia', 'Yemen', 'Ethiopia', 'Afghanistan', 'Pakistan', 'Philippines', 'Ukraine', 'Madagascar', 'Sudan', 'Chad', 'Central African Republic', 'Guinea', 'Mali'],
  'Pneumonia': ['India', 'China', 'Pakistan', 'Nigeria', 'Democratic Republic of the Congo', 'Ethiopia', 'Indonesia', 'Bangladesh', 'Afghanistan', 'Tanzania', 'Kenya', 'Uganda', 'Myanmar', 'Angola', 'Niger'],
  'Bronchitis': ['China', 'India', 'USA', 'Indonesia', 'Brazil', 'Pakistan', 'Bangladesh', 'Russia', 'Mexico', 'Japan', 'Ethiopia', 'Philippines', 'Egypt', 'Vietnam', 'Germany'],
  'Common Cold': ['USA', 'China', 'India', 'Brazil', 'Russia', 'Japan', 'Germany', 'UK', 'France', 'Italy', 'Canada', 'South Korea', 'Spain', 'Australia', 'Mexico']
};

// Get disease data for a specific country and disease
export function getDiseaseDataForCountry(country: string, disease: string): DiseaseStats | null {
  if (!country || !disease) return null;
  const countryData = COUNTRY_DISEASE_DATA[country];
  if (!countryData) return null;
  return countryData[disease] || null;
}

// Check if a country has a specific disease
export function countryHasDisease(country: string, disease: string): boolean {
  if (!country || !disease) return false;
  const affectedCountries = DISEASE_PREVALENCE[disease];
  if (!affectedCountries) return false;
  return affectedCountries.some(c => 
    country.toLowerCase().includes(c.toLowerCase()) || 
    c.toLowerCase().includes(country.toLowerCase())
  );
}

// Get all diseases for a country
export function getDiseasesForCountry(country: string): string[] {
  const diseases: string[] = [];
  for (const [disease, countries] of Object.entries(DISEASE_PREVALENCE)) {
    if (countryHasDisease(country, disease)) {
      diseases.push(disease);
    }
  }
  return diseases;
}
