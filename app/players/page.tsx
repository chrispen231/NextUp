'use client';

import { Search, Filter, ShieldCheck, MapPin } from 'lucide-react';

export default function PlayersPage() {
  const players = [
    { id: 1, name: 'Mohammed Kamara', position: 'Forward', club: 'Watanga FC', age: 19, verified: true },
    { id: 2, name: 'Prince Balde', position: 'Defender', club: 'Mighty Barrolle', age: 22, verified: true },
    { id: 3, name: 'Sylvanus Nimely', position: 'Midfielder', club: 'Free Agent', age: 24, verified: false },
    { id: 4, name: 'Oscar Dorley', position: 'Midfielder', club: 'LPRC Oilers', age: 21, verified: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Talent Pool</h1>
            <p className="text-gray-600">Discover and scout the best players in Liberia.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search players..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="bg-white p-3 border border-gray-100 rounded-xl shadow-sm text-gray-600 hover:bg-gray-50 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {players.map((player) => (
            <div key={player.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold text-sm">
                    View Profile
                  </button>
                </div>
                {/* Placeholder for player image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <span className="text-4xl font-bold">{player.name.charAt(0)}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{player.name}</h3>
                  {player.verified && <ShieldCheck size={18} className="text-blue-500" />}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 font-medium">{player.position}</span>
                  <span className="text-gray-400">{player.age} yrs</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1 text-gray-500 text-xs">
                  <MapPin size={12} />
                  <span>{player.club}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
