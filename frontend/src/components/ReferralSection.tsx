import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, CheckCircle } from 'lucide-react';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeUsers: number;
  creditsEarned: number;
}

export function ReferralSection({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        console.log('Fetching referral stats for userId:', userId);
        const response = await fetch(`http://localhost:3001/api/referral-stats/${userId}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Referral stats response:', response);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Referral stats data:', data);
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch referral stats');
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch referral stats');
      }
    };

    const fetchReferralLink = async () => {
      try {
        console.log('Fetching referral link for userId:', userId);
        const response = await fetch(`http://localhost:3001/api/referral-link/${userId}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Referral link response:', response);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Referral link data:', data);
        
        if (data.success) {
          setReferralLink(data.data.referralLink);
        } else {
          throw new Error(data.message || 'Failed to fetch referral link');
        }
      } catch (error) {
        console.error('Error fetching referral link:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch referral link');
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      if (!userId) {
        setError('No user ID provided');
        setIsLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchReferralStats(),
          fetchReferralLink()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setError('Failed to copy to clipboard');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg">
          No referral data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Referral Link</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Total Referrals</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{stats.totalReferrals}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Users</h3>
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{stats.activeUsers}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Credits Earned</h3>
            <Users className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{stats.creditsEarned}</p>
        </motion.div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">How It Works</h2>
        <div className="space-y-4 text-gray-300">
          <p>1. Share your referral link with friends</p>
          <p>2. When they sign up using your link, you get 30 credits</p>
          <p>3. Your friends also get 50 bonus credits to start</p>
          <p>4. There's no limit to how many friends you can refer!</p>
        </div>
      </div>
    </div>
  );
}
