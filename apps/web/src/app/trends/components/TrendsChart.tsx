'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = ['#dc2626','#ea580c','#ca8a04','#16a34a','#2563eb','#7c3aed','#db2777'];

export default function TrendsChart({ data }: { data: any[] }) {
  if (!data?.length) return (
    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
      No trend data yet — data populates after the first cron run
    </div>
  );

  const dateMap: Record<string, Record<string, number>> = {};
  data.forEach(r => {
    const d = format(parseISO(r.reportDate), 'MMM dd');
    if (!dateMap[d]) dateMap[d] = {};
    dateMap[d][r.symptomTag] = (dateMap[d][r.symptomTag] || 0) + (r._sum?.caseCount || 0);
  });

  const symptoms  = [...new Set(data.map(r => r.symptomTag))].slice(0, 6);
  const chartData = Object.entries(dateMap).map(([date, vals]) => ({ date, ...vals }));

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-3">Daily trend by symptom</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {symptoms.map((s, i) => (
            <Line key={s} type="monotone" dataKey={s}
              stroke={COLORS[i % COLORS.length]} strokeWidth={1.5} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}