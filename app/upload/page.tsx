'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Upload, X, Film } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', tags: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: actor } = await supabase.from('actors').select('role').eq('id', user.id).single();
        setRole(actor?.role || 'PLAYER');
      }
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a video file.');
    
    setLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('nextup-clips')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nextup-clips')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('clips')
        .insert([{
          player_id: user.id,
          title: formData.title,
          video_url: publicUrl,
          thumbnail_url: '',
          tags: formData.tags.split(',').map(t => t.trim()),
        }]);

      if (dbError) throw dbError;

      router.push('/feed');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {user && <Sidebar role={role} userId={user.id} />}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Upload Highlight</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Clip Title</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. Amazing Solo Goal vs Watanga"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-transparent rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. goal, forward, skill"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <Film className="text-blue-600" size={32} />
                  <span className="font-bold dark:text-white">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-red-500"><X /></button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                  <span className="block font-bold text-blue-600 mb-1">Click to upload video</span>
                  <span className="text-xs text-gray-400">MP4 or MOV</span>
                  <input type="file" className="hidden" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-extrabold text-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Publish Highlight</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
