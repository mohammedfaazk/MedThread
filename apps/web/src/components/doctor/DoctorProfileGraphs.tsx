'use client';

import { useState, useEffect } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';
import '@/styles/glassmorphic-analytics.css';

interface DoctorProfileGraphsProps {
  doctorId: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

export function DoctorProfileGraphs({ doctorId }: DoctorProfileGraphsProps) {
  console.log('🔥 [DoctorProfileGraphs] Component loaded! Version: 2.0 - MOCK DATA ENABLED');
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});

  const charts = [
    { title: 'Treatment Outcomes', endpoint: 'treatment-outcomes', key: 'treatmentOutcomes', dataKey: 'value' },
    { title: 'Posts Over Time', endpoint: 'posts-over-time', key: 'postsOverTime', dataKey: 'posts' },
    { title: 'Comments Over Time', endpoint: 'comments-over-time', key: 'commentsOverTime', dataKey: 'comments' },
    { title: 'Conversion Rate', endpoint: 'conversion-rate', key: 'conversionRate', dataKey: 'rate' },
    { title: 'Patients Cured', endpoint: 'patients-cured', key: 'patientsCured', dataKey: 'cured' },
    { title: 'Clinic Visits', endpoint: 'clinic-visits', key: 'clinicVisits', dataKey: 'visits' },
    { title: 'Portfolio Score', endpoint: 'portfolio-score', key: 'portfolioScore', dataKey: 'score' }
  ];

  useEffect(() => {
    // ALWAYS use mock data for now
    console.log('🎯 [DoctorProfileGraphs] Loading mock data for doctor:', doctorId);
    const mockData: any = {};
    charts.forEach(chart => {
      const chartMockData = getMockData(chart.key);
      mockData[chart.key] = chartMockData;
      console.log(`📊 [DoctorProfileGraphs] Mock data for ${chart.key}:`, chartMockData);
    });
    setData(mockData);
    console.log('✅ [DoctorProfileGraphs] All mock data loaded:', mockData);
    setLoading(false);
    
    // Uncomment below to fetch real data
    // fetchAllCharts();
    
    // Initialize chart types from localStorage
    const savedTypes: Record<string, ChartType> = {};
    charts.forEach(chart => {
      const saved = localStorage.getItem(`doctor-chart-type-${chart.key}`);
      savedTypes[chart.key] = (saved as ChartType) || 'bar';
    });
    setChartTypes(savedTypes);
  }, [doctorId]);

  const fetchAllCharts = async () => {
    setLoading(true);
    setError(null);
    
    console.log('[DoctorProfileGraphs] Fetching analytics for doctor:', doctorId);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('[DoctorProfileGraphs] API Base URL:', baseUrl);
      
      const results = await Promise.all(
        charts.map(chart =>
          fetch(`${baseUrl}/api/doctor-public-analytics/${doctorId}/${chart.endpoint}`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch ${chart.endpoint}`);
              return res.json();
            })
            .catch(err => {
              console.warn(`[DoctorProfileGraphs] Failed to fetch ${chart.endpoint}, using mock data`);
              const mockData = getMockData(chart.key);
              console.log(`[DoctorProfileGraphs] Mock data for ${chart.key}:`, mockData);
              return mockData;
            })
        )
      );

      const chartData: any = {};
      charts.forEach((chart, index) => {
        chartData[chart.key] = results[index];
        console.log(`[DoctorProfileGraphs] Data for ${chart.key}:`, results[index]);
      });

      setData(chartData);
      console.log('[DoctorProfileGraphs] All data loaded:', chartData);
    } catch (err: any) {
      console.error('[DoctorProfileGraphs] Failed to fetch doctor analytics:', err);
      // Use all mock data as fallback
      const mockData: any = {};
      charts.forEach(chart => {
        mockData[chart.key] = getMockData(chart.key);
      });
      setData(mockData);
      console.log('[DoctorProfileGraphs] Using all mock data:', mockData);
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (chartKey: string) => {
    // Generate 12 months of data from Apr 2025 to Mar 2026
    const generateMonths = () => {
      const months = [];
      const startDate = new Date('2025-04-01');
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthStr);
      }
      return months;
    };

    const months = generateMonths();
    
    switch (chartKey) {
      case 'treatmentOutcomes':
        return {
          success: true,
          kpi: '73% Cure Rate',
          data: [
            { name: 'Cured', value: 156, color: '#1ecb6b' },
            { name: 'Ongoing Treatment', value: 48, color: '#669ae3' },
            { name: 'Switched Doctor', value: 10, color: '#ff4d6a' }
          ]
        };
      
      case 'postsOverTime':
        return {
          success: true,
          kpi: '142 Total Posts',
          data: [
            { month: months[0], posts: 8 },
            { month: months[1], posts: 12 },
            { month: months[2], posts: 15 },
            { month: months[3], posts: 11 },
            { month: months[4], posts: 14 },
            { month: months[5], posts: 13 },
            { month: months[6], posts: 10 },
            { month: months[7], posts: 16 },
            { month: months[8], posts: 12 },
            { month: months[9], posts: 11 },
            { month: months[10], posts: 10 },
            { month: months[11], posts: 10 }
          ]
        };
      
      case 'commentsOverTime':
        return {
          success: true,
          kpi: '348 Total Comments',
          data: [
            { month: months[0], comments: 22 },
            { month: months[1], comments: 28 },
            { month: months[2], comments: 35 },
            { month: months[3], comments: 30 },
            { month: months[4], comments: 32 },
            { month: months[5], comments: 29 },
            { month: months[6], comments: 25 },
            { month: months[7], comments: 33 },
            { month: months[8], comments: 31 },
            { month: months[9], comments: 27 },
            { month: months[10], comments: 28 },
            { month: months[11], comments: 28 }
          ]
        };
      
      case 'conversionRate':
        return {
          success: true,
          kpi: '74% Avg Conversion',
          data: [
            { month: months[0], rate: 68 },
            { month: months[1], rate: 72 },
            { month: months[2], rate: 75 },
            { month: months[3], rate: 71 },
            { month: months[4], rate: 76 },
            { month: months[5], rate: 78 },
            { month: months[6], rate: 73 },
            { month: months[7], rate: 77 },
            { month: months[8], rate: 75 },
            { month: months[9], rate: 74 },
            { month: months[10], rate: 76 },
            { month: months[11], rate: 79 }
          ]
        };
      
      case 'patientsCured':
        return {
          success: true,
          kpi: '156 Patients Cured',
          data: [
            { month: months[0], cured: 10 },
            { month: months[1], cured: 14 },
            { month: months[2], cured: 16 },
            { month: months[3], cured: 12 },
            { month: months[4], cured: 15 },
            { month: months[5], cured: 13 },
            { month: months[6], cured: 11 },
            { month: months[7], cured: 14 },
            { month: months[8], cured: 13 },
            { month: months[9], cured: 12 },
            { month: months[10], cured: 13 },
            { month: months[11], cured: 13 }
          ]
        };
      
      case 'clinicVisits':
        return {
          success: true,
          kpi: '89 Total Visits',
          data: [
            { month: months[0], visits: 6 },
            { month: months[1], visits: 8 },
            { month: months[2], visits: 9 },
            { month: months[3], visits: 7 },
            { month: months[4], visits: 8 },
            { month: months[5], visits: 7 },
            { month: months[6], visits: 6 },
            { month: months[7], visits: 9 },
            { month: months[8], visits: 8 },
            { month: months[9], visits: 7 },
            { month: months[10], visits: 7 },
            { month: months[11], visits: 7 }
          ]
        };
      
      case 'portfolioScore':
        return {
          success: true,
          kpi: 'Current Score: 88/100',
          data: [
            { month: months[0], score: 75 },
            { month: months[1], score: 77 },
            { month: months[2], score: 79 },
            { month: months[3], score: 80 },
            { month: months[4], score: 82 },
            { month: months[5], score: 83 },
            { month: months[6], score: 84 },
            { month: months[7], score: 85 },
            { month: months[8], score: 86 },
            { month: months[9], score: 87 },
            { month: months[10], score: 87 },
            { month: months[11], score: 88 }
          ]
        };
      
      default:
        return {
          success: true,
          kpi: 'No Data',
          data: []
        };
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % charts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const changeChartType = (chartKey: string, type: ChartType) => {
    setChartTypes(prev => ({ ...prev, [chartKey]: type }));
    localStorage.setItem(`doctor-chart-type-${chartKey}`, type);
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Performance Overview</h2>
        <ChartSkeleton height={500} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <h2 className="text-red-800 font-semibold mb-2">Error Loading Charts</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAllCharts}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentChart = charts[currentSlide];
  const chartData = data[currentChart.key];
  const hasData = chartData?.data && chartData.data.length > 0;
  const currentChartType = chartTypes[currentChart.key] || 'bar';

  console.log('[DoctorProfileGraphs] Current slide:', currentSlide);
  console.log('[DoctorProfileGraphs] Current chart:', currentChart);
  console.log('[DoctorProfileGraphs] Chart data:', chartData);
  console.log('[DoctorProfileGraphs] Has data:', hasData);
  console.log('[DoctorProfileGraphs] Data length:', chartData?.data?.length);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        </span>
      </div>
      
      {/* Slide Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg transition-all ${
            currentSlide === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-100 hover:scale-110'
          }`}
          aria-label="Previous metric"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === charts.length - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg transition-all ${
            currentSlide === charts.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-100 hover:scale-110'
          }`}
          aria-label="Next metric"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Content */}
        <div className="bg-white rounded-xl shadow-md p-8 min-h-[600px] flex flex-col">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{currentChart.title}</h3>
              <span className="text-sm text-gray-500">
                {currentSlide + 1} / {charts.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-blue-600">
                {chartData?.kpi || 'N/A'}
              </p>
              <span className="text-sm text-gray-600">
                {currentChart.title === 'Treatment Outcomes' && 'Total Outcomes'}
                {currentChart.title === 'Posts Over Time' && 'Total Posts'}
                {currentChart.title === 'Comments Over Time' && 'Total Comments'}
                {currentChart.title === 'Conversion Rate' && 'Average Rate'}
                {currentChart.title === 'Patients Cured' && 'Total Cured'}
                {currentChart.title === 'Clinic Visits' && 'Total Visits'}
                {currentChart.title === 'Portfolio Score' && 'Overall Score'}
              </span>
            </div>
          </div>

          {/* Chart Type Toggle Buttons */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['bar', 'line', 'pie', 'doughnut', 'radar'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => changeChartType(currentChart.key, type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  currentChartType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1 min-h-[400px] flex items-center justify-center">
            {hasData ? (
              <div className="w-full h-full">
                <MultiTypeChart
                  data={chartData.data}
                  dataKey={currentChart.dataKey}
                  xAxisKey={chartData.data[0]?.month ? 'month' : 'name'}
                  storageKey={`doctor-${currentChart.key}`}
                  height={400}
                  showLegend={true}
                  defaultChartType={currentChartType}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm mt-1">Data will appear here once available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {charts.map((chart, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              currentSlide === index 
                ? 'bg-blue-600 w-10 h-3' 
                : 'bg-gray-300 w-3 h-3 hover:bg-gray-400'
            }`}
            aria-label={`Go to ${chart.title}`}
            title={chart.title}
          />
        ))}
      </div>

      {/* Slide Counter (Mobile) */}
      <div className="text-center mt-4 text-sm text-gray-600 md:hidden">
        {currentChart.title} ({currentSlide + 1}/{charts.length})
      </div>
    </div>
  );
}
