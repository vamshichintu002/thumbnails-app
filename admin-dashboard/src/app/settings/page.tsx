'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { SettingsIcon } from '../../components/Icons';

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Thumbnail Generator',
    siteDescription: 'AI-powered thumbnail generation for content creators',
    contactEmail: 'support@thumbnailgenerator.com',
  });

  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk_test_abcdefghijklmnopqrstuvwxyz123456',
    requestsPerMinute: '60',
    maxImageSize: '2048',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    errorAlerts: true,
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleApiSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would save the settings to a backend
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure your dashboard settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralSettingsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={generalSettings.siteDescription}
                onChange={handleGeneralSettingsChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">API Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="apiKey"
                  name="apiKey"
                  value={apiSettings.apiKey}
                  onChange={handleApiSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-2 py-1 rounded"
                  onClick={() => alert('Regenerated API Key')}
                >
                  Regenerate
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="requestsPerMinute" className="block text-sm font-medium text-gray-700 mb-1">
                Requests Per Minute
              </label>
              <input
                type="number"
                id="requestsPerMinute"
                name="requestsPerMinute"
                value={apiSettings.requestsPerMinute}
                onChange={handleApiSettingsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="maxImageSize" className="block text-sm font-medium text-gray-700 mb-1">
                Max Image Size (px)
              </label>
              <input
                type="number"
                id="maxImageSize"
                name="maxImageSize"
                value={apiSettings.maxImageSize}
                onChange={handleApiSettingsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <SettingsIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationSettingsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                Email Notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dailyReports"
                name="dailyReports"
                checked={notificationSettings.dailyReports}
                onChange={handleNotificationSettingsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="dailyReports" className="ml-2 block text-sm text-gray-700">
                Daily Reports
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="weeklyReports"
                name="weeklyReports"
                checked={notificationSettings.weeklyReports}
                onChange={handleNotificationSettingsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-700">
                Weekly Reports
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="errorAlerts"
                name="errorAlerts"
                checked={notificationSettings.errorAlerts}
                onChange={handleNotificationSettingsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="errorAlerts" className="ml-2 block text-sm text-gray-700">
                Error Alerts
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Settings
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 