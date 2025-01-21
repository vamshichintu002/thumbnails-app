import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Generation } from '../types/database.types';

export function GenerationHistory() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading history...</div>;
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No generations yet. Start creating thumbnails!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Recent Generations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generations.map((generation) => (
          <div key={generation.id} className="bg-white shadow rounded-lg overflow-hidden">
            <img
              src={generation.output_image_url}
              alt="Generated thumbnail"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(generation.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm font-medium text-indigo-600">
                  {generation.credit_cost} credits
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Type: {generation.generation_type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
