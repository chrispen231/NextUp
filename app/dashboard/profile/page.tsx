'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ArrowLeft, Loader2, User, Mail, MapPin, Trophy, Camera, Save, Activity, Globe } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function ProfileEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    country: '',
    countyState: '',
    position: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    preferredFoot: 'Right',
    organization: '',
    licenseNumber: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: actorData } = await supabase
        .from('actors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (actorData) {
        setProfile(actorData);
        const meta = actorData.metadata || {};
        setFormData({
          displayName: actorData.display_name || '',
          email: actorData.email || '',
          bio: meta.bio || '',
          country: meta.country || '',
          countyState: meta.countyState || '',
          position: meta.position || '',
          dateOfBirth: meta.date_of_birth || '',
          height: meta.height || '',
          weight: meta.weight || '',
          preferredFoot: meta.preferred_foot || 'Right',
          organization: meta.organization || '',
          licenseNumber: meta.license_number || '',
          avatarUrl: meta.avatar_url || '',
        });
      }
      setFetching(false);
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('actors')
        .update({
          display_name: formData.displayName,
          metadata: {
            ...profile.metadata,
            bio: formData.bio,
            country: formData.country,
            countyState: formData.countyState,
            position: formData.position,
            date_of_birth: formData.dateOfBirth,
            height: formData.height,
            weight: formData.weight,
            preferred_foot: formData.preferredFoot,
            organization: formData.organization,
            license_number: formData.licenseNumber,
            avatar_url: formData.avatarUrl,
          }
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Sync with Supabase Auth Metadata for immediate consistency across pages
      await supabase.auth.updateUser({
        data: { 
          display_name: formData.displayName,
          avatar_url: formData.avatarUrl 
        }
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const role = profile?.role;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to dashboard
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm mb-10 transition-colors">
          <div className="h-32 bg-blue-600 relative">
            <div className="absolute -bottom-12 left-12">
              <ImageUpload 
                userId={user.id} 
                currentUrl={formData.avatarUrl} 
                onUpload={(url) => setFormData({ ...formData, avatarUrl: url })} 
              />
            </div>
          </div>
          
          <div className="pt-16 pb-10 px-12">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">Edit Profile</h1>
            <p className="text-gray-500 dark:text-gray-400">Update your personal and professional information</p>
          </div>

          <form onSubmit={handleSubmit} className="px-12 pb-12 space-y-10">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${
                message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Basic Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">
                <User size={16} /> Basic Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 mb-2">Email (Read-only)</label>
                  <div className="w-full px-5 py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl cursor-not-allowed">
                    {formData.email}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell the world about yourself..."
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none dark:text-white"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </section>

            {/* Role Specific Section */}
            <section className="space-y-6 pt-10 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">
                {role === 'PLAYER' ? <Trophy size={16} /> : <Globe size={16} />} 
                {role === 'PLAYER' ? 'Player Profile' : 'Professional Details'}
              </div>

              {role === 'PLAYER' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Position</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="GK">Goalkeeper</option>
                      <option value="DF">Defender</option>
                      <option value="MF">Midfielder</option>
                      <option value="FW">Forward</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Preferred Foot</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={formData.preferredFoot}
                      onChange={(e) => setFormData({...formData, preferredFoot: e.target.value})}
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Organization / Club Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Watanga FC"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. FIFA-LFA-12345"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. Liberian"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">County / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Montserrado"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={formData.countyState}
                    onChange={(e) => setFormData({...formData, countyState: e.target.value})}
                  />
                </div>
                {role === 'PLAYER' && (
                  <div className="grid grid-cols-2 gap-4 col-span-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Height (m)</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.85"
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
                      <input
                        type="text"
                        placeholder="e.g. 78"
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-extrabold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
