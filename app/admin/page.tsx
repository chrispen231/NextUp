'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { 
  Loader2, ShieldAlert, CheckCircle, User, Trophy, Shield, 
  Activity, Plus, Trash2, Save, X, ChevronRight, LayoutDashboard,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

type AdminTab = 'USERS' | 'LEAGUES' | 'CLUBS';

export default function AdminAuditPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('USERS');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  
  // Clubs State
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [showAddSquadPlayer, setShowAddSquadPlayer] = useState(false);
  const [newSquadPlayer, setNewSquadPlayer] = useState({ player_name: '', position: '', jersey_number: '' });

  // Leagues State
  const [leagues, setLeagues] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [scorers, setScorers] = useState<any[]>([]);
  const [showAddLeague, setShowAddLeague] = useState(false);
  const [newLeague, setNewLeague] = useState({ name: '', gender: 'MALE' });

  const fetchClubs = async () => {
    const { data } = await supabase.from('actors').select('*').eq('role', 'CLUB').order('display_name');
    if (data) setClubs(data);
  };

  const fetchClubSquad = async (clubId: string) => {
    const { data } = await supabase
      .from('club_squad')
      .select('*')
      .eq('club_id', clubId)
      .order('jersey_number', { ascending: true });
    if (data) setSquad(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: actor } = await supabase.from('actors').select('role').eq('id', authUser.id).single();
        if (actor?.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
      } else {
        router.push('/login');
        return;
      }

      fetchUsers();
      fetchLeagues();
      fetchClubs();
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddSquadPlayer = async () => {
    if (!newSquadPlayer.player_name || !selectedClub) return;
    const { error } = await supabase
      .from('club_squad')
      .insert([{
        club_id: selectedClub.id,
        player_name: newSquadPlayer.player_name,
        position: newSquadPlayer.position,
        jersey_number: parseInt(newSquadPlayer.jersey_number) || null
      }]);
    if (!error) {
      fetchClubSquad(selectedClub.id);
      setShowAddSquadPlayer(false);
      setNewSquadPlayer({ player_name: '', position: '', jersey_number: '' });
    }
  };

  const deleteSquadPlayer = async (id: string) => {
    if (!confirm('Remove player from squad?')) return;
    const { error } = await supabase.from('club_squad').delete().eq('id', id);
    if (!error) fetchClubSquad(selectedClub.id);
  };

  const updateSquadPlayer = async (id: string, updates: any) => {
    await supabase.from('club_squad').update(updates).eq('id', id);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('actors').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchLeagues = async () => {
    const { data } = await supabase.from('leagues').select('*').order('name');
    if (data) setLeagues(data);
  };

  const fetchLeagueDetails = async (leagueId: string) => {
    const [standingsRes, scorersRes] = await Promise.all([
      supabase.from('standings').select('*').eq('league_id', leagueId).order('points', { ascending: false }),
      supabase.from('top_scorers').select('*').eq('league_id', leagueId).order('goals', { ascending: false })
    ]);
    if (standingsRes.data) setStandings(standingsRes.data);
    if (scorersRes.data) setScorers(scorersRes.data);
  };

  const verifyUser = async (id: string) => {
    const { error } = await supabase.from('actors').update({ status: 'VERIFIED' }).eq('id', id);
    if (!error) setUsers(users.map(u => u.id === id ? { ...u, status: 'VERIFIED' } : u));
  };

  const handleCreateLeague = async () => {
    const { data, error } = await supabase.from('leagues').insert([newLeague]).select();
    if (data) {
      setLeagues([...leagues, data[0]]);
      setShowAddLeague(false);
      setNewLeague({ name: '', gender: 'MALE' });
    }
  };

  const handleDeleteLeague = async (id: string) => {
    if (!confirm('Are you sure? This will delete all standings and stats for this league.')) return;
    const { error } = await supabase.from('leagues').delete().eq('id', id);
    if (!error) {
      setLeagues(leagues.filter(l => l.id !== id));
      if (selectedLeague?.id === id) setSelectedLeague(null);
    }
  };

  const updateStanding = async (id: string, updates: any) => {
    const { error } = await supabase.from('standings').update(updates).eq('id', id);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  const addStanding = async () => {
    const { error } = await supabase.from('standings').insert([{ 
      league_id: selectedLeague.id, 
      team_name: 'New Team',
      played: 0, won: 0, drawn: 0, lost: 0, points: 0, goal_difference: 0
    }]);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  const deleteStanding = async (id: string) => {
    const { error } = await supabase.from('standings').delete().eq('id', id);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  const updateScorer = async (id: string, updates: any) => {
    const { error } = await supabase.from('top_scorers').update(updates).eq('id', id);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  const addScorer = async () => {
    const { error } = await supabase.from('top_scorers').insert([{ 
      league_id: selectedLeague.id, 
      player_name: 'New Player',
      team_name: 'Team',
      goals: 0
    }]);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  const deleteScorer = async (id: string) => {
    const { error } = await supabase.from('top_scorers').delete().eq('id', id);
    if (!error) fetchLeagueDetails(selectedLeague.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar role="ADMIN" userId={user.id} />
      
      <main className="flex-1 p-4 sm:p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <ShieldAlert className="text-red-500" /> Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage platform users and league statistics.</p>
          </div>

          <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'USERS' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400'
              }`}
            >
              <Users size={18} /> Users
            </button>
            <button
              onClick={() => setActiveTab('LEAGUES')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'LEAGUES' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400'
              }`}
            >
              <LayoutDashboard size={18} /> Leagues
            </button>
            <button
              onClick={() => setActiveTab('CLUBS')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'CLUBS' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400'
              }`}
            >
              <Shield size={18} /> Clubs
            </button>
          </div>
        </header>

        {activeTab === 'USERS' && (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <Users className="text-blue-600" /> Verification Management
            </h3>
            <div className="grid gap-4">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:ring-2 ring-blue-500/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {u.display_name?.charAt(0) || <User size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{u.display_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">{u.role} • {u.status}</p>
                    </div>
                  </div>
                  {u.status !== 'VERIFIED' ? (
                    <button 
                      onClick={() => verifyUser(u.id)}
                      className="bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 shadow-lg shadow-green-500/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <CheckCircle size={16} /> Verify
                    </button>
                  ) : (
                    <span className="text-green-500 font-bold text-sm flex items-center gap-2 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl">
                      <CheckCircle size={16} /> Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CLUBS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Club List */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8">Clubs</h3>
                <div className="space-y-2">
                  {clubs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClub(c);
                        fetchClubSquad(c.id);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                        selectedClub?.id === c.id 
                          ? 'bg-blue-600 text-white shadow-xl' 
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                          {c.display_name?.charAt(0)}
                        </div>
                        <span className="truncate">{c.display_name}</span>
                      </div>
                      <ChevronRight size={16} className={selectedClub?.id === c.id ? 'opacity-100' : 'opacity-30'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Squad Management */}
              <div className="lg:col-span-2 space-y-8">
                {selectedClub ? (
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" /> {selectedClub.display_name} Squad
                      </h3>
                      <button 
                        onClick={() => setShowAddSquadPlayer(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                      >
                        <Plus size={16} /> Add Player
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                            <th className="py-3 px-2">#</th>
                            <th className="py-3 px-2">Player Name</th>
                            <th className="py-3 px-2">Position</th>
                            <th className="py-3 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {squad.map((p) => (
                            <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 group">
                                <td className="py-3 px-2">
                                  <input 
                                    type="number"
                                    className="w-12 bg-transparent font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                                    defaultValue={p.jersey_number}
                                    onBlur={(e) => updateSquadPlayer(p.id, { jersey_number: parseInt(e.target.value) || null })}
                                  />
                                </td>
                                <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                                  <input 
                                    className="bg-transparent font-bold w-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                                    defaultValue={p.player_name}
                                    onBlur={(e) => updateSquadPlayer(p.id, { player_name: e.target.value })}
                                  />
                                </td>
                                <td className="py-3 px-2">
                                  <select 
                                    className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                                    defaultValue={p.position}
                                    onChange={(e) => updateSquadPlayer(p.id, { position: e.target.value })}
                                  >
                                  <option value="">Select...</option>
                                  <option value="GK">Goalkeeper</option>
                                  <option value="DF">Defender</option>
                                  <option value="MF">Midfielder</option>
                                  <option value="FW">Forward</option>
                                </select>
                              </td>
                              <td className="py-3 px-2 text-right">
                                <button 
                                  onClick={() => deleteSquadPlayer(p.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <Shield size={48} className="text-gray-200 dark:text-gray-800 mb-4" />
                    <p className="text-gray-500 font-bold">Select a club to manage its squad</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Squad Player Modal */}
        {showAddSquadPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Add Player to Squad</h3>
                <button onClick={() => setShowAddSquadPlayer(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Player Name</label>
                  <input 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white font-bold"
                    placeholder="Enter full name"
                    value={newSquadPlayer.player_name}
                    onChange={(e) => setNewSquadPlayer({...newSquadPlayer, player_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Position</label>
                    <select 
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white font-bold"
                      value={newSquadPlayer.position}
                      onChange={(e) => setNewSquadPlayer({...newSquadPlayer, position: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="GK">GK</option>
                      <option value="DF">DF</option>
                      <option value="MF">MF</option>
                      <option value="FW">FW</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Number</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white font-bold text-center"
                      placeholder="10"
                      value={newSquadPlayer.jersey_number}
                      onChange={(e) => setNewSquadPlayer({...newSquadPlayer, jersey_number: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddSquadPlayer}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                  Add to Squad
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LEAGUES' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* League List */}
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">Leagues</h3>
                  <button 
                    onClick={() => setShowAddLeague(true)}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {leagues.map(l => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedLeague(l);
                        fetchLeagueDetails(l.id);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                        selectedLeague?.id === l.id 
                          ? 'bg-blue-600 text-white shadow-xl' 
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield size={18} />
                        <span className="truncate">{l.name}</span>
                      </div>
                      <ChevronRight size={16} className={selectedLeague?.id === l.id ? 'opacity-100' : 'opacity-30'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* League Details/Editor */}
              <div className="lg:col-span-2 space-y-8">
                {selectedLeague ? (
                  <>
                    {/* Standings Editor */}
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          <Shield className="text-blue-600" /> {selectedLeague.name} Standings
                        </h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDeleteLeague(selectedLeague.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={addStanding}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                          >
                            <Plus size={16} /> Add Team
                          </button>
                        </div>
                      </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                            <th className="py-3">Team Name</th>
                            <th className="py-3 px-2 text-center">PL</th>
                            <th className="py-3 px-2 text-center">W</th>
                            <th className="py-3 px-2 text-center">D</th>
                            <th className="py-3 px-2 text-center">L</th>
                            <th className="py-3 px-2 text-center">GD</th>
                            <th className="py-3 px-2 text-center text-blue-600">PTS</th>
                            <th className="py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team) => (
                            <tr key={team.id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3">
                                <input 
                                  className="bg-transparent font-bold w-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-2"
                                  defaultValue={team.team_name}
                                  onBlur={(e) => updateStanding(team.id, { team_name: e.target.value })}
                                />
                              </td>
                              {['played', 'won', 'drawn', 'lost', 'goal_difference', 'points'].map((field) => (
                                <td key={field} className="py-3 px-2 text-center">
                                  <input 
                                    type="number"
                                    className={`bg-transparent text-center w-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-blue-500/20 rounded font-medium ${field === 'points' ? 'text-blue-600 font-black' : ''}`}
                                    defaultValue={team[field]}
                                    onBlur={(e) => updateStanding(team.id, { [field]: parseInt(e.target.value) || 0 })}
                                  />
                                </td>
                              ))}
                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => deleteStanding(team.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Scorers Editor */}
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Top Scorers
                      </h3>
                      <button 
                        onClick={addScorer}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20"
                      >
                        <Plus size={16} /> Add Scorer
                      </button>
                    </div>

                    <div className="space-y-4">
                      {scorers.map((p) => (
                        <div key={p.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                          <input 
                            className="bg-transparent font-bold flex-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-2"
                            defaultValue={p.player_name}
                            placeholder="Player Name"
                            onBlur={(e) => updateScorer(p.id, { player_name: e.target.value })}
                          />
                          <input 
                            className="bg-transparent text-gray-600 dark:text-gray-400 w-32 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-2"
                            defaultValue={p.team_name}
                            placeholder="Team Name"
                            onBlur={(e) => updateScorer(p.id, { team_name: e.target.value })}
                          />
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-green-500" />
                            <input 
                              type="number"
                              className="bg-transparent font-black text-green-600 w-16 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-2"
                              defaultValue={p.goals}
                              onBlur={(e) => updateScorer(p.id, { goals: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <button 
                            onClick={() => deleteScorer(p.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  </>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <LayoutDashboard size={48} className="text-gray-200 dark:text-gray-800 mb-4" />
                    <p className="text-gray-500 font-bold">Select a league to manage its stats</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add League Modal */}
        {showAddLeague && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Create New League</h3>
                <button onClick={() => setShowAddLeague(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">League Name</label>
                  <input 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white font-bold"
                    placeholder="e.g. 1st Division"
                    value={newLeague.name}
                    onChange={(e) => setNewLeague({...newLeague, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Gender Category</label>
                  <select 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white font-bold"
                    value={newLeague.gender}
                    onChange={(e) => setNewLeague({...newLeague, gender: e.target.value})}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreateLeague}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all"
                >
                  Create League
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
