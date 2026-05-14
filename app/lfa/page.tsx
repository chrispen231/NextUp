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
      <main className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">LFA Statistics Center</h1>
          
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {leagues.map(l => (
              <button 
                key={l.id} 
                onClick={() => handleSelectLeague(l)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedLeague?.id === l.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {l.logo_url && <img src={l.logo_url} alt={l.name} className="w-6 h-6 object-contain rounded-full" />}
                {l.name} ({l.gender})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Shield size={20} /> League Standings</h2>
              <div className="space-y-3">
                {standings.map((team, i) => (
                  <div key={team.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className="font-bold text-gray-900 dark:text-white">{i + 1}. {team.team_name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{team.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Trophy size={20} /> Top Scorers</h2>
              <div className="space-y-3">
                {scorers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-white">{player.player_name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{player.team_name}</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">{player.goals} goals</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
