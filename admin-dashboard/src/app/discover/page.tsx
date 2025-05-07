'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import DateFilter from '../../components/DateFilter';
import GenerationTypeFilter from '../../components/GenerationTypeFilter';
import api, { GenerationType, DateFilter as DateFilterEnum } from '../../lib/api';
import ThumbnailGalleryItem from '../../components/ThumbnailGalleryItem';
import { ImageDisplay } from '../../types';

// Map for category display names
const CATEGORY_LABELS: Record<string, string> = {
  [GenerationType.TEXT_TO_THUMBNAIL]: 'Text to Thumbnail',
  [GenerationType.IMAGE_TO_THUMBNAIL]: 'Image to Thumbnail',
  [GenerationType.YOUTUBE_TO_THUMBNAIL]: 'YouTube to Thumbnail',
};

// Define filter type
type FilterType = 'all' | GenerationType.TEXT_TO_THUMBNAIL | GenerationType.IMAGE_TO_THUMBNAIL | GenerationType.YOUTUBE_TO_THUMBNAIL;

export default function DiscoverPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageDisplay[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterEnum>(DateFilterEnum.PAST_MONTH);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchImagesData();
  }, [dateFilter, typeFilter, customStartDate, customEndDate]);

  const fetchImagesData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching with type filter:', typeFilter);
      
      // Fetch generations with filters
      const generations = await api.generations.getAllWithFilters(
        dateFilter, 
        typeFilter !== 'all' ? typeFilter : undefined, 
        customStartDate, 
        customEndDate
      );
      
      console.log('Fetched generations:', generations);
      
      // Format images for display
      const formattedImages = generations.map(gen => {
        // Extract user name from the joined profiles data
        // Using any type to handle the dynamic structure from Supabase
        const genAny = gen as any;
        const userName = genAny.profiles?.full_name || 'Unknown User';
        
        const category = gen.generation_type || 'unknown';
        const categoryLabel = CATEGORY_LABELS[category] || category;
        
        // Determine aspect ratio from metadata or default to 16:9
        let aspectRatio: '16:9' | '9:16' = '16:9';
        
        // Check if metadata contains aspect_ratio
        if (gen.metadata && gen.metadata.aspect_ratio) {
          aspectRatio = gen.metadata.aspect_ratio;
        } 
        // If no metadata, try to detect from image dimensions if available
        else if (gen.metadata && gen.metadata.width && gen.metadata.height) {
          const { width, height } = gen.metadata;
          // If height > width, it's likely a vertical image
          if (height > width) {
            aspectRatio = '9:16';
          }
        }
        
        console.log('Generation type:', category, 'Label:', categoryLabel, 'Aspect ratio:', aspectRatio);
        
        return {
          id: gen.id,
          title: gen.prompt?.substring(0, 30) + '...' || 'Untitled',
          category,
          categoryLabel,
          createdAt: new Date(gen.created_at).toLocaleDateString(),
          userId: gen.user_id,
          userName,
          thumbnailUrl: gen.output_image_url,
          status: 'completed',
          aspectRatio
        };
      });
      
      setImages(formattedImages);
      
    } catch (err) {
      console.error('Error fetching images data:', err);
      setError('Failed to load images data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (filter: DateFilterEnum, startDate?: string, endDate?: string) => {
    setDateFilter(filter);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const handleTypeFilterChange = (type: FilterType) => {
    setTypeFilter(type);
  };

  const handleImageClick = (image: ImageDisplay) => {
    setSelectedImage(image);
  };

  const handleDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      
      // Fetch the image
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // Set the download filename
      const filename = url.split('/').pop() || 'thumbnail.png';
      link.download = filename;
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Discover</h1>
        <p className="text-white/60">Explore all user-generated thumbnails</p>
      </div>

      {/* Filters */}
      <div className="mb-6 glass-panel p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Filter Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">Date Range</h3>
            <DateFilter 
              onFilterChange={handleDateFilterChange} 
              currentFilter={dateFilter}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
            />
          </div>
          <div>
            <GenerationTypeFilter 
              onFilterChange={handleTypeFilterChange}
              selectedType={typeFilter}
            />
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        {images.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 px-4 sm:px-0">
            {images.map(image => (
              <ThumbnailGalleryItem 
                key={image.id}
                image={image}
                onClick={handleImageClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-md p-6 text-center">
            <p className="text-white/60">No images found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Image Details Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
          <div className="relative w-full h-full flex items-center justify-center overflow-auto">
            <div className="relative max-w-5xl w-full flex flex-col items-center">
              {/* Download button - positioned in top-left like in the reference image */}
              <button 
                onClick={() => handleDownload(selectedImage.thumbnailUrl)}
                disabled={isDownloading}
                className={`absolute top-6 left-6 z-10 p-3 rounded-full ${isDownloading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                aria-label="Download image"
              >
                {isDownloading ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                )}
              </button>
              
              {/* Close button - positioned in top-right like in the reference image */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/70 text-white hover:bg-black/90 shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Close image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              {/* Image */}
              <img 
                src={selectedImage.thumbnailUrl} 
                alt={selectedImage.title}
                className={`rounded-lg ${
                  selectedImage.aspectRatio === '9:16' 
                    ? 'max-h-[80vh] w-auto' 
                    : 'max-w-full max-h-[80vh]'
                } object-contain`}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 