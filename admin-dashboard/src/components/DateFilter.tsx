import React, { useState } from 'react';
import { DateFilter as DateFilterEnum } from '../lib/api';

interface DateFilterProps {
  onFilterChange: (filter: DateFilterEnum, customStartDate?: string, customEndDate?: string) => void;
  currentFilter: DateFilterEnum;
  customStartDate?: string;
  customEndDate?: string;
}

const DateFilter: React.FC<DateFilterProps> = ({ 
  onFilterChange, 
  currentFilter, 
  customStartDate, 
  customEndDate 
}) => {
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(currentFilter === DateFilterEnum.CUSTOM);
  const [startDate, setStartDate] = useState(customStartDate || '');
  const [endDate, setEndDate] = useState(customEndDate || '');

  const handleFilterChange = (filter: DateFilterEnum) => {
    if (filter === DateFilterEnum.CUSTOM) {
      setShowCustomDatePicker(true);
      // Don't trigger the filter change yet, wait for the user to select dates
    } else {
      setShowCustomDatePicker(false);
      onFilterChange(filter);
    }
  };

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      onFilterChange(DateFilterEnum.CUSTOM, startDate, endDate);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange(DateFilterEnum.TODAY)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            currentFilter === DateFilterEnum.TODAY
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleFilterChange(DateFilterEnum.YESTERDAY)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            currentFilter === DateFilterEnum.YESTERDAY
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => handleFilterChange(DateFilterEnum.PAST_WEEK)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            currentFilter === DateFilterEnum.PAST_WEEK
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Past Week
        </button>
        <button
          onClick={() => handleFilterChange(DateFilterEnum.PAST_MONTH)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            currentFilter === DateFilterEnum.PAST_MONTH
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Past Month
        </button>
        <button
          onClick={() => handleFilterChange(DateFilterEnum.CUSTOM)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            currentFilter === DateFilterEnum.CUSTOM
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Custom Range
        </button>
      </div>

      {showCustomDatePicker && (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCustomDateApply}
            disabled={!startDate || !endDate}
            className={`px-4 py-2 rounded-md transition-colors ${
              !startDate || !endDate
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateFilter; 