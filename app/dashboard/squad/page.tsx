'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Users, Plus, Trash2, User, Hash, Shield, Save, Search } from 'lucide-react';

export default function SquadManagementPage() {
  const [squad, setSquad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ player_name: '', position: '', jersey_number: '' });
  const [platformPlayers, setPlatformPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchSquad(user.id);
      }
    };
    init();
  }, []);

  const fetchSquad = async (clubId: string) => {
    const { data } = await supabase
      .from('club_squad')
      .select('*')
      .eq('club_id', clubId)
      .order('jersey_number', { ascending: true });
    
    if (data) setSquad(data);
    setLoading(false);
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.player_name) return;

    const { error } = await supabase
      .from('club_squad')
      .insert([{
        club_id: user.id,
        player_name: newPlayer.player_name,
        position: newPlayer.position,
        jersey_number: parseInt(newPlayer.jersey_number) || null
      }]);

    if (!error) {
      fetchSquad(user.id);
      setShowAddPlayer(false);
      setNewPlayer({ player_name: '', position: '', jersey_number: '' });
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Remove this player from your squad?')) return;
    const { error } = await supabase.from('club_squad').delete().eq('id', id);
    if (!error) fetchSquad(user.id);
  };

  const updatePlayer = async (id: string, updates: any) => {
    await supabase.from('club_squad').update(updates).eq('id', id);
  };

  const searchPlatformPlayers = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setPlatformPlayers([]);
      return;
    }

    const { data } = await supabase
      .from('actors')
      .select('id, display_name, metadata')
      .eq('role', 'PLAYER')
      .ilike('display_name', `%${query}%`)
      .limit(5);
    
    if (data) setPlatformPlayers(data);
  };

  const linkPlatformPlayer = async (player: any) => {
    const { error } = await supabase
      .from('club_squad')
      .insert([{
        club_id: user.id,
        player_id: player.id,
        player_name: player.display_name,
        position: player.metadata?.position || '',
      }]);

    if (!error) {
      fetchSquad(user.id);
      setSearchQuery('');
      setPlatformPlayers([]);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Users className="text-blue-600" /> My Squad
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your club roster and player details.</p>
        </div>

        <button 
          onClick={() => setShowAddPlayer(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Player
        </button>
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="py-5 px-8">#</th>
                <th className="py-5 px-4">Player Name</th>
                <th className="py-5 px-4">Position</th>
                <th className="py-5 px-4">Status</th>
                <th className="py-5 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {squad.length > 0 ? squad.map((p) => (
                <tr key={p.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-8">
                    <input 
                      type="number"
                      className="w-12 bg-transparent font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                      defaultValue={p.jersey_number}
                      onBlur={(e) => updatePlayer(p.id, { jersey_number: parseInt(e.target.value) || null })}
                    />
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                    {p.player_id ? (
                      <Link href={`/players/${p.player_id}`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                        {p.player_name} <Shield size={14} className="text-blue-500" />
                      </Link>
                    ) : (
                      <input 
                        className="bg-transparent font-bold w-full focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                        defaultValue={p.player_name}
                        onBlur={(e) => updatePlayer(p.id, { player_name: e.target.value })}
                      />
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <select 
                      className="bg-transparent text-sm font-medium text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 ring-blue-500/20 rounded px-1"
                      defaultValue={p.position}
                      onChange={(e) => updatePlayer(p.id, { position: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="GK">Goalkeeper</option>
                      <option value="DF">Defender</option>
                      <option value="MF">Midfielder</option>
                      <option value="FW">Forward</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    {p.player_id ? (
                      <span className="text-[10px] font-bold bg-green-50 dark:bg-green-500/10 text-green-600 px-2 py-1 rounded-md uppercase tracking-wider">On Platform</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-1 rounded-md uppercase tracking-wider">Manual</span>
                    )}
                  </td>
                  <td className="py-4 px-8 text-right">
                    <button 
                      onClick={() => handleDeletePlayer(p.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-medium">
                    No players in your squad yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <Plus className="text-blue-600" /> Add to Squad
              </h3>
              <button onClick={() => setShowAddPlayer(false)} className="text-gray-400 hover:text-gray-600"><Plus size={24} className="rotate-45" /></button>
            </div>
            
            <div className="space-y-8">
              {/* Search Platform Players */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-500 mb-2 flex items-center gap-2">
                  <Search size={14} /> Search Platform Players
                </label>
                <input 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 dark:text-white font-bold"
                  placeholder="Find players on NextUp..."
                  value={searchQuery}
                  onChange={(e) => searchPlatformPlayers(e.target.value)}
                />
                
                {platformPlayers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-10">
                    {platformPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => linkPlatformPlayer(p)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 overflow-hidden">
                          {p.metadata?.avatar_url ? <img src={p.metadata.avatar_url} className="w-full h-full object-cover" /> : p.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.display_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.metadata?.position || 'Player'}</p>
                        </div>
                        <Plus size={16} className="ml-auto text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex items-center gap-4">
                <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Manual Entry</span>
                <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Full Name</label>
                  <input 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 dark:text-white font-bold"
                    placeholder="Enter player name"
                    value={newPlayer.player_name}
                    onChange={(e) => setNewPlayer({...newPlayer, player_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Position</label>
                  <select 
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 dark:text-white font-bold"
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DF">Defender</option>
                    <option value="MF">Midfielder</option>
                    <option value="FW">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Jersey Number</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 ring-blue-500 dark:text-white font-bold text-center"
                    placeholder="e.g. 10"
                    value={newPlayer.jersey_number}
                    onChange={(e) => setNewPlayer({...newPlayer, jersey_number: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleAddPlayer}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-extrabold text-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Add to Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
