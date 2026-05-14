'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Play, Heart, MessageCircle, Share2, Tag, Send } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface Clip {
  id: string;
  title: string;
  video_url: string;
  tags?: string[];
  created_at: string;
  player: {
    id: string;
    display_name: string;
    metadata?: {
      avatar_url?: string;
    };
  };
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  user_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    display_name: string;
  };
}

export default function FeedPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [comments, setComments] = useState<{[clipId: string]: Comment[]}>({});
  const [showComments, setShowComments] = useState<{[clipId: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[clipId: string]: string}>({});

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: actor } = await supabase.from('actors').select('role').eq('id', user.id).single();
        setRole(actor?.role || 'PLAYER');
      }

      await fetchClips();
      setLoading(false);
    };

  const handleLike = async (clipId: string) => {
    if (!user) return;

    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    try {
      if (clip.user_liked) {
        // Unlike
        await supabase
          .from('clip_likes')
          .delete()
          .eq('clip_id', clipId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('clip_likes')
          .insert({ clip_id: clipId, user_id: user.id });
      }

      // Update local state
      setClips(clips.map(c =>
        c.id === clipId
          ? {
              ...c,
              user_liked: !c.user_liked,
              likes_count: c.user_liked ? c.likes_count! - 1 : c.likes_count! + 1
            }
          : c
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (clipId: string) => {
    if (!user || !newComment[clipId]?.trim()) return;

    try {
      await supabase
        .from('clip_comments')
        .insert({
          clip_id: clipId,
          user_id: user.id,
          content: newComment[clipId].trim()
        });

      setNewComment({ ...newComment, [clipId]: '' });

      // Refresh clips to update comment count
      await fetchClips();

      // Refresh comments for this clip
      await fetchComments(clipId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchComments = async (clipId: string) => {
    const { data } = await supabase
      .from('clip_comments')
      .select('*, user:actors(display_name)')
      .eq('clip_id', clipId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments({ ...comments, [clipId]: data });
    }
  };

  const toggleComments = async (clipId: string) => {
    const currentlyShowing = showComments[clipId];
    setShowComments({ ...showComments, [clipId]: !currentlyShowing });

    if (!currentlyShowing && !comments[clipId]) {
      await fetchComments(clipId);
    }
  };

  const handleShare = async (clipId: string) => {
    if (!user) return;

    try {
      // Record the share
      await supabase
        .from('clip_shares')
        .insert({ clip_id: clipId, user_id: user.id, platform: 'native' });

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/feed?clip=${clipId}`;
      await navigator.clipboard.writeText(shareUrl);

      // Update local state
      setClips(clips.map(c =>
        c.id === clipId
          ? { ...c, shares_count: c.shares_count! + 1 }
          : c
      ));

      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const fetchClips = async () => {
    // Fetch clips with social data
    const { data: clipsData, error } = await supabase
      .from('clips')
      .select(`
        *,
        player:player_id(*),
        likes:clip_likes(count),
        comments:clip_comments(count),
        shares:clip_shares(count)
      `)
      .order('created_at', { ascending: false });

    if (clipsData && user) {
      // Check if current user liked each clip
      const clipsWithSocial = await Promise.all(
        clipsData.map(async (clip) => {
          const { data: userLike } = await supabase
            .from('clip_likes')
            .select('id')
            .eq('clip_id', clip.id)
            .eq('user_id', user.id)
            .single();

          return {
            ...clip,
            likes_count: clip.likes?.[0]?.count || 0,
            comments_count: clip.comments?.[0]?.count || 0,
            shares_count: clip.shares?.[0]?.count || 0,
            user_liked: !!userLike,
          };
        })
      );
      setClips(clipsWithSocial);
    } else if (clipsData) {
      const clipsWithSocial = clipsData.map(clip => ({
        ...clip,
        likes_count: clip.likes?.[0]?.count || 0,
        comments_count: clip.comments?.[0]?.count || 0,
        shares_count: clip.shares?.[0]?.count || 0,
        user_liked: false,
      }));
      setClips(clipsWithSocial);
    }
  };

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
                    <video 
                      src={clip.video_url} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      controls
                      preload="metadata"
                    />
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
                        <Link
                          href={`/players/${clip.player.id}`}
                          className="font-bold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {clip.player?.display_name}
                        </Link>
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
                      <button
                        onClick={() => handleLike(clip.id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          clip.user_liked
                            ? 'text-red-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart size={20} fill={clip.user_liked ? 'currentColor' : 'none'} />
                        {clip.likes_count}
                      </button>
                      <button
                        onClick={() => toggleComments(clip.id)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle size={20} />
                        {clip.comments_count}
                      </button>
                      <button
                        onClick={() => handleShare(clip.id)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <Share2 size={20} />
                        {clip.shares_count}
                      </button>
                    </div>

                    {showComments[clip.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="space-y-3 mb-4">
                          {comments[clip.id]?.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                {comment.user.display_name?.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.user.display_name}</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {user && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                              {user.user_metadata?.display_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment[clip.id] || ''}
                                onChange={(e) => setNewComment({ ...newComment, [clip.id]: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleComment(clip.id)}
                                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                              />
                              <button
                                onClick={() => handleComment(clip.id)}
                                disabled={!newComment[clip.id]?.trim()}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
