'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Play, Heart, MessageCircle, Share2, Tag } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function FeedPage() {
  const [clips, setClips] = useState<any[]>([]);
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

      const { data, error } = await supabase
        .from('clips')
        .select('*, player:player_id(*)')
        .order('created_at', { ascending: false });
      
      if (data) setClips(data);
      setLoading(false);
    };

    init();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {user && <Sidebar role={role} userId={user.id} />}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Feed</h1>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : clips.length > 0 ? (
            <div className="space-y-8">
              {clips.map((clip) => (
                <div key={clip.id} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
                    <img src={clip.thumbnail_url} alt={clip.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <Play className="text-white fill-white" size={48} />
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 overflow-hidden">
                        {clip.player?.metadata?.avatar_url ? (
                          <img src={clip.player.metadata.avatar_url} alt={clip.player.display_name} className="w-full h-full object-cover" />
                        ) : (
                          clip.player?.display_name?.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{clip.player?.display_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Posted {new Date(clip.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>                    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{clip.title}</h3>
                    <div className="flex gap-2 mb-4">
                      {clip.tags?.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md uppercase font-bold tracking-wider">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"><Heart size={20} /> Like</button>
                      <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"><MessageCircle size={20} /> Comment</button>
                      <button className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"><Share2 size={20} /> Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-gray-400 italic">No video clips have been uploaded yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
