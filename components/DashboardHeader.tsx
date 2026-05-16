'use client';

import { Loader2, Zap, Sun, Moon, Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';

export default function DashboardHeader({ user, profile }: { user: any, profile: any }) {
  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'User';
  const avatarUrl = profile?.metadata?.avatar_url || user?.user_metadata?.avatar_url;
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user?.id) {
      // Fetch initial unread count
      const fetchUnreadCount = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        setUnreadCount(count || 0);
      };

      fetchUnreadCount();

      // Subscribe to new notifications
      const channel = supabase
        .channel('header-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchUnreadCount()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-8 flex justify-between items-center transition-all">
      <div className="w-8 md:w-10" /> {/* Spacer for symmetry */}
      
      <Link href="/" className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 md:gap-2">
        <Zap className="fill-blue-600 w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden sm:inline">NextUp</span>
      </Link>
      
      <div className="flex items-center gap-2 md:gap-3">
        <Link 
          href="/dashboard/notifications"
          className="relative p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
          )}
        </Link>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <Link href="/dashboard/profile" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm hover:scale-105 transition-transform ml-1">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0) || user?.email?.charAt(0)
          )}
        </Link>
      </div>
    </header>
  );
}
