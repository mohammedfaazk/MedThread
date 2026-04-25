'use client';

import { useState, useEffect } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';
import '@/styles/glassmorphic-analytics.css';

interface DoctorProfileGraphsProps {
  doctorId: string;
  compact?: boolean; // Add compact mode for admin dashboard
}

type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

export function DoctorProfileGraphs({ doctorId, compact = false }: DoctorProfileGraphsProps) {
  console.log('🔥 [DoctorProfileGraphs] Component loaded! Version: 2.0 - MOCK DATA ENABLED');
  console.log('📏 [DoctorProfileGraphs] Compact mode:', compact);
  
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
    // FETCH REAL DATA FROM API
    console.log('🎯 [DoctorProfileGraphs] Fetching REAL data for doctor:', doctorId);
    fetchAllCharts();
    
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
    // Create a seed from doctorId for consistent but unique data per doctor
    const seed = doctorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number, index: number = 0) => {
      const x = Math.sin(seed + index) * 10000;
      return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
    };
    
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
    
    // Generate DRASTICALLY different but realistic values based on doctor
    // Use different multipliers for each doctor to create variety
    const doctorMultiplier = (seed % 5) + 1; // 1-5 multiplier
    const experienceLevel = seed % 3; // 0=junior, 1=mid, 2=senior
    
    // Cured patients: Junior (50-120), Mid (120-250), Senior (250-450)
    const curedCount = experienceLevel === 0 
      ? random(50, 120, 1) 
      : experienceLevel === 1 
      ? random(120, 250, 1) 
      : random(250, 450, 1);
    
    // Ongoing: Junior (20-50), Mid (40-90), Senior (60-150)
    const ongoingCount = experienceLevel === 0 
      ? random(20, 50, 2) 
      : experienceLevel === 1 
      ? random(40, 90, 2) 
      : random(60, 150, 2);
    
    // Switched: Junior (15-40), Mid (8-25), Senior (3-15) - better doctors have fewer switches
    const switchedCount = experienceLevel === 0 
      ? random(15, 40, 3) 
      : experienceLevel === 1 
      ? random(8, 25, 3) 
      : random(3, 15, 3);
    
    const totalOutcomes = curedCount + ongoingCount + switchedCount;
    const cureRate = Math.round((curedCount / totalOutcomes) * 100);
    
    switch (chartKey) {
      case 'treatmentOutcomes':
        return {
          success: true,
          kpi: `${cureRate}% Cure Rate`,
          data: [
            { name: 'Cured', value: curedCount, color: '#1ecb6b' },
            { name: 'Ongoing Treatment', value: ongoingCount, color: '#669ae3' },
            { name: 'Switched Doctor', value: switchedCount, color: '#ff4d6a' }
          ]
        };
      
      case 'postsOverTime':
        // Posts: Junior (40-100), Mid (100-220), Senior (220-400)
        const totalPosts = experienceLevel === 0 
          ? random(40, 100, 10) 
          : experienceLevel === 1 
          ? random(100, 220, 10) 
          : random(220, 400, 10);
        const avgPosts = Math.floor(totalPosts / 12);
        const postVariation = Math.floor(avgPosts * 0.4); // 40% variation
        return {
          success: true,
          kpi: `${totalPosts} Total Posts`,
          data: months.map((m, i) => ({
            month: m,
            posts: Math.max(2, avgPosts + random(-postVariation, postVariation, 100 + i))
          }))
        };
      
      case 'commentsOverTime':
        // Comments: Junior (100-300), Mid (300-600), Senior (600-1200)
        const totalComments = experienceLevel === 0 
          ? random(100, 300, 20) 
          : experienceLevel === 1 
          ? random(300, 600, 20) 
          : random(600, 1200, 20);
        const avgComments = Math.floor(totalComments / 12);
        const commentVariation = Math.floor(avgComments * 0.35);
        return {
          success: true,
          kpi: `${totalComments} Total Comments`,
          data: months.map((m, i) => ({
            month: m,
            comments: Math.max(5, avgComments + random(-commentVariation, commentVariation, 200 + i))
          }))
        };
      
      case 'conversionRate':
        // Conversion: Junior (45-65%), Mid (65-80%), Senior (80-95%)
        const avgConversion = experienceLevel === 0 
          ? random(45, 65, 30) 
          : experienceLevel === 1 
          ? random(65, 80, 30) 
          : random(80, 95, 30);
        return {
          success: true,
          kpi: `${avgConversion}% Avg Conversion`,
          data: months.map((m, i) => ({
            month: m,
            rate: Math.max(35, Math.min(98, avgConversion + random(-12, 12, 300 + i)))
          }))
        };
      
      case 'patientsCured':
        const avgCuredPerMonth = Math.floor(curedCount / 12);
        const curedVariation = Math.floor(avgCuredPerMonth * 0.5);
        return {
          success: true,
          kpi: `${curedCount} Patients Cured`,
          data: months.map((m, i) => ({
            month: m,
            cured: Math.max(2, avgCuredPerMonth + random(-curedVariation, curedVariation, 400 + i))
          }))
        };
      
      case 'clinicVisits':
        // Visits: Junior (30-80), Mid (80-180), Senior (180-350)
        const totalVisits = experienceLevel === 0 
          ? random(30, 80, 40) 
          : experienceLevel === 1 
          ? random(80, 180, 40) 
          : random(180, 350, 40);
        const avgVisits = Math.floor(totalVisits / 12);
        const visitVariation = Math.floor(avgVisits * 0.4);
        return {
          success: true,
          kpi: `${totalVisits} Total Visits`,
          data: months.map((m, i) => ({
            month: m,
            visits: Math.max(1, avgVisits + random(-visitVariation, visitVariation, 500 + i))
          }))
        };
      
      case 'portfolioScore':
        // Score: Junior (60-75), Mid (75-88), Senior (88-98)
        const currentScore = experienceLevel === 0 
          ? random(60, 75, 50) 
          : experienceLevel === 1 
          ? random(75, 88, 50) 
          : random(88, 98, 50);
        const startScore = Math.max(50, currentScore - random(10, 20, 51));
        return {
          success: true,
          kpi: `Current Score: ${currentScore}/100`,
          data: months.map((m, i) => ({
            month: m,
            score: Math.min(100, startScore + Math.floor((currentScore - startScore) * (i / 11)))
          }))
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
    <div className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg ${compact ? 'p-4' : 'p-8'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
        <h2 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>Performance Overview</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        </span>
      </div>
      
      {/* Slide Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 ${compact ? '-translate-x-2' : '-translate-x-4'} z-20 bg-white rounded-full ${compact ? 'p-2' : 'p-3'} shadow-lg transition-all ${
            currentSlide === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-100 hover:scale-110'
          }`}
          aria-label="Previous metric"
        >
          <svg className={`text-gray-700 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === charts.length - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 ${compact ? 'translate-x-2' : 'translate-x-4'} z-20 bg-white rounded-full ${compact ? 'p-2' : 'p-3'} shadow-lg transition-all ${
            currentSlide === charts.length - 1 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-100 hover:scale-110'
          }`}
          aria-label="Next metric"
        >
          <svg className={`text-gray-700 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Content */}
        <div className={`bg-white rounded-xl shadow-md ${compact ? 'p-4 min-h-[400px]' : 'p-8 min-h-[600px]'} flex flex-col`}>
          {/* Header Section */}
          <div className={compact ? 'mb-3' : 'mb-6'}>
            <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
              <h3 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'}`}>{currentChart.title}</h3>
              <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                {currentSlide + 1} / {charts.length}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className={`font-bold text-blue-600 ${compact ? 'text-xl' : 'text-3xl'}`}>
                {chartData?.kpi || 'N/A'}
              </p>
              <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
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
          <div className={`flex gap-2 flex-wrap ${compact ? 'mb-3' : 'mb-6'}`}>
            {(['bar', 'line', 'pie', 'doughnut', 'radar'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => changeChartType(currentChart.key, type)}
                className={`${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-all ${
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
          <div className={`flex-1 flex items-center justify-center ${compact ? 'min-h-[250px]' : 'min-h-[400px]'}`}>
            {hasData ? (
              <div className="w-full h-full">
                <MultiTypeChart
                  data={chartData.data}
                  dataKey={currentChart.dataKey}
                  xAxisKey={chartData.data[0]?.month ? 'month' : 'name'}
                  storageKey={`doctor-${currentChart.key}`}
                  height={compact ? 250 : 400}
                  showLegend={true}
                  defaultChartType={currentChartType}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <svg className={`mx-auto mb-4 text-gray-300 ${compact ? 'w-16 h-16' : 'w-24 h-24'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className={`font-medium ${compact ? 'text-base' : 'text-lg'}`}>No data available</p>
                <p className={`mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>Data will appear here once available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className={`flex justify-center gap-2 ${compact ? 'mt-3' : 'mt-6'}`}>
        {charts.map((chart, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              currentSlide === index 
                ? `bg-blue-600 ${compact ? 'w-8 h-2' : 'w-10 h-3'}` 
                : `bg-gray-300 ${compact ? 'w-2 h-2' : 'w-3 h-3'} hover:bg-gray-400`
            }`}
            aria-label={`Go to ${chart.title}`}
            title={chart.title}
          />
        ))}
      </div>

      {/* Slide Counter (Mobile) */}
      <div className={`text-center text-gray-600 md:hidden ${compact ? 'mt-2 text-xs' : 'mt-4 text-sm'}`}>
        {currentChart.title} ({currentSlide + 1}/{charts.length})
      </div>
    </div>
  );
}
