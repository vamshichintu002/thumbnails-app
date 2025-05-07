import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function Card({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className = '' 
}: CardProps) {
  return (
    <div className={`rounded-lg p-6 bg-white/90 backdrop-blur-sm border border-gray-200 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-3xl font-bold mt-2 text-black">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-600 ml-2">from last period</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
