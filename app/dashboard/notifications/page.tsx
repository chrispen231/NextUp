'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Bell, CheckCircle2, MessageSquare, Heart, MessageCircle, Share2, ShieldCheck, UserCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setNotifications(data);
      setLoading(false);

      // Mark all as read when viewing the page
      if (data && data.some(n => !n.is_read)) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return <MessageSquare className="text-blue-500" size={20} />;
      case 'LIKE': return <Heart className="text-red-500" size={20} />;
      case 'COMMENT': return <MessageCircle className="text-green-500" size={20} />;
      case 'SHARE': return <Share2 className="text-purple-500" size={20} />;
      case 'VERIFICATION': return <ShieldCheck className="text-yellow-500" size={20} />;
      case 'TRIAL': return <UserCheck className="text-orange-500" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="text-blue-600" /> Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Stay updated with your latest activity.</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-xl text-green-600 font-bold text-sm">
            <CheckCircle2 size={16} /> Up to date
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map(n => (
          <div 
            key={n.id} 
            className={`flex items-start gap-4 p-6 rounded-[2rem] border transition-all ${
              !n.is_read 
                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
               !n.is_read ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-gray-900 dark:text-white">{n.title}</h4>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{n.content}</p>
              {n.link && (
                <a href={n.link} className="inline-block mt-3 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  View details →
                </a>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="text-gray-300 dark:text-gray-600" size={32} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">All caught up!</p>
            <p className="text-gray-400 dark:text-gray-500 mt-1">No new notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
