import React from 'react';
import { GenerationType } from '../lib/api';

interface TypeFilterProps {
  onFilterChange: (type: GenerationType | null) => void;
  currentType: GenerationType | null;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ onFilterChange, currentType }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Type</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange(null)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentType === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Types
        </button>
        <button
          onClick={() => onFilterChange(GenerationType.TEXT_TO_THUMBNAIL)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentType === GenerationType.TEXT_TO_THUMBNAIL
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Text to Thumbnail
        </button>
        <button
          onClick={() => onFilterChange(GenerationType.IMAGE_TO_THUMBNAIL)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentType === GenerationType.IMAGE_TO_THUMBNAIL
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Image to Thumbnail
        </button>
        <button
          onClick={() => onFilterChange(GenerationType.YOUTUBE_TO_THUMBNAIL)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentType === GenerationType.YOUTUBE_TO_THUMBNAIL
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          YouTube to Thumbnail
        </button>
      </div>
    </div>
  );
};

export default TypeFilter; 