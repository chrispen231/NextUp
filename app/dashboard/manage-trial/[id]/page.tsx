'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ArrowLeft, Loader2, User, CheckCircle, XCircle, Mail, MapPin, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ManageTrialPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [trial, setTrial] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Fetch Trial Details
      const { data: trialData } = await supabase
        .from('trials')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (trialData) {
        // Ensure user owns this trial
        if (trialData.club_id !== user.id) {
          router.push('/dashboard');
          return;
        }
        setTrial(trialData);

        // 2. Fetch Applicants with Player Profiles
        const { data: appData } = await supabase
          .from('trial_applications')
          .select('*, player:player_id(*)')
          .eq('trial_id', resolvedParams.id)
          .order('created_at', { ascending: false });
        
        if (appData) setApplicants(appData);
      }
      setLoading(false);
    };

    fetchData();
  }, [resolvedParams.id, router]);

  const updateStatus = async (applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setUpdating(applicationId);
    try {
      const { error } = await supabase
        .from('trial_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplicants(applicants.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Trial Management
              </span>
              <span className="text-gray-400 text-sm">• {trial.trial_type}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900">{trial.title}</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Calendar size={16} /> {new Date(trial.trial_date).toLocaleDateString()} at {trial.location}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center min-w-[160px]">
            <p className="text-4xl font-black text-blue-600">{applicants.length}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Applicants</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Applicant List
            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">
              {applicants.filter(a => a.status === 'PENDING').length} Pending
            </span>
          </h2>

          {applicants.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {applicants.map((app) => (
                <div key={app.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-2xl font-bold border border-gray-50">
                      {app.player.display_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{app.player.display_name}</h3>
                        {app.player.status === 'VERIFIED' && <ShieldCheck size={18} className="text-blue-500" />}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="text-blue-600 font-bold">{app.player.metadata?.position || 'Player'}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {app.player.metadata?.location || 'Liberia'}</span>
                        <span className="flex items-center gap-1"><User size={14} /> {app.player.metadata?.date_of_birth ? (new Date().getFullYear() - new Date(app.player.metadata.date_of_birth).getFullYear()) : '??'} yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {app.status === 'PENDING' ? (
                      <>
                        <button 
                          disabled={updating === app.id}
                          onClick={() => updateStatus(app.id, 'ACCEPTED')}
                          className="flex-1 md:flex-none bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
                        >
                          {updating === app.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                          Accept
                        </button>
                        <button 
                          disabled={updating === app.id}
                          onClick={() => updateStatus(app.id, 'REJECTED')}
                          className="flex-1 md:flex-none bg-white text-red-500 border border-red-100 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    ) : (
                      <div className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 ${
                        app.status === 'ACCEPTED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {app.status === 'ACCEPTED' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        Application {app.status.toLowerCase()}
                      </div>
                    )}
                    <Link 
                      href={`/players/${app.player.id}`}
                      className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <ExternalLink size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">No applicants yet</h3>
              <p className="text-gray-400">Your trial is live! Applications will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
