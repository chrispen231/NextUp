'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Trophy, ShieldCheck, ArrowLeft, Share2, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [trial, setTrial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch trial data from Supabase
      const { data, error } = await supabase
        .from('trials')
        .select('*, club:club_id(display_name)')
        .eq('id', resolvedParams.id)
        .single();

      if (data) {
        setTrial(data);
        
        // Check if user already applied
        if (user && user.user_metadata.role === 'PLAYER') {
          const { data: appData } = await supabase
            .from('trial_applications')
            .select('id')
            .eq('trial_id', resolvedParams.id)
            .eq('player_id', user.id)
            .single();
          
          if (appData) setApplied(true);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.user_metadata.role !== 'PLAYER') {
      alert('Only players can apply for trials.');
      return;
    }

    setApplying(true);
    try {
      const { error } = await supabase
        .from('trial_applications')
        .insert([{
          trial_id: trial.id,
          player_id: user.id,
          status: 'PENDING'
        }]);

      if (error) throw error;
      setApplied(true);
    } catch (err: any) {
      alert(err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!trial) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Trial not found</h2>
      <Link href="/trials" className="text-blue-600 font-bold hover:underline">Back to all trials</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/trials" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to all trials
        </Link>

        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
          <div className="bg-blue-600 p-10 md:p-14 text-white">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                {trial.trial_type}
              </span>
              <span className="flex items-center gap-1 text-blue-100 text-sm">
                <Clock size={16} /> {trial.trial_time}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{trial.title}</h1>
            <div className="flex items-center gap-2 text-xl font-medium text-blue-100">
              <Trophy size={24} className="text-white" />
              {trial.club?.display_name || 'Unknown Club'}
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</p>
                  <p className="font-bold text-gray-900">{new Date(trial.trial_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl md:col-span-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="font-bold text-gray-900">{trial.location}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {trial.description}
                  </p>
                </section>

                {trial.requirements && trial.requirements.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {trial.requirements.map((req: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-600">
                          <div className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={14} />
                          </div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Users size={20} /> {applied ? 'Applied!' : 'Ready to join?'}
                  </h3>
                  <p className="text-blue-800 text-sm mb-6 leading-relaxed">
                    {applied 
                      ? 'Your application has been sent to the club. They will review your profile shortly.'
                      : 'Apply now to secure your spot. Space is limited for this trial.'}
                  </p>
                  <button 
                    disabled={applying || applied}
                    onClick={handleApply}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg mb-3 flex items-center justify-center gap-2 ${
                      applied 
                        ? 'bg-green-500 text-white shadow-green-100 cursor-default' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                    }`}
                  >
                    {applying ? <Loader2 className="animate-spin" /> : applied ? <ShieldCheck size={20} /> : 'Apply for Trial'}
                    {applied ? 'Application Sent' : ''}
                  </button>
                  <button className="w-full bg-white text-blue-600 border border-blue-200 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <Share2 size={18} /> Share
                  </button>
                </div>
                
                <div className="p-6 text-center">
                  <p className="text-xs text-gray-400 font-medium">Organized by {trial.club?.display_name}</p>
                  <p className="text-xs text-blue-600 font-bold mt-1 cursor-pointer hover:underline">View Club Profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
