'use client';

import { useState, useEffect } from 'react';
import { Shield, Trophy, Zap, Calendar, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/infrastructure/database/supabase';
import Sidebar from '@/components/Sidebar';

export default function LFA_CenterPage() {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'TABLES' | 'FIXTURES' | 'STATS'>('TABLES');
  const [leagues, setLeagues] = useState<any[]>([]);
  const [standingLeague, setStandingLeague] = useState<any>(null);
  const [statsLeague, setStatsLeague] = useState<any>(null);
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
      if (leaguesData && leaguesData.length > 0) {
        setLeagues(leaguesData);
        setStandingLeague(leaguesData[0]);
        setStatsLeague(leaguesData[0]);
        fetchStandings(leaguesData[0].id);
        fetchScorers(leaguesData[0].id);
      }
      setLoading(false);
    };
    init();
  }, []);

  const fetchStandings = async (leagueId: string) => {
    const { data } = await supabase.from('standings').select('*').eq('league_id', leagueId).order('points', { ascending: false });
    if (data) setStandings(data);
  };

  const fetchScorers = async (leagueId: string) => {
    const { data } = await supabase.from('top_scorers').select('*').eq('league_id', leagueId).order('goals', { ascending: false });
    if (data) setScorers(data);
  };

  const tabs = [
    { id: 'LIVE', name: 'Live', icon: Zap },
    { id: 'TABLES', name: 'Tables', icon: Shield },
    { id: 'FIXTURES', name: 'Fixtures', icon: Calendar },
    { id: 'STATS', name: 'Stats', icon: Activity },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar role={role} userId={user?.id || 'placeholder'} />
      
      <main className="flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">LFA Center</h1>
            
            <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.name}
                </button>
              ))}
            </div>
          </header>

          {activeTab === 'TABLES' && (
            <div className="animate-in fade-in duration-500 grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-10">
              <div className="xl:col-span-2">
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Select League</label>
                  <select 
                    className="w-full md:w-64 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold dark:text-white"
                    value={standingLeague?.id || ''}
                    onChange={(e) => {
                      const l = leagues.find(x => x.id === e.target.value);
                      setStandingLeague(l);
                      fetchStandings(l.id);
                    }}
                  >
                    {leagues.map(l => <option key={l.id} value={l.id}>{l.name} ({l.gender})</option>)}
                  </select>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Shield size={24} className="text-blue-600" /> League Standings</h2>
                  <div className="w-full max-w-full overflow-x-auto no-scrollbar pb-2">
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                          <th className="py-3 w-[150px]">Team</th>
                          <th className="py-3 text-right w-[40px]">PL</th>
                          <th className="py-3 text-right w-[40px]">W</th>
                          <th className="py-3 text-right w-[40px]">D</th>
                          <th className="py-3 text-right w-[40px]">L</th>
                          <th className="py-3 text-right w-[50px]">GD</th>
                          <th className="py-3 text-right w-[50px] text-blue-600">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-900 dark:text-gray-100">
                        {standings.map((team, i) => (
                          <tr key={team.id} className="border-b border-gray-100 dark:border-gray-800 text-sm">
                            <td className="py-4 font-bold truncate pr-4">{i+1}. {team.team_name}</td>
                            <td className="py-4 text-right">{team.played}</td>
                            <td className="py-4 text-right">{team.won}</td>
                            <td className="py-4 text-right">{team.drawn}</td>
                            <td className="py-4 text-right">{team.lost}</td>
                            <td className="py-4 text-right">{team.goal_difference}</td>
                            <td className="py-4 text-right font-black text-blue-600">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-gray-400 md:hidden mt-2 text-center uppercase tracking-widest font-bold">Swipe to view →</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STATS' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-500 mb-2">Select League</label>
                <select 
                  className="w-full md:w-64 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold dark:text-white"
                  value={statsLeague?.id || ''}
                  onChange={(e) => {
                    const l = leagues.find(x => x.id === e.target.value);
                    setStatsLeague(l);
                    fetchScorers(l.id);
                  }}
                >
                  {leagues.map(l => <option key={l.id} value={l.id}>{l.name} ({l.gender})</option>)}
                </select>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white"><Trophy size={24} className="text-green-600" /> Top Scorers</h2>
                <div className="space-y-4">
                  {scorers.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center gap-4">
                         <span className="font-mono font-black text-gray-300 dark:text-gray-600 text-xl">{i + 1}</span>
                         <p className="font-bold text-lg text-gray-900 dark:text-white">{p.player_name}</p>
                      </div>
                      <p className="font-black text-green-600 text-xl">{p.goals}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
