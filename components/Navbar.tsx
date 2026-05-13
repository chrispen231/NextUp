'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Zap, Loader2, Sun, Moon, Upload } from 'lucide-react';
import { supabase } from '@/infrastructure/database/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Don't show global navbar on dashboard, login, or register pages
  const isExcluded = pathname?.startsWith('/dashboard') || pathname === '/login' || pathname === '/register';

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile from actors table
        const { data: actorData } = await supabase
          .from('actors')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (actorData) {
          setProfile(actorData);
        }
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  if (isExcluded) return null;

  const avatarUrl = profile?.metadata?.avatar_url || user?.user_metadata?.avatar_url;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 px-6 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <Zap className="fill-blue-600" />
        NextUp
      </Link>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        {loading ? (
          <Loader2 className="animate-spin text-blue-600" size={20} />
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link href="/lfa" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-4">
              <Shield size={20} />
            </Link>
            {profile?.role === 'PLAYER' && (
              <Link href="/upload" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Upload size={20} />
              </Link>
            )}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-1">{displayName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Dashboard</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-105 transition-transform">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  displayName?.charAt(0) || '?'
                )}
              </div>
            </Link>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <User size={18} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
