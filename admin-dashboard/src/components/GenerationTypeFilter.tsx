import React from 'react';
import { GenerationType } from '../lib/api';

type FilterType = 'all' | GenerationType.TEXT_TO_THUMBNAIL | GenerationType.IMAGE_TO_THUMBNAIL | GenerationType.YOUTUBE_TO_THUMBNAIL;

interface GenerationTypeFilterProps {
  onFilterChange: (type: FilterType) => void;
  selectedType: FilterType;
}

const GenerationTypeFilter: React.FC<GenerationTypeFilterProps> = ({ 
  onFilterChange, 
  selectedType 
}) => {
  const filterTypes: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Text to Thumbnail', value: GenerationType.TEXT_TO_THUMBNAIL },
    { label: 'Image to Thumbnail', value: GenerationType.IMAGE_TO_THUMBNAIL },
    { label: 'YouTube to Thumbnail', value: GenerationType.YOUTUBE_TO_THUMBNAIL },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Type</h3>
      <div className="flex flex-wrap gap-2">
        {filterTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onFilterChange(type.value)}
            className={`px-3 py-1 text-sm rounded-md ${
              selectedType === type.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenerationTypeFilter; 