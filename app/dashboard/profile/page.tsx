'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ArrowLeft, Loader2, User, Mail, MapPin, Trophy, Camera, Save, Activity, Globe } from 'lucide-react';
import Link from 'next/link';

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
    location: '',
    position: '',
    dateOfBirth: '',
    height: '',
    weight: '',
    preferredFoot: 'Right',
    organization: '',
    licenseNumber: '',
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
          location: meta.location || '',
          position: meta.position || '',
          dateOfBirth: meta.date_of_birth || '',
          height: meta.height || '',
          weight: meta.weight || '',
          preferredFoot: meta.preferred_foot || 'Right',
          organization: meta.organization || '',
          licenseNumber: meta.license_number || '',
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
            location: formData.location,
            position: formData.position,
            date_of_birth: formData.dateOfBirth,
            height: formData.height,
            weight: formData.weight,
            preferred_foot: formData.preferredFoot,
            organization: formData.organization,
            license_number: formData.licenseNumber,
          }
        })
        .eq('id', user.id);

      if (error) throw error;
      
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
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to dashboard
        </Link>

        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm mb-10">
          <div className="h-32 bg-blue-600 relative">
            <div className="absolute -bottom-12 left-12">
              <div className="relative group">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                  {formData.displayName.charAt(0)}
                </div>
                <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                  <Camera size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-10 px-12">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Edit Profile</h1>
            <p className="text-gray-500">Update your personal and professional information</p>
          </div>

          <form onSubmit={handleSubmit} className="px-12 pb-12 space-y-10">
            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Basic Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                <User size={16} /> Basic Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Email (Read-only)</label>
                  <div className="w-full px-5 py-4 bg-gray-100 text-gray-400 rounded-2xl cursor-not-allowed">
                    {formData.email}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell the world about yourself..."
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </section>

            {/* Role Specific Section */}
            <section className="space-y-6 pt-10 border-t border-gray-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                {role === 'PLAYER' ? <Trophy size={16} /> : <Globe size={16} />} 
                {role === 'PLAYER' ? 'Player Profile' : 'Professional Details'}
              </div>

              {role === 'PLAYER' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Position</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Foot</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.preferredFoot}
                      onChange={(e) => setFormData({...formData, preferredFoot: e.target.value})}
                    >
                      <option value="Right">Right</option>
                      <option value="Left">Left</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Organization / Club Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Watanga FC"
                      className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.organization}
                      onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. FIFA-LFA-12345"
                      className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="e.g. Monrovia"
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                {role === 'PLAYER' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Height (m)</label>
                      <input
                        type="text"
                        placeholder="e.g. 1.85"
                        className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                      <input
                        type="text"
                        placeholder="e.g. 78"
                        className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-extrabold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-70"
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
