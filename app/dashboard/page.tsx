'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myTrials, setMyTrials] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch latest profile data from actors table
      const { data: actorData } = await supabase
        .from('actors')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (actorData) {
        setProfile(actorData);
      }

      setLoading(false);
      
      setFetchingData(true);
      const userRole = actorData?.role || user.user_metadata.role;
      
      if (userRole === 'CLUB') {
        const { data } = await supabase
          .from('trials')
          .select('*, trial_applications(count)')
          .eq('club_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setMyTrials(data);
      } else if (userRole === 'PLAYER') {
        const { data } = await supabase
          .from('trial_applications')
          .select('*, trials(*, club:club_id(display_name))')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setMyApplications(data);
      }
      setFetchingData(false);
    };

    initDashboard();
  }, [router]);

  if (loading) return null;

  const role = profile?.role || user?.user_metadata?.role;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'User';

  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-8 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome, {displayName}!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You are currently registered as a <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{role || 'member'}</span>. 
          Complete your verification to unlock all features.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          {role === 'CLUB' && (
            <Link href="/dashboard/post-trial" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-none">
              Post a Trial
            </Link>
          )}
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none">
            Verify Identity
          </button>
          <Link href="/dashboard/profile" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Conditional Views based on Role */}
        {role === 'CLUB' ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">My Posted Trials</h3>
              <Link href="/dashboard/post-trial" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">View All</Link>
            </div>
            {fetchingData ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : myTrials.length > 0 ? (
              <div className="space-y-4">
                {myTrials.map(trial => (
                  <div key={trial.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{trial.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(trial.trial_date).toLocaleDateString()} • {trial.location}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{trial.trial_applications[0].count} Applicants</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{trial.status}</p>
                      </div>
                      <Link href={`/dashboard/manage-trial/${trial.id}`} className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                You haven't posted any trials yet.
              </div>
            )}
          </div>
        ) : role === 'PLAYER' ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">My Applications</h3>
              <Link href="/trials" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Find More</Link>
            </div>
            {fetchingData ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        app.status === 'ACCEPTED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        app.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {app.status === 'ACCEPTED' ? <CheckCircle size={20} /> :
                         app.status === 'REJECTED' ? <XCircle size={20} /> :
                         <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{app.trials.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{app.trials.club.display_name} • {new Date(app.trials.trial_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                        app.status === 'ACCEPTED' ? 'bg-green-500 text-white' :
                        app.status === 'REJECTED' ? 'bg-red-500 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                You haven't applied to any trials yet.
              </div>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recommended Trials</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              Coming soon...
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Notifications</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              No new notifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
