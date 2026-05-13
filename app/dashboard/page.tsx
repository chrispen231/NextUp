'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { User, LogOut, Settings, Bell, Calendar, Search, Loader2, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
      setLoading(false);
      
      setFetchingData(true);
      if (user.user_metadata.role === 'CLUB') {
        // Fetch trials posted by this club
        const { data } = await supabase
          .from('trials')
          .select('*, trial_applications(count)')
          .eq('club_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setMyTrials(data);
      } else if (user.user_metadata.role === 'PLAYER') {
        // Fetch applications sent by this player
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const role = user?.user_metadata?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <Link href="/" className="text-blue-600 font-bold text-2xl">NextUp</Link>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link href="/dashboard" className="bg-blue-50 text-blue-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Calendar className="mr-3 h-5 w-5" />
              Overview
            </Link>
            <Link href={`/${role === 'PLAYER' ? 'players/' + user.id : '#'}`} className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            <Link href="/trials" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Search className="mr-3 h-5 w-5" />
              Find Trials
            </Link>
            <Link href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button 
            onClick={handleSignOut}
            className="flex-shrink-0 w-full group block text-gray-600 hover:text-red-600 transition-colors"
          >
            <div className="flex items-center">
              <LogOut className="inline-block h-5 w-5 mr-3" />
              <div className="text-sm font-medium">Sign out</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <Link href="/dashboard/profile" className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform">
              {user?.user_metadata?.avatar_url || user?.metadata?.avatar_url ? (
                <img src={user?.user_metadata?.avatar_url || user?.metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.user_metadata?.display_name?.charAt(0) || user?.email?.charAt(0)
              )}
            </Link>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-4xl">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {user?.user_metadata?.display_name || 'User'}!
              </h2>
              <p className="text-gray-500">
                You are currently registered as a <span className="font-semibold text-blue-600 capitalize">{role || 'member'}</span>. 
                Complete your verification to unlock all features.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                {role === 'CLUB' && (
                  <Link href="/dashboard/post-trial" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                    Post a Trial
                  </Link>
                )}
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  Verify Identity
                </button>
                <Link href="/dashboard/profile" className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Edit Profile
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Conditional Views based on Role */}
              {role === 'CLUB' ? (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-900">My Posted Trials</h3>
                    <Link href="/dashboard/post-trial" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
                  </div>
                  {fetchingData ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                  ) : myTrials.length > 0 ? (
                    <div className="space-y-4">
                      {myTrials.map(trial => (
                        <div key={trial.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div>
                            <h4 className="font-bold text-gray-900">{trial.title}</h4>
                            <p className="text-xs text-gray-500">{new Date(trial.trial_date).toLocaleDateString()} • {trial.location}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-blue-600">{trial.trial_applications[0].count} Applicants</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{trial.status}</p>
                            </div>
                            <Link href={`/dashboard/manage-trial/${trial.id}`} className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-blue-600">
                              <ArrowRight size={18} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                      You haven't posted any trials yet.
                    </div>
                  )}
                </div>
              ) : role === 'PLAYER' ? (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-900">My Applications</h3>
                    <Link href="/trials" className="text-blue-600 text-sm font-bold hover:underline">Find More</Link>
                  </div>
                  {fetchingData ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
                  ) : myApplications.length > 0 ? (
                    <div className="space-y-4">
                      {myApplications.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              app.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                              app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {app.status === 'ACCEPTED' ? <CheckCircle size={20} /> :
                               app.status === 'REJECTED' ? <XCircle size={20} /> :
                               <Clock size={20} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{app.trials.title}</h4>
                              <p className="text-xs text-gray-500">{app.trials.club.display_name} • {new Date(app.trials.trial_date).toLocaleDateString()}</p>
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
                    <div className="text-sm text-gray-500 text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                      You haven't applied to any trials yet.
                    </div>
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Recommended Trials</h3>
                  <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                    Coming soon...
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Notifications</h3>
                  <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                    No new notifications.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
