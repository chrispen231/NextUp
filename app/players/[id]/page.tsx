'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Calendar, MapPin, Trophy, ShieldCheck, ArrowLeft, Mail, ExternalLink, Activity, Info, Loader2, Globe, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
      
      if (data) setPlayer(data);
      setLoading(false);
    };

    fetchPlayer();
  }, [resolvedParams.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!player) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Player not found</h2>
      <Link href="/players" className="text-blue-600 font-bold hover:underline">Back to talent pool</Link>
    </div>
  );

  const metadata = player.metadata || {};
  const stats = metadata.stats || { matches: 0, goals: 0, assists: 0, minutes: 0 };
  const achievements = metadata.achievements || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-blue-600 h-64 md:h-80 w-full relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <Link href="/players" className="flex items-center text-sm text-blue-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to players
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 md:-mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
              <div className="aspect-square bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-8xl font-bold">
                  {metadata.avatar_url ? (
                    <img src={metadata.avatar_url} alt={player.display_name} className="w-full h-full object-cover" />
                  ) : (
                    player.display_name?.charAt(0)
                  )}
                </div>
                {player.status === 'VERIFIED' && (
                  <div className="absolute top-6 right-6 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <ShieldCheck size={24} />
                  </div>
                )}
              </div>
              <div className="p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{player.display_name}</h1>
                <p className="text-blue-600 font-bold text-lg mb-6">{metadata.position || 'Player'}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Club</span>
                    <span className="text-gray-900 font-bold">{metadata.club || 'Free Agent'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Age</span>
                    <span className="text-gray-900 font-bold">
                      {metadata.date_of_birth ? (new Date().getFullYear() - new Date(metadata.date_of_birth).getFullYear()) : '??'} yrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-medium">Location</span>
                    <span className="text-gray-900 font-bold">{metadata.location || 'Liberia'}</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mb-4 flex items-center justify-center gap-2">
                  <Mail size={18} /> Contact Player
                </button>
                
                <div className="flex justify-center gap-4">
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 transition-colors">
                    <Globe size={20} />
                  </button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-400 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-blue-600" /> Achievements
                </h3>
                <ul className="space-y-4">
                  {achievements.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Trophy size={12} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Bio & Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info size={24} className="text-blue-600" /> Biography
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {metadata.bio || 'This player has not provided a biography yet.'}
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Activity size={24} className="text-blue-600" /> Performance Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl text-center">
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.matches}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Matches</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl text-center">
                  <p className="text-3xl font-extrabold text-blue-600 mb-1">{stats.goals}</p>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Goals</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl text-center">
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.assists}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Assists</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl text-center">
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{stats.minutes}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
