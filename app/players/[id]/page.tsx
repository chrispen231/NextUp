'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Calendar, MapPin, Trophy, ShieldCheck, ArrowLeft, Mail, ExternalLink, Activity, Info, Loader2, Globe, Share2, Play } from 'lucide-react';
import Link from 'next/link';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [player, setPlayer] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      const [playerResponse, clipsResponse] = await Promise.all([
        supabase
          .from('actors')
          .select('*')
          .eq('id', resolvedParams.id)
          .single(),
        supabase
          .from('clips')
          .select('*')
          .eq('player_id', resolvedParams.id)
          .order('created_at', { ascending: false }),
      ]);

      if (playerResponse.data) setPlayer(playerResponse.data);
      if (clipsResponse.data) setClips(clipsResponse.data);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors">
      {/* Hero Header */}
      <div className="bg-blue-600 h-64 md:h-80 w-full relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-6xl mx-auto px-6 pt-12">
          <button onClick={() => router.back()} className="flex items-center text-sm text-blue-100 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 md:-mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700 text-8xl font-bold">
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
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{player.display_name}</h1>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-6">{metadata.position || 'Player'}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Club</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.organization || 'Free Agent'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Nationality</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.country || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">County/State</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.countyState || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Height / Weight</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">
                      {metadata.height ? `${metadata.height}m` : '??'} / {metadata.weight ? `${metadata.weight}kg` : '??'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Preferred Foot</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.preferred_foot || 'N/A'}</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none mb-4 flex items-center justify-center gap-2">
                  <Mail size={18} /> Contact Player
                </button>
                
                <div className="flex justify-center gap-4">
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Globe size={20} />
                  </button>
                  <button className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl hover:text-blue-400 transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-blue-600" /> Achievements
                </h3>
                <ul className="space-y-4">
                  {achievements.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-5 h-5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Info size={24} className="text-blue-600" /> Biography
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {metadata.bio || 'This player has not provided a biography yet.'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <Activity size={24} className="text-blue-600" /> Performance Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center transition-colors">
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.matches}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Matches</p>
                </div>
                <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-3xl text-center transition-colors">
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">{stats.goals}</p>
                  <p className="text-xs text-blue-400 dark:text-blue-500 font-bold uppercase tracking-widest">Goals</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center transition-colors">
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.assists}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Assists</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center transition-colors">
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.minutes}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-8 gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Play size={24} className="text-blue-600" /> Highlights
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{clips.length} clip{clips.length === 1 ? '' : 's'}</span>
              </div>

              {clips.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  {clips.map((clip) => (
                    <div key={clip.id} className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-colors bg-gray-50 dark:bg-gray-950">
                      <div className="aspect-video bg-black relative">
                        <video
                          src={clip.video_url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{clip.title || 'Highlight Reel'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{clip.description || 'Player highlight clip'}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                          <span>{new Date(clip.created_at).toLocaleDateString()}</span>
                          <span>{clip.tags?.length ? `${clip.tags.length} tag${clip.tags.length === 1 ? '' : 's'}` : 'No tags'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No highlight videos have been uploaded for this player yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
