'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Search, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TrialsPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrials = async () => {
      const { data, error } = await supabase
        .from('trials')
        .select('*, club:club_id(display_name)')
        .eq('status', 'OPEN')
        .order('trial_date', { ascending: true });
      
      if (data) setTrials(data);
      setLoading(false);
    };

    fetchTrials();
  }, []);

  const filteredTrials = trials.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.club?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Available Trials</h1>
            <p className="text-gray-600">Find your next opportunity in Liberian football.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by club, city, or league..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filteredTrials.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredTrials.map((trial) => (
              <div key={trial.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {trial.trial_type}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(trial.trial_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{trial.title}</h3>
                  <p className="text-blue-600 font-medium mb-2">{trial.club?.display_name}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin size={14} />
                    {trial.location}
                  </p>
                </div>
                
                <Link href={`/trials/${trial.id}`} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                  View Details
                  <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
            <p className="text-gray-400 italic">No trials found matching your search.</p>
          </div>
        )}
        
        <div className="mt-12 bg-blue-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Are you hosting a trial?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">List your trial on NextUp to reach thousands of verified players across Liberia and beyond.</p>
          <Link href="/dashboard/post-trial" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all inline-block">
            Post a Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
