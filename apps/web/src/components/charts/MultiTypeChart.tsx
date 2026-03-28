'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// Glassmorphic color palette matching the design system
const COLORS = [
  '#669ae3', // Primary brand - Doctors
  '#1ecb6b', // Success - Patients
  '#ff4d6a', // Danger - High priority
  '#f5a623', // Warning - Medium priority
  '#8899b4', // Text secondary - Low priority
  '#a78bfa', // Violet
  '#06B6D4',
  '#84CC16'
];

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

interface MultiTypeChartProps {
  data: any[];
  chartType?: ChartType;
  dataKey: string;
  xAxisKey?: string;
  title?: string;
  storageKey?: string;
  height?: number;
  showLegend?: boolean;
  multiSeries?: { key: string; name: string; color?: string }[];
  defaultChartType?: ChartType;
}

// Custom tooltip with glassmorphic styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ color: entry.color }}>
            <span className="tooltip-value">{entry.value}</span>
            {entry.name && <span className="ml-2 text-xs">({entry.name})</span>}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MultiTypeChart({
  data,
  chartType: initialChartType = 'bar',
  dataKey,
  xAxisKey = 'name',
  title,
  storageKey,
  height = 300,
  showLegend = true,
  multiSeries,
  defaultChartType
}: MultiTypeChartProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType || initialChartType);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // If defaultChartType is provided, use it
    if (defaultChartType) {
      setChartType(defaultChartType);
      return;
    }
    
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`chart-type-${storageKey}`);
      if (saved && ['bar', 'line', 'pie', 'doughnut', 'radar'].includes(saved)) {
        setChartType(saved as ChartType);
      }
    }
  }, [storageKey, defaultChartType]);

  const handleChartTypeChange = (type: ChartType) => {
    setIsAnimating(true);
    setChartType(type);
    
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`chart-type-${storageKey}`, type);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 154, 227, 0.08)" strokeWidth={1} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#4d5f7a" 
              style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis 
              stroke="#4d5f7a"
              style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', color: '#8899b4' }} />}
            {multiSeries ? (
              multiSeries.map((series, index) => (
                <Bar 
                  key={series.key}
                  dataKey={series.key}
                  name={series.name}
                  fill={series.color || COLORS[index % COLORS.length]}
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              ))
            ) : (
              <Bar 
                dataKey={dataKey} 
                radius={[6, 6, 0, 0]}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            )}
          </BarChart>
        );

      case 'line':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {multiSeries ? (
                multiSeries.map((series, index) => (
                  <linearGradient key={series.key} id={`gradient-${series.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={series.color || COLORS[index % COLORS.length]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={series.color || COLORS[index % COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))
              ) : (
                <linearGradient id="gradient-default" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 154, 227, 0.08)" strokeWidth={1} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#4d5f7a"
              style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis 
              stroke="#4d5f7a"
              style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', color: '#8899b4' }} />}
            {multiSeries ? (
              multiSeries.map((series, index) => (
                <React.Fragment key={series.key}>
                  <Area
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color || COLORS[index % COLORS.length]}
                    fill={`url(#gradient-${series.key})`}
                    strokeWidth={2}
                    dot={{ r: 4, fill: series.color || COLORS[index % COLORS.length], strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }}
                    activeDot={{ r: 6 }}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </React.Fragment>
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={COLORS[0]}
                fill="url(#gradient-default)"
                strokeWidth={2}
                dot={{ r: 4, fill: COLORS[0], strokeWidth: 2, stroke: 'rgba(255,255,255,0.2)' }}
                activeDot={{ r: 6 }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        );

      case 'pie':
      case 'doughnut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={chartType === 'doughnut' ? 100 : 120}
              innerRadius={chartType === 'doughnut' ? 60 : 0}
              fill="#8884d8"
              dataKey={dataKey}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      case 'radar':
        const normalizedData = data.map(item => {
          const normalized: any = { [xAxisKey]: item[xAxisKey] };
          if (multiSeries) {
            multiSeries.forEach(series => {
              const max = Math.max(...data.map(d => d[series.key] || 0));
              normalized[series.key] = max > 0 ? (item[series.key] / max) * 100 : 0;
            });
          } else {
            const max = Math.max(...data.map(d => d[dataKey] || 0));
            normalized[dataKey] = max > 0 ? (item[dataKey] / max) * 100 : 0;
          }
          return normalized;
        });

        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={normalizedData}>
            <PolarGrid stroke="rgba(102, 154, 227, 0.1)" />
            <PolarAngleAxis 
              dataKey={xAxisKey} 
              stroke="#8899b4"
              style={{ fontSize: '11px' }}
            />
            <PolarRadiusAxis stroke="#8899b4" />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px', color: '#8899b4' }} />}
            {multiSeries ? (
              multiSeries.map((series, index) => (
                <Radar
                  key={series.key}
                  name={series.name}
                  dataKey={series.key}
                  stroke={series.color || COLORS[index % COLORS.length]}
                  fill={series.color || COLORS[index % COLORS.length]}
                  fillOpacity={0.15}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              ))
            ) : (
              <Radar
                name={title || dataKey}
                dataKey={dataKey}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.15}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )}
          </RadarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-lg font-semibold" style={{ color: '#f3f6fa' }}>{title}</h3>}
        <div className="chart-toggle-group">
          {[
            { type: 'bar' as ChartType, icon: '📊', label: 'Bar' },
            { type: 'line' as ChartType, icon: '📈', label: 'Line' },
            { type: 'pie' as ChartType, icon: '🥧', label: 'Pie' },
            { type: 'doughnut' as ChartType, icon: '🍩', label: 'Doughnut' },
            { type: 'radar' as ChartType, icon: '🎯', label: 'Radar' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => handleChartTypeChange(type)}
              className={`chart-toggle-btn ${chartType === type ? 'active' : ''}`}
              title={label}
              aria-label={`Switch to ${label} chart`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div 
        className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
