'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Trophy, Users, Shield } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function LFA_CenterPage() {
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: actor } = await supabase.from('actors').select('role').eq('id', user.id).single();
        setRole(actor?.role || 'PLAYER');
      }

      const { data: leaguesData } = await supabase.from('leagues').select('*');
      if (leaguesData) {
        setLeagues(leaguesData);
        if (leaguesData.length > 0) handleSelectLeague(leaguesData[0]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSelectLeague = async (league: any) => {
    setSelectedLeague(league);
    const { data: sData } = await supabase.from('standings').select('*').eq('league_id', league.id).order('points', { ascending: false });
    const { data: scData } = await supabase.from('top_scorers').select('*').eq('league_id', league.id).order('goals', { ascending: false });
    if (sData) setStandings(sData);
    if (scData) setScorers(scData);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {user && <Sidebar role={role} userId={user.id} />}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">LFA Statistics Center</h1>
          
          <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
            {leagues.map(l => (
              <button 
                key={l.id} 
                onClick={() => handleSelectLeague(l)}
                className={`flex items-center gap-3 px-5 py-3 sm:px-6 sm:py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedLeague?.id === l.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {l.logo_url && <img src={l.logo_url} alt={l.name} className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full" />}
                {l.name} ({l.gender})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Standings */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Shield size={20} /> League Standings</h2>
              <div className="space-y-2 sm:space-y-3">
                {standings.map((team, i) => (
                  <div key={team.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base">{i + 1}. {team.team_name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm md:text-base">{team.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Trophy size={20} /> Top Scorers</h2>
              <div className="space-y-2 sm:space-y-3">
                {scorers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm md:text-base truncate">{player.player_name}</span>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{player.team_name}</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base whitespace-nowrap">{player.goals} goals</span>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
