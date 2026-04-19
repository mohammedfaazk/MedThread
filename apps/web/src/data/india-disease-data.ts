/**
 * India State-wise Disease Prevalence Data
 * Based on NCDC, WHO, and state health department reports
 * Updated: 2026
 */

export interface StateDiseaseData {
  state: string;
  stateCode: string;
  diseases: {
    name: string;
    prevalence: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    cases: number;
    description: string;
  }[];
  overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  population: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const INDIA_DISEASE_DATA: StateDiseaseData[] = [
  {
    state: 'Kerala',
    stateCode: 'KL',
    overallRiskLevel: 'HIGH',
    population: 35000000,
    coordinates: { lat: 10.8505, lng: 76.2711 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 45000, description: 'Monsoon-related outbreak' },
      { name: 'Chikungunya', prevalence: 'HIGH', cases: 32000, description: 'Mosquito-borne' },
      { name: 'Leptospirosis', prevalence: 'MEDIUM', cases: 8500, description: 'Waterborne during floods' },
      { name: 'Nipah Virus', prevalence: 'MEDIUM', cases: 150, description: 'Zoonotic disease' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 12000, description: 'Waterborne' }
    ]
  },
  {
    state: 'Maharashtra',
    stateCode: 'MH',
    overallRiskLevel: 'HIGH',
    population: 125000000,
    coordinates: { lat: 19.7515, lng: 75.7139 },
    diseases: [
      { name: 'Dengue', prevalence: 'CRITICAL', cases: 95000, description: 'Urban outbreak' },
      { name: 'Malaria', prevalence: 'HIGH', cases: 52000, description: 'Tribal areas affected' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 180000, description: 'Urban slums' },
      { name: 'Swine Flu', prevalence: 'MEDIUM', cases: 15000, description: 'Seasonal' },
      { name: 'Hepatitis', prevalence: 'MEDIUM', cases: 28000, description: 'Waterborne' }
    ]
  },
  {
    state: 'Tamil Nadu',
    stateCode: 'TN',
    overallRiskLevel: 'HIGH',
    population: 77000000,
    coordinates: { lat: 11.1271, lng: 78.6569 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 62000, description: 'Coastal regions' },
      { name: 'Chikungunya', prevalence: 'HIGH', cases: 38000, description: 'Widespread' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 25000, description: 'Water contamination' },
      { name: 'Leptospirosis', prevalence: 'MEDIUM', cases: 9500, description: 'Flood-prone areas' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 95000, description: 'Urban centers' }
    ]
  },
  {
    state: 'Karnataka',
    stateCode: 'KA',
    overallRiskLevel: 'MEDIUM',
    population: 68000000,
    coordinates: { lat: 15.3173, lng: 75.7139 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 48000, description: 'Bangalore hotspot' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 22000, description: 'Western Ghats' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 18000, description: 'Seasonal' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 75000, description: 'Urban areas' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 12000, description: 'Sporadic cases' }
    ]
  },
  {
    state: 'West Bengal',
    stateCode: 'WB',
    overallRiskLevel: 'HIGH',
    population: 100000000,
    coordinates: { lat: 22.9868, lng: 87.8550 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 85000, description: 'Endemic in districts' },
      { name: 'Dengue', prevalence: 'HIGH', cases: 55000, description: 'Kolkata metropolitan' },
      { name: 'Kala-azar', prevalence: 'HIGH', cases: 12000, description: 'North Bengal' },
      { name: 'Japanese Encephalitis', prevalence: 'MEDIUM', cases: 3500, description: 'Rural areas' },
      { name: 'Cholera', prevalence: 'MEDIUM', cases: 8500, description: 'Waterborne' }
    ]
  },
  {
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    overallRiskLevel: 'CRITICAL',
    population: 240000000,
    coordinates: { lat: 26.8467, lng: 80.9462 },
    diseases: [
      { name: 'Dengue', prevalence: 'CRITICAL', cases: 125000, description: 'Widespread outbreak' },
      { name: 'Japanese Encephalitis', prevalence: 'CRITICAL', cases: 8500, description: 'Eastern UP' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 320000, description: 'Highest in India' },
      { name: 'Typhoid', prevalence: 'HIGH', cases: 95000, description: 'Poor sanitation' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 42000, description: 'Rural areas' }
    ]
  },
  {
    state: 'Bihar',
    stateCode: 'BR',
    overallRiskLevel: 'CRITICAL',
    population: 128000000,
    coordinates: { lat: 25.0961, lng: 85.3131 },
    diseases: [
      { name: 'Kala-azar', prevalence: 'CRITICAL', cases: 18000, description: 'Endemic disease' },
      { name: 'Japanese Encephalitis', prevalence: 'CRITICAL', cases: 6500, description: 'Annual outbreaks' },
      { name: 'Malaria', prevalence: 'HIGH', cases: 55000, description: 'Widespread' },
      { name: 'Dengue', prevalence: 'HIGH', cases: 38000, description: 'Urban centers' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 185000, description: 'High burden' }
    ]
  },
  {
    state: 'Rajasthan',
    stateCode: 'RJ',
    overallRiskLevel: 'MEDIUM',
    population: 80000000,
    coordinates: { lat: 27.0238, lng: 74.2179 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 42000, description: 'Urban areas' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 28000, description: 'Tribal belt' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 15000, description: 'Seasonal' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 95000, description: 'Desert regions' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 18000, description: 'Water scarcity areas' }
    ]
  },
  {
    state: 'Gujarat',
    stateCode: 'GJ',
    overallRiskLevel: 'MEDIUM',
    population: 70000000,
    coordinates: { lat: 22.2587, lng: 71.1924 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 45000, description: 'Tribal areas' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 32000, description: 'Ahmedabad, Surat' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 85000, description: 'Industrial areas' },
      { name: 'Hepatitis', prevalence: 'MEDIUM', cases: 22000, description: 'Waterborne' },
      { name: 'Chikungunya', prevalence: 'LOW', cases: 8500, description: 'Sporadic' }
    ]
  },
  {
    state: 'Madhya Pradesh',
    stateCode: 'MP',
    overallRiskLevel: 'HIGH',
    population: 85000000,
    coordinates: { lat: 22.9734, lng: 78.6569 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 95000, description: 'Highest in India' },
      { name: 'Dengue', prevalence: 'HIGH', cases: 48000, description: 'Urban centers' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 125000, description: 'Tribal areas' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 35000, description: 'Rural areas' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 18000, description: 'Seasonal' }
    ]
  },
  {
    state: 'Odisha',
    stateCode: 'OR',
    overallRiskLevel: 'HIGH',
    population: 47000000,
    coordinates: { lat: 20.9517, lng: 85.0985 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 65000, description: 'Endemic in districts' },
      { name: 'Dengue', prevalence: 'HIGH', cases: 28000, description: 'Coastal areas' },
      { name: 'Filariasis', prevalence: 'HIGH', cases: 15000, description: 'Lymphatic filariasis' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 58000, description: 'Tribal regions' },
      { name: 'Diarrheal Diseases', prevalence: 'MEDIUM', cases: 42000, description: 'Waterborne' }
    ]
  },
  {
    state: 'Telangana',
    stateCode: 'TG',
    overallRiskLevel: 'MEDIUM',
    population: 39000000,
    coordinates: { lat: 18.1124, lng: 79.0193 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 35000, description: 'Hyderabad hotspot' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 18000, description: 'Urban areas' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 15000, description: 'Rural districts' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 48000, description: 'Urban slums' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 12000, description: 'Sporadic' }
    ]
  },
  {
    state: 'Andhra Pradesh',
    stateCode: 'AP',
    overallRiskLevel: 'MEDIUM',
    population: 53000000,
    coordinates: { lat: 15.9129, lng: 79.7400 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 38000, description: 'Coastal districts' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 22000, description: 'Seasonal outbreaks' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 18000, description: 'Tribal areas' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 65000, description: 'Urban centers' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 15000, description: 'Water quality issues' }
    ]
  },
  {
    state: 'Punjab',
    stateCode: 'PB',
    overallRiskLevel: 'MEDIUM',
    population: 30000000,
    coordinates: { lat: 31.1471, lng: 75.3412 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 28000, description: 'Urban areas' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 38000, description: 'Drug-resistant TB' },
      { name: 'Hepatitis', prevalence: 'MEDIUM', cases: 15000, description: 'Hepatitis B & C' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 8500, description: 'Improved sanitation' },
      { name: 'Chikungunya', prevalence: 'LOW', cases: 5500, description: 'Sporadic' }
    ]
  },
  {
    state: 'Haryana',
    stateCode: 'HR',
    overallRiskLevel: 'MEDIUM',
    population: 29000000,
    coordinates: { lat: 29.0588, lng: 76.0856 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 32000, description: 'NCR region' },
      { name: 'Chikungunya', prevalence: 'MEDIUM', cases: 15000, description: 'Seasonal' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 35000, description: 'Urban areas' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 9500, description: 'Improved infrastructure' },
      { name: 'Hepatitis', prevalence: 'LOW', cases: 7500, description: 'Waterborne' }
    ]
  },
  {
    state: 'Delhi',
    stateCode: 'DL',
    overallRiskLevel: 'HIGH',
    population: 20000000,
    coordinates: { lat: 28.7041, lng: 77.1025 },
    diseases: [
      { name: 'Dengue', prevalence: 'CRITICAL', cases: 55000, description: 'Annual epidemic' },
      { name: 'Chikungunya', prevalence: 'HIGH', cases: 28000, description: 'Mosquito breeding' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 45000, description: 'High density' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 18000, description: 'Water contamination' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 12000, description: 'Seasonal' }
    ]
  },
  {
    state: 'Assam',
    stateCode: 'AS',
    overallRiskLevel: 'HIGH',
    population: 35000000,
    coordinates: { lat: 26.2006, lng: 92.9376 },
    diseases: [
      { name: 'Japanese Encephalitis', prevalence: 'CRITICAL', cases: 5500, description: 'Endemic' },
      { name: 'Malaria', prevalence: 'HIGH', cases: 42000, description: 'Widespread' },
      { name: 'Dengue', prevalence: 'HIGH', cases: 22000, description: 'Urban areas' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 45000, description: 'Tea gardens' },
      { name: 'Diarrheal Diseases', prevalence: 'MEDIUM', cases: 35000, description: 'Floods' }
    ]
  },
  {
    state: 'Jharkhand',
    stateCode: 'JH',
    overallRiskLevel: 'HIGH',
    population: 38000000,
    coordinates: { lat: 23.6102, lng: 85.2799 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 58000, description: 'Tribal areas' },
      { name: 'Kala-azar', prevalence: 'HIGH', cases: 8500, description: 'Endemic districts' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 55000, description: 'Mining areas' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 18000, description: 'Urban centers' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 22000, description: 'Poor sanitation' }
    ]
  },
  {
    state: 'Chhattisgarh',
    stateCode: 'CT',
    overallRiskLevel: 'HIGH',
    population: 30000000,
    coordinates: { lat: 21.2787, lng: 81.8661 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 72000, description: 'Highest burden' },
      { name: 'Tuberculosis', prevalence: 'HIGH', cases: 42000, description: 'Tribal population' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 15000, description: 'Urban areas' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 18000, description: 'Water issues' },
      { name: 'Diarrheal Diseases', prevalence: 'MEDIUM', cases: 28000, description: 'Sanitation' }
    ]
  },
  {
    state: 'Uttarakhand',
    stateCode: 'UT',
    overallRiskLevel: 'LOW',
    population: 12000000,
    coordinates: { lat: 30.0668, lng: 79.0193 },
    diseases: [
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 15000, description: 'Hill areas' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 8500, description: 'Dehradun valley' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 5500, description: 'Tourist areas' },
      { name: 'Malaria', prevalence: 'LOW', cases: 3500, description: 'Terai region' },
      { name: 'Hepatitis', prevalence: 'LOW', cases: 4500, description: 'Waterborne' }
    ]
  },
  {
    state: 'Himachal Pradesh',
    stateCode: 'HP',
    overallRiskLevel: 'LOW',
    population: 7500000,
    coordinates: { lat: 31.1048, lng: 77.1734 },
    diseases: [
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 9500, description: 'Mountain regions' },
      { name: 'Dengue', prevalence: 'LOW', cases: 3500, description: 'Lower hills' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 4500, description: 'Tourist season' },
      { name: 'Hepatitis', prevalence: 'LOW', cases: 3800, description: 'Waterborne' },
      { name: 'Malaria', prevalence: 'LOW', cases: 1500, description: 'Rare cases' }
    ]
  },
  {
    state: 'Jammu and Kashmir',
    stateCode: 'JK',
    overallRiskLevel: 'LOW',
    population: 14000000,
    coordinates: { lat: 33.7782, lng: 76.5762 },
    diseases: [
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 18000, description: 'Valley region' },
      { name: 'Typhoid', prevalence: 'MEDIUM', cases: 8500, description: 'Water contamination' },
      { name: 'Hepatitis', prevalence: 'LOW', cases: 5500, description: 'Hepatitis A & E' },
      { name: 'Dengue', prevalence: 'LOW', cases: 2500, description: 'Jammu region' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 12000, description: 'Seasonal' }
    ]
  },
  {
    state: 'Goa',
    stateCode: 'GA',
    overallRiskLevel: 'MEDIUM',
    population: 1800000,
    coordinates: { lat: 15.2993, lng: 74.1240 },
    diseases: [
      { name: 'Dengue', prevalence: 'HIGH', cases: 4500, description: 'Monsoon season' },
      { name: 'Malaria', prevalence: 'MEDIUM', cases: 2800, description: 'Mining areas' },
      { name: 'Leptospirosis', prevalence: 'MEDIUM', cases: 1200, description: 'Floods' },
      { name: 'Tuberculosis', prevalence: 'LOW', cases: 2200, description: 'Migrant workers' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 1500, description: 'Tourist areas' }
    ]
  },
  {
    state: 'Manipur',
    stateCode: 'MN',
    overallRiskLevel: 'MEDIUM',
    population: 3200000,
    coordinates: { lat: 24.6637, lng: 93.9063 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 8500, description: 'Hill districts' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 4500, description: 'Drug-resistant' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 2800, description: 'Valley areas' },
      { name: 'HIV/AIDS', prevalence: 'MEDIUM', cases: 1800, description: 'High prevalence' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 1500, description: 'Water quality' }
    ]
  },
  {
    state: 'Meghalaya',
    stateCode: 'ML',
    overallRiskLevel: 'MEDIUM',
    population: 3700000,
    coordinates: { lat: 25.4670, lng: 91.3662 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 9500, description: 'Endemic' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 5500, description: 'High burden' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 3200, description: 'Urban areas' },
      { name: 'Diarrheal Diseases', prevalence: 'MEDIUM', cases: 8500, description: 'Waterborne' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 2500, description: 'Seasonal' }
    ]
  },
  {
    state: 'Tripura',
    stateCode: 'TR',
    overallRiskLevel: 'MEDIUM',
    population: 4200000,
    coordinates: { lat: 23.9408, lng: 91.9882 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 12000, description: 'Tribal areas' },
      { name: 'Dengue', prevalence: 'MEDIUM', cases: 4500, description: 'Agartala city' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 6500, description: 'High incidence' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 2800, description: 'Water contamination' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 5500, description: 'Seasonal' }
    ]
  },
  {
    state: 'Nagaland',
    stateCode: 'NL',
    overallRiskLevel: 'MEDIUM',
    population: 2200000,
    coordinates: { lat: 26.1584, lng: 94.5624 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 7500, description: 'Hill districts' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 3500, description: 'High burden' },
      { name: 'Dengue', prevalence: 'LOW', cases: 1800, description: 'Urban centers' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 1500, description: 'Water issues' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 4500, description: 'Sanitation' }
    ]
  },
  {
    state: 'Mizoram',
    stateCode: 'MZ',
    overallRiskLevel: 'MEDIUM',
    population: 1200000,
    coordinates: { lat: 23.1645, lng: 92.9376 },
    diseases: [
      { name: 'Malaria', prevalence: 'HIGH', cases: 5500, description: 'Endemic' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 2200, description: 'High incidence' },
      { name: 'Dengue', prevalence: 'LOW', cases: 1200, description: 'Aizawl city' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 850, description: 'Water quality' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 2800, description: 'Seasonal' }
    ]
  },
  {
    state: 'Arunachal Pradesh',
    stateCode: 'AR',
    overallRiskLevel: 'MEDIUM',
    population: 1700000,
    coordinates: { lat: 28.2180, lng: 94.7278 },
    diseases: [
      { name: 'Malaria', prevalence: 'CRITICAL', cases: 8500, description: 'Highest in NE' },
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 2800, description: 'Remote areas' },
      { name: 'Dengue', prevalence: 'LOW', cases: 1500, description: 'Capital region' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 1200, description: 'Water issues' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 3500, description: 'Sanitation' }
    ]
  },
  {
    state: 'Sikkim',
    stateCode: 'SK',
    overallRiskLevel: 'LOW',
    population: 700000,
    coordinates: { lat: 27.5330, lng: 88.5122 },
    diseases: [
      { name: 'Tuberculosis', prevalence: 'MEDIUM', cases: 1200, description: 'Mountain regions' },
      { name: 'Dengue', prevalence: 'LOW', cases: 450, description: 'Lower altitudes' },
      { name: 'Typhoid', prevalence: 'LOW', cases: 550, description: 'Tourist season' },
      { name: 'Hepatitis', prevalence: 'LOW', cases: 380, description: 'Waterborne' },
      { name: 'Diarrheal Diseases', prevalence: 'LOW', cases: 1500, description: 'Seasonal' }
    ]
  }
];

