'use client';

export default function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-6 w-1/3"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-8 w-16"></div>
          ))}
        </div>
      </div>
      <div className="skeleton h-[220px] rounded-lg mb-4"></div>
      <div className="flex gap-4">
        <div className="skeleton h-16 flex-1 rounded-lg"></div>
        <div className="skeleton h-16 flex-1 rounded-lg"></div>
      </div>
    </div>
  );
}
