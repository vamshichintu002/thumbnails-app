'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import Chart, { BarChartPlaceholder, LineChartPlaceholder, PieChartPlaceholder } from '../components/Chart';
import Table from '../components/Table';
import { UsersIcon, ImageIcon, BarChartIcon } from '../components/Icons';
import api, { Generation, GenerationType, DateFilter as DateFilterEnum } from '../lib/api';
import DateFilter from '../components/DateFilter';

// Define user type for the table
interface UserDisplay {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
}

// Category colors for charts
const CATEGORY_COLORS = {
  [GenerationType.TEXT_TO_THUMBNAIL]: 'bg-blue-500 hover:bg-blue-600',
  [GenerationType.IMAGE_TO_THUMBNAIL]: 'bg-green-500 hover:bg-green-600',
  [GenerationType.YOUTUBE_TO_THUMBNAIL]: 'bg-purple-500 hover:bg-purple-600',
  'unknown': 'bg-gray-500 hover:bg-gray-600'
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState<UserDisplay[]>([]);
  const [userGrowth, setUserGrowth] = useState<{date: string, count: number}[]>([]);
  const [generationGrowth, setGenerationGrowth] = useState<{date: string, count: number}[]>([]);
  const [categoryData, setCategoryData] = useState<{type: string, count: number, label: string}[]>([]);
  const [generationByType, setGenerationByType] = useState<{date: string, [key: string]: number | string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterEnum>(DateFilterEnum.PAST_MONTH);
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, customStartDate, customEndDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user count based on filter
      const users = await api.users.getCountByDateFilter(dateFilter, customStartDate, customEndDate);
      setUserCount(users);
      
      // Fetch generation count based on filter
      const generations = await api.generations.getCountByDateFilter(dateFilter, customStartDate, customEndDate);
      setGenerationCount(generations);
      
      // Fetch recent users
      const profiles = await api.users.getAll();
      const formattedUsers = profiles.slice(0, 5).map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        joinedAt: new Date(user.created_at).toLocaleDateString(),
        status: user.subscription_status || 'active'
      }));
      setRecentUsers(formattedUsers);
      
      // Fetch user growth data with filter
      const userGrowthData = await api.analytics.getUserGrowthWithDateFilter('day', dateFilter, customStartDate, customEndDate);
      setUserGrowth(userGrowthData);
      
      // Fetch generation growth data with filter
      const generationGrowthData = await api.analytics.getGenerationGrowthWithDateFilter('day', dateFilter, customStartDate, customEndDate);
      setGenerationGrowth(generationGrowthData);
      
      // Fetch category data with filter
      const categoryStats = await api.generations.getCountBySpecificTypesWithDateFilter(dateFilter, customStartDate, customEndDate);
      setCategoryData(categoryStats);
      
      // Fetch generation by type over time with filter
      const typeOverTime = await api.analytics.getGenerationByTypeOverTimeWithDateFilter('day', dateFilter, customStartDate, customEndDate);
      setGenerationByType(typeOverTime);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (filter: DateFilterEnum, startDate?: string, endDate?: string) => {
    setDateFilter(filter);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  const userColumns = [
    { header: 'Name', accessor: 'name' as keyof UserDisplay },
    { header: 'Email', accessor: 'email' as keyof UserDisplay },
    { header: 'Joined', accessor: 'joinedAt' as keyof UserDisplay },
    { 
      header: 'Status', 
      accessor: (user: UserDisplay) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      ) 
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your thumbnail generator admin dashboard</p>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Filter Dashboard</h2>
        <DateFilter 
          onFilterChange={handleDateFilterChange} 
          currentFilter={dateFilter}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card 
          title="Total Users" 
          value={userCount.toLocaleString()} 
          icon={<UsersIcon className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <Card 
          title="Images Generated" 
          value={generationCount.toLocaleString()} 
          icon={<ImageIcon className="h-6 w-6" />}
          trend={{ value: 23, isPositive: true }}
        />
        <Card 
          title="Generation Types" 
          value="3" 
          icon={<BarChartIcon className="h-6 w-6" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart 
          title="User Growth" 
          description="New users over time"
        >
          {userGrowth.length > 0 ? (
            <div className="h-full flex items-end justify-between gap-2 pt-5">
              {userGrowth.map((item, index) => {
                // Find the maximum count to normalize heights
                const maxCount = Math.max(...userGrowth.map(d => d.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 rounded-t-md w-8"
                      style={{ height: `${height}%` }}
                      title={`${item.date}: ${item.count} users`}
                    >
                      <div className="h-full w-full hover:bg-blue-600 transition-colors cursor-pointer"></div>
                    </div>
                    <span className="text-xs mt-2">{item.date.split('-')[2] || ''}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available for the selected period</p>
            </div>
          )}
        </Chart>
        <Chart 
          title="Images by Category" 
          description="Distribution of images across categories"
        >
          {categoryData.length > 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              {/* Simple pie chart visualization */}
              <div className="flex gap-4 mb-6">
                {categoryData.map((category, index) => {
                  const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);
                  const percentage = total > 0 ? ((category.count / total) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-8 flex items-center justify-center"
                        style={{ 
                          borderColor: CATEGORY_COLORS[category.type as keyof typeof CATEGORY_COLORS]?.split(' ')[0] || 'bg-gray-500',
                          borderWidth: '8px'
                        }}
                      >
                        <span className="text-lg font-bold">{percentage}%</span>
                      </div>
                      <span className="mt-2 text-sm font-medium">{category.label}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${CATEGORY_COLORS[category.type as keyof typeof CATEGORY_COLORS]?.split(' ')[0] || 'bg-gray-500'}`}></div>
                    <span>{category.label}: {category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available for the selected period</p>
            </div>
          )}
        </Chart>
      </div>

      <div className="mb-8">
        <Chart 
          title="Generation Types Over Time" 
          description="Number of images generated by type per day"
        >
          {generationByType.length > 0 ? (
            <div className="h-full">
              <div className="flex items-end justify-between gap-2 pt-5 h-64">
                {generationByType.map((item, index) => {
                  // Calculate total height for this day
                  const textCount = Number(item[GenerationType.TEXT_TO_THUMBNAIL] || 0);
                  const imageCount = Number(item[GenerationType.IMAGE_TO_THUMBNAIL] || 0);
                  const youtubeCount = Number(item[GenerationType.YOUTUBE_TO_THUMBNAIL] || 0);
                  const totalCount = textCount + imageCount + youtubeCount;
                  
                  // Find the maximum count across all days to normalize heights
                  const maxCount = Math.max(...generationByType.map(d => {
                    return Number(d[GenerationType.TEXT_TO_THUMBNAIL] || 0) + 
                           Number(d[GenerationType.IMAGE_TO_THUMBNAIL] || 0) + 
                           Number(d[GenerationType.YOUTUBE_TO_THUMBNAIL] || 0);
                  }));
                  
                  // Calculate heights as percentages
                  const totalHeight = maxCount > 0 ? (totalCount / maxCount) * 100 : 0;
                  const textHeight = totalHeight > 0 ? (textCount / totalCount) * totalHeight : 0;
                  const imageHeight = totalHeight > 0 ? (imageCount / totalCount) * totalHeight : 0;
                  const youtubeHeight = totalHeight > 0 ? (youtubeCount / totalCount) * totalHeight : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex flex-col-reverse w-12">
                        {/* Text to Thumbnail */}
                        {textHeight > 0 && (
                          <div 
                            className={`${CATEGORY_COLORS[GenerationType.TEXT_TO_THUMBNAIL]} w-full`}
                            style={{ height: `${textHeight}%` }}
                            title={`${item.date}: ${textCount} text-to-thumbnail`}
                          ></div>
                        )}
                        
                        {/* Image to Thumbnail */}
                        {imageHeight > 0 && (
                          <div 
                            className={`${CATEGORY_COLORS[GenerationType.IMAGE_TO_THUMBNAIL]} w-full`}
                            style={{ height: `${imageHeight}%` }}
                            title={`${item.date}: ${imageCount} image-to-thumbnail`}
                          ></div>
                        )}
                        
                        {/* YouTube to Thumbnail */}
                        {youtubeHeight > 0 && (
                          <div 
                            className={`${CATEGORY_COLORS[GenerationType.YOUTUBE_TO_THUMBNAIL]} w-full`}
                            style={{ height: `${youtubeHeight}%` }}
                            title={`${item.date}: ${youtubeCount} youtube-to-thumbnail`}
                          ></div>
                        )}
                      </div>
                      <span className="text-xs mt-2">{item.date.split('-')[2] || ''}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center mt-6 gap-6">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${CATEGORY_COLORS[GenerationType.TEXT_TO_THUMBNAIL].split(' ')[0]}`}></div>
                  <span>Text to Thumbnail</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${CATEGORY_COLORS[GenerationType.IMAGE_TO_THUMBNAIL].split(' ')[0]}`}></div>
                  <span>Image to Thumbnail</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${CATEGORY_COLORS[GenerationType.YOUTUBE_TO_THUMBNAIL].split(' ')[0]}`}></div>
                  <span>YouTube to Thumbnail</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available for the selected period</p>
            </div>
          )}
        </Chart>
      </div>

      {/* Recent Users Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <Table 
          columns={userColumns} 
          data={recentUsers} 
        />
    </div>
    </DashboardLayout>
  );
}