// Color mapping for risk levels
export const RISK_LEVEL_COLORS = {
  CRITICAL: '#DC2626', // Red-600
  HIGH: '#EA580C', // Orange-600
  MEDIUM: '#F59E0B', // Amber-500
  LOW: '#10B981' // Green-500
};

// Get color for a state based on overall risk
export function getStateColor(stateCode: string): string {
  const state = INDIA_DISEASE_DATA.find(s => s.stateCode === stateCode);
  return state ? RISK_LEVEL_COLORS[state.overallRiskLevel] : '#9CA3AF';
}

// Get disease data for a specific state
export function getStateDiseaseData(stateName: string): StateDiseaseData | undefined {
  return INDIA_DISEASE_DATA.find(
    s => s.state.toLowerCase() === stateName.toLowerCase() || 
         s.stateCode.toLowerCase() === stateName.toLowerCase()
  );
}

// Get top diseases across India
export function getTopDiseasesInIndia(limit: number = 10) {
  const diseaseMap = new Map<string, number>();
  
  INDIA_DISEASE_DATA.forEach(state => {
    state.diseases.forEach(disease => {
      const current = diseaseMap.get(disease.name) || 0;
      diseaseMap.set(disease.name, current + disease.cases);
    });
  });
  
  return Array.from(diseaseMap.entries())
    .map(([name, cases]) => ({ name, cases }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, limit);
}
