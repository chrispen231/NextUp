'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ArrowLeft, Loader2, Calendar, MapPin, Trophy, Info, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function PostTrialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    trial_date: '',
    trial_time: '',
    trial_type: 'Professional',
    contact_info: '',
  });

  const [requirement, setRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Verify role is CLUB
      if (user.user_metadata.role !== 'CLUB') {
        setError('Only Club accounts can post trials.');
      }
      
      setUser(user);
      setFetchingUser(false);
    };

    checkUser();
  }, [router]);

  const addRequirement = () => {
    if (requirement.trim()) {
      setRequirements([...requirements, requirement.trim()]);
      setRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('trials')
        .insert([
          {
            club_id: user.id,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            trial_date: formData.trial_date,
            trial_time: formData.trial_time,
            trial_type: formData.trial_type,
            contact_info: formData.contact_info,
            requirements: requirements,
            status: 'OPEN'
          }
        ]);

      if (error) throw error;

      router.push('/dashboard?success=trial_posted');
    } catch (err: any) {
      setError(err.message || 'Failed to post trial');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Post a New Trial</h1>
            <p className="text-gray-500 text-lg">Find the best talent for your club.</p>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                <Info size={16} /> Basic Information
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Trial Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. LFA First Division Open Tryouts"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what your club is looking for..."
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
              <div className="md:col-span-2 flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                <Calendar size={16} /> Logistics
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.trial_date}
                  onChange={(e) => setFormData({...formData, trial_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 8:00 AM"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.trial_time}
                  onChange={(e) => setFormData({...formData, trial_time: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="e.g. SKD Stadium, Monrovia"
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Trial Type</label>
                <select
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.trial_type}
                  onChange={(e) => setFormData({...formData, trial_type: e.target.value})}
                >
                  <option value="Professional">Professional</option>
                  <option value="Youth">Youth</option>
                  <option value="Elite">Elite</option>
                  <option value="Amateur">Amateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email/Phone</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. trials@club.com"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                />
              </div>
            </section>

            <section className="space-y-6 pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                <Trophy size={16} /> Requirements
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Age 18-21"
                  className="flex-1 px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {requirements.map((req, i) => (
                  <span key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
                    {req}
                    <button type="button" onClick={() => removeRequirement(i)} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {requirements.length === 0 && <p className="text-gray-400 text-sm italic">No requirements added yet.</p>}
              </div>
            </section>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-extrabold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Publish Trial'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
