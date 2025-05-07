'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Chart, { LineChartPlaceholder } from '../../components/Chart';
import Table from '../../components/Table';
import { UsersIcon } from '../../components/Icons';
import api from '../../lib/api';

// Define user type for display
interface UserDisplay {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: string;
  lastActive: string;
  imagesGenerated: number;
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [userGrowth, setUserGrowth] = useState<{date: string, count: number}[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        
        // Fetch user count
        const totalCount = await api.users.getCount();
        setTotalUsers(totalCount);
        
        // Fetch active users count
        const activeCount = await api.users.getActiveCount();
        setActiveUsers(activeCount);
        
        // Fetch new users count (last 7 days)
        const newCount = await api.users.getNewUsersCount(7);
        setNewUsers(newCount);
        
        // Fetch all users
        const profiles = await api.users.getAll();
        
        // Get generation counts for each user
        const userGenerations: {[key: string]: number} = {};
        for (const profile of profiles) {
          try {
            const generations = await api.generations.getByUserId(profile.id);
            userGenerations[profile.id] = generations.length;
          } catch (err) {
            console.error(`Error fetching generations for user ${profile.id}:`, err);
            userGenerations[profile.id] = 0;
          }
        }
        
        // Format users for display
        const formattedUsers = profiles.map(user => {
          // Get the last generation date as last active
          const lastActive = user.updated_at || user.created_at;
          
          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            joinedAt: new Date(user.created_at).toLocaleDateString(),
            status: user.subscription_status || 'active',
            lastActive: new Date(lastActive).toLocaleDateString(),
            imagesGenerated: userGenerations[user.id] || 0
          };
        });
        
        setUsers(formattedUsers);
        
        // Fetch user growth data
        const growthData = await api.analytics.getUserGrowth('day', 30);
        setUserGrowth(growthData);
        
      } catch (err) {
        console.error('Error fetching users data:', err);
        setError('Failed to load users data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersData();
  }, []);

  const handleUserClick = (user: UserDisplay) => {
    setSelectedUser(user);
  };

  const userColumns = [
    { header: 'Name', accessor: 'name' as keyof UserDisplay },
    { header: 'Email', accessor: 'email' as keyof UserDisplay },
    { header: 'Joined', accessor: 'joinedAt' as keyof UserDisplay },
    { header: 'Last Active', accessor: 'lastActive' as keyof UserDisplay },
    { header: 'Images', accessor: 'imagesGenerated' as keyof UserDisplay },
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-600">Manage and monitor user activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card 
          title="Total Users" 
          value={totalUsers.toLocaleString()} 
          icon={<UsersIcon className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <Card 
          title="Active Users" 
          value={activeUsers.toLocaleString()} 
          icon={<UsersIcon className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <Card 
          title="New Users (This Week)" 
          value={newUsers.toLocaleString()} 
          icon={<UsersIcon className="h-6 w-6" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* User Growth Chart */}
      <div className="mb-8">
        <Chart 
          title="User Growth" 
          description="New user registrations over time"
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
            <LineChartPlaceholder />
          )}
        </Chart>
      </div>

      {/* Users Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Users</h2>
        <Table 
          columns={userColumns} 
          data={users} 
          onRowClick={handleUserClick}
        />
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{selectedUser.joinedAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Active</p>
                <p className="font-medium">{selectedUser.lastActive}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Images Generated</p>
                <p className="font-medium">{selectedUser.imagesGenerated}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setSelectedUser(null)}
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