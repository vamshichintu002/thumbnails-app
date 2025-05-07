'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Chart, { BarChartPlaceholder, PieChartPlaceholder } from '../../components/Chart';
import Table from '../../components/Table';
import { BarChartIcon } from '../../components/Icons';

// Define category type
interface Category {
  id: number;
  name: string;
  description: string;
  imageCount: number;
  createdAt: string;
  popularity: number; // Percentage
}

// Define monthly data type
interface MonthlyData {
  month: string;
  [key: string]: string | number; // Allow string indexing for category names
}

// Mock data for demonstration
const categories: Category[] = [
  { 
    id: 1, 
    name: 'E-commerce', 
    description: 'Thumbnails for online stores and product listings', 
    imageCount: 245, 
    createdAt: '2023-10-15',
    popularity: 19.2
  },
  { 
    id: 2, 
    name: 'Blog', 
    description: 'Header images for blog posts and articles', 
    imageCount: 189, 
    createdAt: '2023-10-15',
    popularity: 14.8
  },
  { 
    id: 3, 
    name: 'Social Media', 
    description: 'Images optimized for social media platforms', 
    imageCount: 427, 
    createdAt: '2023-10-15',
    popularity: 33.5
  },
  { 
    id: 4, 
    name: 'Video', 
    description: 'Thumbnails for video content', 
    imageCount: 312, 
    createdAt: '2023-10-15',
    popularity: 24.5
  },
  { 
    id: 5, 
    name: 'Audio', 
    description: 'Cover images for podcasts and audio content', 
    imageCount: 98, 
    createdAt: '2023-11-20',
    popularity: 7.7
  },
];

const categoryColumns = [
  { header: 'Name', accessor: 'name' as keyof Category },
  { header: 'Description', accessor: 'description' as keyof Category },
  { header: 'Images', accessor: 'imageCount' as keyof Category },
  { 
    header: 'Popularity', 
    accessor: (category: Category) => (
      <div className="flex items-center">
        <span className="mr-2">{category.popularity}%</span>
        <div className="w-24 bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${category.popularity}%` }}
          ></div>
        </div>
      </div>
    ) 
  },
];

// Monthly data for each category
const monthlyData: MonthlyData[] = [
  { month: 'Jan', 'E-commerce': 18, 'Blog': 12, 'Social Media': 25, 'Video': 20, 'Audio': 8 },
  { month: 'Feb', 'E-commerce': 22, 'Blog': 15, 'Social Media': 30, 'Video': 22, 'Audio': 10 },
  { month: 'Mar', 'E-commerce': 25, 'Blog': 18, 'Social Media': 35, 'Video': 25, 'Audio': 12 },
  { month: 'Apr', 'E-commerce': 30, 'Blog': 20, 'Social Media': 40, 'Video': 28, 'Audio': 15 },
  { month: 'May', 'E-commerce': 35, 'Blog': 22, 'Social Media': 45, 'Video': 30, 'Audio': 18 },
  { month: 'Jun', 'E-commerce': 40, 'Blog': 25, 'Social Media': 50, 'Video': 35, 'Audio': 20 },
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  // Calculate total images
  const totalImages = categories.reduce((sum, category) => sum + category.imageCount, 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-gray-600">Manage and monitor image categories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          title="Total Categories" 
          value={categories.length.toString()} 
          icon={<BarChartIcon className="h-6 w-6" />}
        />
        <Card 
          title="Total Images" 
          value={totalImages.toLocaleString()} 
          icon={<BarChartIcon className="h-6 w-6" />}
        />
        <Card 
          title="Most Popular" 
          value="Social Media" 
          description="33.5% of all images"
          icon={<BarChartIcon className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart 
          title="Category Distribution" 
          description="Distribution of images across categories"
        >
          <PieChartPlaceholder />
        </Chart>
        <Chart 
          title="Category Growth" 
          description="Growth of categories over time"
        >
          <BarChartPlaceholder />
        </Chart>
      </div>

      {/* Categories Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Categories</h2>
        <Table 
          columns={categoryColumns} 
          data={categories} 
          onRowClick={handleCategoryClick}
        />
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Category Details</h2>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{selectedCategory.createdAt}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedCategory.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Images</p>
                <p className="font-medium">{selectedCategory.imageCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Popularity</p>
                <div className="flex items-center">
                  <span className="mr-2">{selectedCategory.popularity}%</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${selectedCategory.popularity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Monthly Trend</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyData.map((data, index) => {
                    // Safely get the value as a number
                    const value = Number(data[selectedCategory.name] || 0);
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-48 flex items-end">
                          <div 
                            className="w-8 bg-blue-500 rounded-t-md"
                            style={{ height: `${value * 2}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-2">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Category
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setSelectedCategory(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 