'use client';

import React from 'react';

interface ChartProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Chart({ 
  title, 
  description, 
  className = '',
  children 
}: ChartProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-black tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}

// Placeholder for actual chart implementation
// In a real application, you would use a charting library like Chart.js, Recharts, etc.
export function BarChartPlaceholder() {
  return (
    <div className="h-full flex items-end justify-between gap-2 pt-5">
      {[35, 55, 25, 45, 65, 30, 50, 40, 60, 35, 45, 55].map((height, index) => (
        <div 
          key={index} 
          className="bg-blue-600/80 rounded-t-md w-full"
          style={{ height: `${height}%` }}
        >
          <div className="h-full w-full hover:bg-blue-500 transition-colors cursor-pointer"></div>
        </div>
      ))}
    </div>
  );
}

export function LineChartPlaceholder() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <p className="text-gray-600">Line Chart Visualization</p>
    </div>
  );
}

export function PieChartPlaceholder() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full bg-blue-600/80" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}></div>
        <div className="absolute inset-0 rounded-full bg-green-600/80" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%, 0 50%)' }}></div>
        <div className="absolute inset-0 rounded-full bg-yellow-600/80" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
        <div className="absolute inset-0 rounded-full bg-red-600/80" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/50 w-16 h-16 rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 