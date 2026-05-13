'use client';

import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function TrialsPage() {
  const trials = [
    { id: 1, title: 'LFA First Division Open Tryouts', club: 'LPRC Oilers', location: 'Monrovia, Antoinette Tubman Stadium', date: 'June 15, 2026', type: 'Professional' },
    { id: 2, title: 'Youth Academy Scouting Day', club: 'Liberia Football Academy', location: 'Careysburg', date: 'July 2, 2026', type: 'Youth' },
    { id: 3, title: 'International Scout Showcase', club: 'Various European Scouts', location: 'Monrovia, SKD Stadium', date: 'August 10, 2026', type: 'Elite' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Available Trials</h1>
            <p className="text-gray-600">Find your next opportunity in Liberian football.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by club, city, or league..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {trials.map((trial) => (
            <div key={trial.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {trial.type}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    {trial.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{trial.title}</h3>
                <p className="text-blue-600 font-medium mb-2">{trial.club}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <MapPin size={14} />
                  {trial.location}
                </p>
              </div>
              
              <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                View Details
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-blue-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Are you hosting a trial?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">List your trial on NextUp to reach thousands of verified players across Liberia and beyond.</p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all">
            Post a Trial
          </button>
        </div>
      </div>
    </div>
  );
}
