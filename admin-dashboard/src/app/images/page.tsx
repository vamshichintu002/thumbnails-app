'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Chart, { BarChartPlaceholder, PieChartPlaceholder } from '../../components/Chart';
import Table from '../../components/Table';
import { ImageIcon } from '../../components/Icons';
import api, { GenerationType, DateFilter as DateFilterEnum } from '../../lib/api';
import DateFilter from '../../components/DateFilter';
import GenerationTypeFilter from '../../components/GenerationTypeFilter';
import ThumbnailGalleryItem from '../../components/ThumbnailGalleryItem';
import { ImageDisplay } from '../../types';

// Map for category display names
const CATEGORY_LABELS: Record<string, string> = {
  [GenerationType.TEXT_TO_THUMBNAIL]: 'Text to Thumbnail',
  [GenerationType.IMAGE_TO_THUMBNAIL]: 'Image to Thumbnail',
  [GenerationType.YOUTUBE_TO_THUMBNAIL]: 'YouTube to Thumbnail',
};

type FilterType = 'all' | GenerationType.TEXT_TO_THUMBNAIL | GenerationType.IMAGE_TO_THUMBNAIL | GenerationType.YOUTUBE_TO_THUMBNAIL;

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageDisplay[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageDisplay | null>(null);
  const [totalImages, setTotalImages] = useState(0);
  const [todayImages, setTodayImages] = useState(0);
  const [categoryData, setCategoryData] = useState<{name: string, label: string, count: number}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterEnum>(DateFilterEnum.PAST_MONTH);
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchImagesData();
  }, [dateFilter, typeFilter, customStartDate, customEndDate]);

  const fetchImagesData = async () => {
    try {
      setLoading(true);
      
      // Fetch total image count based on date filter
      const count = await api.generations.getCountByDateFilter(dateFilter, customStartDate, customEndDate);
      setTotalImages(count);
      
      // Fetch today's count
      const todayCount = await api.generations.getCountByDateFilter(DateFilterEnum.TODAY);
      setTodayImages(todayCount);
      
      // Fetch generations with filters
      const generations = await api.generations.getAllWithFilters(
        dateFilter, 
        typeFilter !== 'all' ? typeFilter : undefined, 
        customStartDate, 
        customEndDate
      );
      
      // Format images for display
      const formattedImages = generations.slice(0, 20).map(gen => {
        // Extract user name from the joined profiles data
        // Using any type to handle the dynamic structure from Supabase
        const genAny = gen as any;
        const userName = genAny.profiles?.full_name || 'Unknown User';
        
        const category = gen.generation_type || 'unknown';
        const categoryLabel = CATEGORY_LABELS[category] || category;
        
        return {
          id: gen.id,
          title: gen.prompt?.substring(0, 30) + '...' || 'Untitled',
          category,
          categoryLabel,
          createdAt: new Date(gen.created_at).toLocaleDateString(),
          userId: gen.user_id,
          userName,
          status: 'completed' as const, // Assuming all stored generations are completed
          thumbnailUrl: gen.output_image_url
        };
      });
      
      setImages(formattedImages);
      
      // Get counts by specific types with filter
      const categoryStats = await api.generations.getCountBySpecificTypesWithDateFilter(
        dateFilter, 
        customStartDate, 
        customEndDate
      );
      
      // Format for display
      const formattedCategoryData = categoryStats.map(item => ({
        name: item.type,
        label: item.label,
        count: item.count
      }));
      
      setCategoryData(formattedCategoryData);
      
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

  const imageColumns = [
    { 
      header: 'Thumbnail', 
      accessor: (image: ImageDisplay) => (
        <img 
          src={image.thumbnailUrl} 
          alt={image.title} 
          className="w-12 h-12 object-cover rounded"
        />
      ) 
    },
    { header: 'Title', accessor: 'title' as keyof ImageDisplay },
    { 
      header: 'Category', 
      accessor: (image: ImageDisplay) => image.categoryLabel
    },
    { header: 'Created', accessor: 'createdAt' as keyof ImageDisplay },
    { header: 'User', accessor: 'userName' as keyof ImageDisplay },
    { 
      header: 'Status', 
      accessor: (image: ImageDisplay) => {
        let statusClass = '';
        
        switch(image.status) {
          case 'completed':
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'processing':
            statusClass = 'bg-blue-100 text-blue-800';
            break;
          case 'failed':
            statusClass = 'bg-red-100 text-red-800';
            break;
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {image.status}
          </span>
        );
      } 
    },
  ];

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
        <h1 className="text-2xl font-bold text-white">Images</h1>
        <p className="text-white/60">Monitor image generation activity</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          title="Total Images" 
          value={totalImages.toLocaleString()} 
          icon={<ImageIcon className="h-6 w-6" />}
          trend={{ value: 23, isPositive: true }}
          className="glass-panel"
        />
        <Card 
          title="Images Today" 
          value={todayImages.toLocaleString()} 
          icon={<ImageIcon className="h-6 w-6" />}
          trend={{ value: 15, isPositive: true }}
          className="glass-panel"
        />
        <Card 
          title="Processing Rate" 
          value="98.5%" 
          icon={<ImageIcon className="h-6 w-6" />}
          trend={{ value: 2, isPositive: true }}
          className="glass-panel"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart 
          title="Images by Category" 
          description="Distribution of images across categories"
        >
          {categoryData.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-md">
                {categoryData.map((category, index) => {
                  const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);
                  const percentage = total > 0 ? Math.round((category.count / total) * 100) : 0;
                  
                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white/80">{category.label}</span>
                        <span className="text-sm text-white/80">{percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <PieChartPlaceholder />
          )}
        </Chart>
        
        <Chart 
          title="Image Generation Trend" 
          description="Number of images generated over time"
        >
          <BarChartPlaceholder />
        </Chart>
      </div>

      {/* Category Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category, index) => {
                const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);
                const percentage = total > 0 ? ((category.count / total) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">{percentage}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Images Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Images</h2>
        {images.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 px-4 sm:px-0">
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
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-4xl w-full glass-panel p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Image Details</h2>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200 border border-white/10"
                >
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="md:w-2/3">
                  <img 
                    src={selectedImage.thumbnailUrl} 
                    alt={selectedImage.title}
                    className="w-full h-auto rounded-lg bg-white/5"
                  />
                </div>
                
                <div className="md:w-1/3">
                  <div className="mb-4">
                    <p className="text-sm text-white/60">Title</p>
                    <p className="font-medium text-lg">{selectedImage.title}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-white/60">Category</p>
                    <p className="font-medium">{selectedImage.categoryLabel}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-white/60">Created</p>
                    <p className="font-medium">{selectedImage.createdAt}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-white/60">User</p>
                    <p className="font-medium">{selectedImage.userName}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-white/60">Status</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedImage.status === 'completed' ? 'bg-green-600/20 text-green-400' : 
                        selectedImage.status === 'processing' ? 'bg-blue-600/20 text-blue-400' : 
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {selectedImage.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 