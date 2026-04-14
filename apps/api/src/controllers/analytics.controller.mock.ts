import { Request, Response } from 'express';

// Mock data for when database is unavailable
const mockHeatmapData = [
  {
    regionName: 'Maharashtra',
    symptomTag: 'Fever',
    caseCount: 45,
    severityAvg: 6.5,
    alertLevel: 'watch' as const
  },
  {
    regionName: 'Maharashtra',
    symptomTag: 'Cough',
    caseCount: 32,
    severityAvg: 5.2,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Karnataka',
    symptomTag: 'Fever',
    caseCount: 28,
    severityAvg: 5.8,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Karnataka',
    symptomTag: 'Headache',
    caseCount: 15,
    severityAvg: 4.5,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Delhi',
    symptomTag: 'Fever',
    caseCount: 67,
    severityAvg: 7.2,
    alertLevel: 'epidemic' as const
  },
  {
    regionName: 'Delhi',
    symptomTag: 'Cough',
    caseCount: 54,
    severityAvg: 6.8,
    alertLevel: 'watch' as const
  },
  {
    regionName: 'Tamil Nadu',
    symptomTag: 'Fever',
    caseCount: 38,
    severityAvg: 6.1,
    alertLevel: 'watch' as const
  },
  {
    regionName: 'Tamil Nadu',
    symptomTag: 'Body Ache',
    caseCount: 22,
    severityAvg: 5.5,
    alertLevel: 'none' as const
  },
  {
    regionName: 'West Bengal',
    symptomTag: 'Fever',
    caseCount: 41,
    severityAvg: 6.3,
    alertLevel: 'watch' as const
  },
  {
    regionName: 'West Bengal',
    symptomTag: 'Nausea',
    caseCount: 18,
    severityAvg: 4.8,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Gujarat',
    symptomTag: 'Fever',
    caseCount: 35,
    severityAvg: 5.9,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Gujarat',
    symptomTag: 'Cough',
    caseCount: 29,
    severityAvg: 5.4,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Rajasthan',
    symptomTag: 'Fever',
    caseCount: 25,
    severityAvg: 5.6,
    alertLevel: 'none' as const
  },
  {
    regionName: 'Uttar Pradesh',
    symptomTag: 'Fever',
    caseCount: 52,
    severityAvg: 6.7,
    alertLevel: 'watch' as const
  },
  {
    regionName: 'Uttar Pradesh',
    symptomTag: 'Headache',
    caseCount: 31,
    severityAvg: 5.3,
    alertLevel: 'none' as const
  }
];

export function getSymptomHeatmapMock(req: Request, res: Response) {
  console.log('[Analytics] Using MOCK data - Database unavailable');
  
  const { region_type = 'state', symptom, state } = req.query;

  let data = [...mockHeatmapData];

  // Filter by symptom if provided
  if (symptom) {
    data = data.filter(item => item.symptomTag === symptom);
  }

  // Filter by state if provided
  if (state) {
    data = data.filter(item => item.regionName === state);
  }

  res.json({ 
    success: true, 
    data,
    mock: true,
    message: 'Using mock data - Database connection unavailable. Please check Supabase dashboard.'
  });
}

export function getRegionDataMock(req: Request, res: Response) {
  console.log('[Analytics] Using MOCK region data - Database unavailable');
  
  const regions = Array.from(new Set(mockHeatmapData.map(d => d.regionName)))
    .map(name => ({
      name,
      count: mockHeatmapData.filter(d => d.regionName === name).length
    }));

  res.json({ 
    success: true, 
    data: regions,
    mock: true,
    message: 'Using mock data - Database connection unavailable'
  });
}

export function getTrendsSeriesMock(req: Request, res: Response) {
  console.log('[Analytics] Using MOCK trends data - Database unavailable');
  
  // Generate mock time series data for last 7 days
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    ['Fever', 'Cough', 'Headache'].forEach(symptom => {
      data.push({
        reportDate: date.toISOString().split('T')[0],
        symptomTag: symptom,
        _sum: {
          caseCount: Math.floor(Math.random() * 50) + 10
        }
      });
    });
  }

  res.json({ 
    success: true, 
    data,
    mock: true,
    message: 'Using mock data - Database connection unavailable'
  });
}
