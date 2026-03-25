'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COLORS = ['#00BCD4', '#FF4500', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722', '#3F51B5', '#E91E63'];

type ChartType = 'pie' | 'column' | 'horizontalBar' | 'donut';

export function DoctorSpecialtyChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/enhanced-analytics/doctor-specialty-distribution`);
      const result = await response.json();
      
      if (result.success) {
        const chartData = result.data.distribution.map((item: any, index: number) => ({
          name: item.specialty,
          value: item.count,
          percentage: parseFloat(item.percentage),
          fill: COLORS[index % COLORS.length]
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching specialty distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width + 10} 
        y={y + 12} 
        fill="#333" 
        fontSize={14} 
        fontWeight={600}
      >
        {value}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Chart Type Selector */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              {chartType === 'pie' ? 'Pie Chart' : 
               chartType === 'donut' ? 'Donut Chart' :
               chartType === 'column' ? 'Column Chart' : 
               'Horizontal Bar'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setChartType('pie');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors rounded-t-lg ${
                  chartType === 'pie' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Pie Chart
              </button>
              <button
                onClick={() => {
                  setChartType('donut');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  chartType === 'donut' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Donut Chart
              </button>
              <button
                onClick={() => {
                  setChartType('column');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  chartType === 'column' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Column Chart
              </button>
              <button
                onClick={() => {
                  setChartType('horizontalBar');
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
                  chartType === 'horizontalBar' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
                }`}
              >
                Horizontal Bar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Display */}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'pie' ? (
          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} doctors`, name]} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        ) : chartType === 'donut' ? (
          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} doctors`, name]} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        ) : chartType === 'horizontalBar' ? (
          <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 100, bottom: 20, left: 130 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" />
            <YAxis 
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value} doctors`, 'Count']}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]}>
              <LabelList dataKey="value" position="right" style={{ fontSize: 14, fontWeight: 600, fill: '#333' }} />
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Number of Doctors', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value} doctors`, 'Count']}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
