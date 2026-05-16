'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { 
  Calendar, MapPin, Trophy, ShieldCheck, ArrowLeft, Mail, ExternalLink, 
  Activity, Info, Loader2, Globe, Share2, Play, Heart, MessageCircle, 
  Users, Shield 
} from 'lucide-react';
import Link from 'next/link';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [player, setPlayer] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [squad, setSquad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('PLAYER');
  const [userStatus, setUserStatus] = useState<string>('UNVERIFIED');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch the profile (actor) first
      const { data: actor } = await supabase
        .from('actors')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (actor) {
        setPlayer(actor);
        
        // Fetch content based on role
        if (actor.role === 'CLUB') {
          const { data: squadData } = await supabase
            .from('club_squad')
            .select('*')
            .eq('club_id', resolvedParams.id)
            .order('jersey_number', { ascending: true });
          if (squadData) setSquad(squadData);
        } else {
          const { data: clipsData } = await supabase
            .from('clips')
            .select('*')
            .eq('player_id', resolvedParams.id)
            .order('created_at', { ascending: false });
          if (clipsData) setClips(clipsData);
        }
      }

      // Check current user status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: currentActor } = await supabase.from('actors').select('role, status').eq('id', user.id).single();
        if (currentActor) {
          setUserRole(currentActor.role);
          setUserStatus(currentActor.status);

          // Check if favorited
          if (currentActor.status === 'VERIFIED' && user.id !== resolvedParams.id) {
            const { data: favorite } = await supabase
              .from('player_favorites')
              .select('id')
              .eq('player_id', resolvedParams.id)
              .eq('user_id', user.id)
              .maybeSingle();
            setIsFavorite(!!favorite);
          }
        }
      }

      setLoading(false);
    };

    fetchProfileData();
  }, [resolvedParams.id]);

  const canMessage = () => {
    return Boolean(
      currentUser &&
      currentUser.id !== resolvedParams.id &&
      userStatus === 'VERIFIED' &&
      ['PLAYER', 'AGENT', 'SCOUT', 'CLUB'].includes(userRole)
    );
  };

  const canFavorite = () => {
    return Boolean(
      currentUser &&
      currentUser.id !== resolvedParams.id &&
      userStatus === 'VERIFIED' &&
      ['AGENT', 'SCOUT', 'CLUB'].includes(userRole)
    );
  };

  const openChat = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .contains('participant_ids', [currentUser.id, resolvedParams.id])
        .maybeSingle();

      if (existing) {
        router.push(`/dashboard/inbox/${existing.id}`);
      } else {
        const { data: created } = await supabase
          .from('conversations')
          .insert({ participant_ids: [currentUser.id, resolvedParams.id] })
          .select('id')
          .single();
        if (created) router.push(`/dashboard/inbox/${created.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser) return;
    try {
      if (isFavorite) {
        await supabase.from('player_favorites').delete().eq('player_id', resolvedParams.id).eq('user_id', currentUser.id);
        setIsFavorite(false);
      } else {
        await supabase.from('player_favorites').insert({ player_id: resolvedParams.id, user_id: currentUser.id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!player) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-6 text-center">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Profile not found</h2>
      <Link href="/feed" className="text-blue-600 font-bold hover:underline">Back to feed</Link>
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
                <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-6">
                  {player.role === 'CLUB' ? 'Football Club' : (metadata.position || 'Player')}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">{player.role === 'CLUB' ? 'League' : 'Club'}</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.organization || (player.role === 'CLUB' ? 'LFA Division' : 'Free Agent')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Location</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">{metadata.countyState || 'Liberia'}</span>
                  </div>
                  {player.role === 'PLAYER' && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 dark:text-gray-500 font-medium">Height / Weight</span>
                      <span className="text-gray-900 dark:text-gray-200 font-bold">
                        {metadata.height ? `${metadata.height}m` : '??'} / {metadata.weight ? `${metadata.weight}kg` : '??'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {canMessage() && (
                    <button
                      onClick={openChat}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} /> Message
                    </button>
                  )}
                  {canFavorite() && (
                    <button
                      onClick={toggleFavorite}
                      className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'}`}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                      {isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </button>
                  )}
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
                      <div className="w-5 h-5 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Trophy size={12} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Bio & Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Info size={24} className="text-blue-600" /> {player.role === 'CLUB' ? 'Club History' : 'Biography'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {metadata.bio || 'Information not provided yet.'}
              </p>
            </div>

            {player.role === 'CLUB' ? (
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                  <Users size={24} className="text-blue-600" /> Official Squad
                </h2>
                
                {squad.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                          <th className="py-4 px-2">#</th>
                          <th className="py-4 px-2">Player</th>
                          <th className="py-4 px-2">Position</th>
                          <th className="py-4 px-2 text-right">Profile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {squad.map((p) => (
                          <tr key={p.id} className="group">
                            <td className="py-4 px-2 font-black text-blue-600 dark:text-blue-400">{p.jersey_number || '-'}</td>
                            <td className="py-4 px-2 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {p.player_name}
                              {p.player_id && <Shield size={14} className="text-blue-500" />}
                            </td>
                            <td className="py-4 px-2 text-gray-500 dark:text-gray-400 font-medium">{p.position || 'N/A'}</td>
                            <td className="py-4 px-2 text-right">
                              {p.player_id ? (
                                <Link 
                                  href={`/players/${p.player_id}`}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                >
                                  View <ExternalLink size={12} />
                                </Link>
                              ) : (
                                <span className="text-[10px] text-gray-300 dark:text-gray-700 font-bold uppercase">External</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 font-medium">No squad members listed yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    <Activity size={24} className="text-blue-600" /> Performance Stats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.matches}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Matches</p>
                    </div>
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-3xl text-center">
                      <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-1">{stats.goals}</p>
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Goals</p>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.assists}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Assists</p>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl text-center">
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{stats.minutes}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Minutes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    <Play size={24} className="text-blue-600" /> Highlights
                  </h2>
                  {clips.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {clips.map((clip) => (
                        <div key={clip.id} className="rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                          <div className="aspect-video bg-black relative">
                            <video src={clip.video_url} className="w-full h-full object-cover" controls />
                          </div>
                          <div className="p-5">
                            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{clip.title}</p>
                            <p className="text-xs text-gray-500 mb-4">{new Date(clip.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
                      <p className="text-gray-500">No highlights uploaded yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
