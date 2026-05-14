'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ArrowLeft, Loader2, User, Mail, MapPin, Trophy, Camera, Save, Activity, Globe, Play, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

export default function ProfileEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
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

      // Fetch user's clips
      const { data: clipsData } = await supabase
        .from('clips')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false });

      if (clipsData) setClips(clipsData);

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

  const handleDeleteClip = async (clipId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('clips')
        .delete()
        .eq('id', clipId)
        .eq('player_id', user.id); // Ensure user can only delete their own clips

      if (error) throw error;

      setClips(clips.filter(clip => clip.id !== clipId));
      setMessage({ type: 'success', text: 'Video deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete video' });
      setTimeout(() => setMessage(null), 3000);
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

        {/* Videos Section */}
        {role === 'PLAYER' && (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm mb-10 transition-colors">
            <div className="p-12">
              <div className="flex items-center justify-between mb-8 gap-3">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <Play size={24} className="text-blue-600" /> My Videos
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{clips.length} video{clips.length === 1 ? '' : 's'}</span>
              </div>

              {clips.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  {clips.map((clip) => (
                    <div key={clip.id} className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-colors bg-gray-50 dark:bg-gray-950">
                      <div className="aspect-video bg-black relative">
                        <video
                          src={clip.video_url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{clip.title || 'Highlight Reel'}</p>
                          <button
                            onClick={() => handleDeleteClip(clip.id)}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                            title="Delete video"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{clip.description || 'Player highlight clip'}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                          <span>{new Date(clip.created_at).toLocaleDateString()}</span>
                          <span>{clip.tags?.length ? `${clip.tags.length} tag${clip.tags.length === 1 ? '' : 's'}` : 'No tags'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No videos uploaded yet.</p>
                  <Link href="/upload" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Upload your first highlight video
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
