'use client';

import { useState, useEffect, useRef } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';

interface DoctorProfileChartsProps {
  doctorId: string;
}

export default function DoctorProfileCharts({ doctorId }: DoctorProfileChartsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});

  const charts = [
    { title: 'Treatment Outcomes', endpoint: 'treatment-outcomes', key: 'treatmentOutcomes' },
    { title: 'Posts Over Time', endpoint: 'posts-over-time', key: 'postsOverTime' },
    { title: 'Comments Over Time', endpoint: 'comments-over-time', key: 'commentsOverTime' },
    { title: 'Conversion Rate', endpoint: 'conversion-rate', key: 'conversionRate' },
    { title: 'Patients Cured', endpoint: 'patients-cured', key: 'patientsCured' },
    { title: 'Clinic Visits', endpoint: 'clinic-visits', key: 'clinicVisits' },
    { title: 'Portfolio Score', endpoint: 'portfolio-score', key: 'portfolioScore' }
  ];

  useEffect(() => {
    fetchAllCharts();
  }, [doctorId]);

  const fetchAllCharts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const results = await Promise.all(
        charts.map(chart =>
          fetch(`${baseUrl}/api/doctor-public-analytics/${doctorId}/${chart.endpoint}`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch ${chart.endpoint}`);
              return res.json();
            })
        )
      );

      const chartData: any = {};
      charts.forEach((chart, index) => {
        chartData[chart.key] = results[index];
      });

      setData(chartData);
    } catch (err: any) {
      console.error('Failed to fetch doctor analytics:', err);
      // Handle both Error objects and API error responses
      const errorMessage = err?.message || err?.error?.message || 'Failed to load analytics';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 340 + 16; // card width + gap
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setActiveCard(index);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 340 + 16;
      const newActiveCard = Math.round(scrollLeft / cardWidth);
      if (newActiveCard !== activeCard) {
        setActiveCard(newActiveCard);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Performance Overview</h2>
        <ChartSkeleton height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <h2 className="text-red-800 font-semibold mb-2">Error Loading Charts</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchAllCharts}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Performance Overview</h2>
      
      {/* Navigation Container */}
      <div className="relative">
        {/* Left Arrow */}
        {activeCard > 0 && (
          <button
            onClick={() => scrollToCard(activeCard - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
            aria-label="Previous chart"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Right Arrow */}
        {activeCard < charts.length - 1 && (
          <button
            onClick={() => scrollToCard(activeCard + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors hidden md:block"
            aria-label="Next chart"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ 
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {charts.map((chart, index) => {
            const chartData = data[chart.key];
            const hasData = chartData?.data && chartData.data.length > 0;
            
            return (
              <div 
                key={index}
                className="min-w-[340px] h-[420px] bg-white rounded-lg shadow-lg p-6 snap-start flex flex-col"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{chart.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {chartData?.kpi || 'Loading...'}
                </p>
                
                <div className="flex-1 min-h-0">
                  {hasData ? (
                    <MultiTypeChart
                      data={chartData.data}
                      dataKey={
                        chart.key === 'treatmentOutcomes' ? 'value' :
                        chart.key === 'postsOverTime' ? 'posts' :
                        chart.key === 'commentsOverTime' ? 'comments' :
                        chart.key === 'conversionRate' ? 'rate' :
                        chart.key === 'patientsCured' ? 'cured' :
                        chart.key === 'clinicVisits' ? 'visits' :
                        'score'
                      }
                      xAxisKey={chartData.data[0]?.month ? 'month' : 'name'}
                      storageKey={`doctor-${chart.key}`}
                      height={260}
                      showLegend={false}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>No data available</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {chartData?.kpi || 'N/A'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {charts.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`h-2 rounded-full transition-all ${
              activeCard === index ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
            aria-label={`Go to chart ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
