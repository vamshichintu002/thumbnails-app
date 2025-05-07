import supabase from './supabase';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  credits: number;
  created_at: string;
  updated_at: string;
  subscription_tier?: string;
  subscription_status?: string;
}

export interface Generation {
  id: string;
  user_id: string;
  generation_type: string;
  output_image_url: string;
  credit_cost: number;
  created_at: string;
  prompt?: string;
  input_image_url?: string;
  metadata?: {
    aspect_ratio?: '16:9' | '9:16';
    [key: string]: any;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Generation types
export enum GenerationType {
  TEXT_TO_THUMBNAIL = 'text_to_thumbnail',
  IMAGE_TO_THUMBNAIL = 'image_to_thumbnail',
  YOUTUBE_TO_THUMBNAIL = 'youtube_to_thumbnail'
}

// Date filter types
export enum DateFilter {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  PAST_WEEK = 'past_week',
  PAST_MONTH = 'past_month',
  CUSTOM = 'custom'
}

// Helper function to get date range based on filter
export const getDateRange = (filter: DateFilter, customStartDate?: string, customEndDate?: string): { startDate: string, endDate: string } => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);
  
  let startDate = new Date(now);
  
  switch (filter) {
    case DateFilter.TODAY:
      startDate.setHours(0, 0, 0, 0);
      break;
    case DateFilter.YESTERDAY:
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      break;
    case DateFilter.PAST_WEEK:
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case DateFilter.PAST_MONTH:
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case DateFilter.CUSTOM:
      if (customStartDate) {
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (customEndDate) {
        endDate.setTime(new Date(customEndDate).getTime());
        endDate.setHours(23, 59, 59, 999);
      }
      break;
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

// Helper function to normalize generation types
export const normalizeGenerationType = (type: string): string => {
  // Convert hyphens to underscores if needed
  return type.replace(/-/g, '_');
};

// API Service
const api = {
  // User related functions
  users: {
    async getAll(): Promise<User[]> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    
    async getById(userId: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async getCount(): Promise<number> {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    
    async getCountByDateFilter(filter: DateFilter, customStartDate?: string, customEndDate?: string): Promise<number> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      return count || 0;
    },
    
    async getActiveCount(): Promise<number> {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from('generations')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(1);
      
      if (error) throw error;
      return count || 0;
    },
    
    async getNewUsersCount(days: number = 7): Promise<number> {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', daysAgo.toISOString());
      
      if (error) throw error;
      return count || 0;
    }
  },
  
  // Generation related functions
  generations: {
    async getAll(): Promise<Generation[]> {
      const { data, error } = await supabase
        .from('generations')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    
    async getAllWithFilters(
      dateFilter?: DateFilter, 
      generationType?: GenerationType, 
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<Generation[]> {
      let query = supabase
        .from('generations')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      
      // Apply date filter if provided
      if (dateFilter) {
        const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      // Apply generation type filter if provided
      if (generationType) {
        query = query.eq('generation_type', generationType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    
    async getById(generationId: string): Promise<Generation | null> {
      const { data, error } = await supabase
        .from('generations')
        .select('*, profiles(full_name)')
        .eq('id', generationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async getByUserId(userId: string): Promise<Generation[]> {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    
    async getCount(): Promise<number> {
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    
    async getCountByDateFilter(filter: DateFilter, customStartDate?: string, customEndDate?: string): Promise<number> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      return count || 0;
    },
    
    async getCountByType(): Promise<{type: string, count: number}[]> {
      // Using a raw SQL query to get counts by type
      const { data, error } = await supabase
        .rpc('get_generation_counts_by_type');
      
      if (error) {
        console.error('Error getting generation counts by type:', error);
        // Fallback if the RPC function doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('generations')
          .select('generation_type');
        
        if (fallbackError) throw fallbackError;
        
        // Manually count by type
        const counts: {[key: string]: number} = {};
        fallbackData?.forEach(item => {
          counts[item.generation_type] = (counts[item.generation_type] || 0) + 1;
        });
        
        return Object.entries(counts).map(([type, count]) => ({ type, count }));
      }
      
      return data || [];
    },
    
    async getCountByTypeWithDateFilter(
      filter: DateFilter, 
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<{type: string, count: number}[]> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { data, error } = await supabase
        .from('generations')
        .select('generation_type')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Manually count by type
      const counts: {[key: string]: number} = {};
      data?.forEach(item => {
        const type = item.generation_type || 'unknown';
        counts[type] = (counts[type] || 0) + 1;
      });
      
      return Object.entries(counts).map(([type, count]) => ({ type, count }));
    },
    
    async getCountBySpecificTypes(): Promise<{type: string, count: number, label: string}[]> {
      const countsByType = await this.getCountByType();
      
      // Map the technical type names to user-friendly labels
      const typeLabels: {[key: string]: string} = {
        [GenerationType.TEXT_TO_THUMBNAIL]: 'Text to Thumbnail',
        [GenerationType.IMAGE_TO_THUMBNAIL]: 'Image to Thumbnail',
        [GenerationType.YOUTUBE_TO_THUMBNAIL]: 'YouTube to Thumbnail'
      };
      
      // Format the data with labels
      return countsByType.map(item => ({
        type: item.type,
        count: item.count,
        label: typeLabels[item.type] || item.type
      }));
    },
    
    async getCountBySpecificTypesWithDateFilter(
      filter: DateFilter, 
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<{type: string, count: number, label: string}[]> {
      const countsByType = await this.getCountByTypeWithDateFilter(filter, customStartDate, customEndDate);
      
      // Map the technical type names to user-friendly labels
      const typeLabels: {[key: string]: string} = {
        [GenerationType.TEXT_TO_THUMBNAIL]: 'Text to Thumbnail',
        [GenerationType.IMAGE_TO_THUMBNAIL]: 'Image to Thumbnail',
        [GenerationType.YOUTUBE_TO_THUMBNAIL]: 'YouTube to Thumbnail'
      };
      
      // Format the data with labels
      return countsByType.map(item => ({
        type: item.type,
        count: item.count,
        label: typeLabels[item.type] || item.type
      }));
    },
    
    async getRecentGenerations(limit: number = 10): Promise<Generation[]> {
      const { data, error } = await supabase
        .from('generations')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    },
    
    async getTodayCount(): Promise<number> {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());
      
      if (error) throw error;
      return count || 0;
    }
  },
  
  // Analytics functions
  analytics: {
    async getUserGrowth(timeframe: 'day' | 'week' | 'month' = 'day', limit: number = 30): Promise<{date: string, count: number}[]> {
      // This is a simplified version - in a real app, you might use a more sophisticated query
      // or a dedicated analytics service
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date
      const groupedData: {[key: string]: number} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-limit);
      
      return result;
    },
    
    async getUserGrowthWithDateFilter(
      timeframe: 'day' | 'week' | 'month' = 'day', 
      filter: DateFilter,
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<{date: string, count: number}[]> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date
      const groupedData: {[key: string]: number} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
    },
    
    async getGenerationGrowth(timeframe: 'day' | 'week' | 'month' = 'day', limit: number = 30): Promise<{date: string, count: number}[]> {
      const { data, error } = await supabase
        .from('generations')
        .select('created_at')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date
      const groupedData: {[key: string]: number} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-limit);
      
      return result;
    },
    
    async getGenerationGrowthWithDateFilter(
      timeframe: 'day' | 'week' | 'month' = 'day', 
      filter: DateFilter,
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<{date: string, count: number}[]> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { data, error } = await supabase
        .from('generations')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date
      const groupedData: {[key: string]: number} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        groupedData[key] = (groupedData[key] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
    },
    
    async getGenerationByTypeOverTime(timeframe: 'day' | 'week' | 'month' = 'day', limit: number = 30): Promise<{date: string, [key: string]: number | string}[]> {
      const { data, error } = await supabase
        .from('generations')
        .select('created_at, generation_type')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date and type
      const groupedData: {[key: string]: {[type: string]: number}} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {};
        }
        
        const type = item.generation_type || 'unknown';
        groupedData[key][type] = (groupedData[key][type] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, types]) => {
          return {
            date,
            ...types,
            [GenerationType.TEXT_TO_THUMBNAIL]: types[GenerationType.TEXT_TO_THUMBNAIL] || 0,
            [GenerationType.IMAGE_TO_THUMBNAIL]: types[GenerationType.IMAGE_TO_THUMBNAIL] || 0,
            [GenerationType.YOUTUBE_TO_THUMBNAIL]: types[GenerationType.YOUTUBE_TO_THUMBNAIL] || 0
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-limit);
      
      return result;
    },
    
    async getGenerationByTypeOverTimeWithDateFilter(
      timeframe: 'day' | 'week' | 'month' = 'day', 
      filter: DateFilter,
      customStartDate?: string, 
      customEndDate?: string
    ): Promise<{date: string, [key: string]: number | string}[]> {
      const { startDate, endDate } = getDateRange(filter, customStartDate, customEndDate);
      
      const { data, error } = await supabase
        .from('generations')
        .select('created_at, generation_type')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by date and type
      const groupedData: {[key: string]: {[type: string]: number}} = {};
      data?.forEach(item => {
        const date = new Date(item.created_at);
        let key: string;
        
        if (timeframe === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (timeframe === 'week') {
          // Get the week number
          const weekNumber = Math.ceil((date.getDate() + 
            new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {};
        }
        
        const type = item.generation_type || 'unknown';
        groupedData[key][type] = (groupedData[key][type] || 0) + 1;
      });
      
      // Convert to array and sort
      const result = Object.entries(groupedData)
        .map(([date, types]) => {
          return {
            date,
            ...types,
            [GenerationType.TEXT_TO_THUMBNAIL]: types[GenerationType.TEXT_TO_THUMBNAIL] || 0,
            [GenerationType.IMAGE_TO_THUMBNAIL]: types[GenerationType.IMAGE_TO_THUMBNAIL] || 0,
            [GenerationType.YOUTUBE_TO_THUMBNAIL]: types[GenerationType.YOUTUBE_TO_THUMBNAIL] || 0
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
    }
  }
};

export default api; 