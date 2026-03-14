'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const COLORS = ['#00BCD4', '#FF4500', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722', '#3F51B5', '#E91E63'];

export function DoctorSpecialtyChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/enhanced-analytics/doctor-specialty-distribution`);
      const result = await response.json();
      
      if (result.success) {
        const chartData = result.data.distribution.map((item: any) => ({
          name: item.specialty,
          value: item.count,
          percentage: parseFloat(item.percentage)
        }));
        setData(chartData);
      }
    } catch (error) {
      console.error('Error fetching specialty distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Doctor Specialty Distribution</h3>
        <div className="flex items-center justify-center h-80">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Doctor Specialty Distribution</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={60}
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
      </ResponsiveContainer>
    </div>
  );
}
