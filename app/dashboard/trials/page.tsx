'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TrialsManagementPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrials = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('trials')
        .select('*, trial_applications(count)')
        .eq('club_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setTrials(data);
      setLoading(false);
    };
    fetchTrials();
  }, []);

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Trial Management</h1>
        <Link href="/dashboard/post-trial" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Post New Trial
        </Link>
      </div>

      <div className="space-y-4">
        {trials.length > 0 ? trials.map(trial => (
          <div key={trial.id} className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">{trial.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(trial.trial_date).toLocaleDateString()} • {trial.location}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{trial.trial_applications?.[0]?.count || 0} Applicants</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{trial.status}</p>
              </div>
              <Link href={`/dashboard/trials/${trial.id}`} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-blue-600 transition-colors">
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-gray-400">No trials found. Click 'Post New Trial' to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
