'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap, Shield, Upload, Mail, User, Search, AlertTriangle, LogOut, 
  LayoutDashboard, Menu, X, Bell, Users, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from '@/infrastructure/database/supabase';

interface SidebarProps {
  role: 'PLAYER' | 'CLUB' | 'AGENT' | 'SCOUT' | 'ADMIN';
  userId: string;
}

export default function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  useEffect(() => {
    if (!userId) return;

    // Fetch initial count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const commonNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Feed', href: '/feed', icon: Zap },
    { name: 'LFA Center', href: '/lfa', icon: Shield },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount },
  ];

  const roleSpecificLinks = getRoleSpecificLinks(role, userId);
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden p-4 fixed top-0 left-0 z-[60] text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-br-2xl border-r border-b border-gray-100 dark:border-gray-800 shadow-sm" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Navigation */}
      <nav className={`fixed md:sticky top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 flex flex-col transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-24' : 'md:w-64'}`}>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-blue-600 text-white rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
          <div className={`mb-10 flex items-center ${isCollapsed ? 'justify-center' : 'px-4'}`}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Zap className="text-white fill-white" size={20} />
              </div>
              {!isCollapsed && <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">NextUp</span>}
            </Link>
          </div>
          
          <div className="space-y-2">
            {commonNav.map(item => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all group relative ${isActive(item.href) ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
                  <item.icon size={22} className={isActive(item.href) ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                </div>
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`${isCollapsed ? 'absolute top-2 right-2' : 'relative'} bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black ring-2 ring-white dark:ring-gray-900 animate-bounce`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-gray-800">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800 my-6 mx-2" />

          <div className="space-y-2">
            {roleSpecificLinks.map(item => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsOpen(false)} 
                className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all group relative ${isActive(item.href) ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
                  <item.icon size={22} className={isActive(item.href) ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                </div>
                {!isCollapsed && <span className="flex-1 truncate">{item.name}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl border border-gray-800">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleSignOut} 
            className={`flex w-full items-center gap-3 p-3.5 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 font-bold transition-all group relative`}
          >
            <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : ''}`}>
              <LogOut size={22} className="group-hover:rotate-12 transition-transform" />
            </div>
            {!isCollapsed && <span className="truncate">Sign out</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl">
                Sign out
              </div>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

function getRoleSpecificLinks(role: string, userId: string) {
  const links = {
    PLAYER: [
      { name: 'Upload Clip', href: '/upload', icon: Upload },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    CLUB: [
      { name: 'My Squad', href: '/dashboard/squad', icon: Users },
      { name: 'Trials', href: '/dashboard/trials', icon: Search },
      { name: 'Talent Pool', href: '/players', icon: User },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    AGENT: [
      { name: 'Talent Pool', href: '/players', icon: User },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    SCOUT: [
      { name: 'Talent Pool', href: '/players', icon: User },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],    ADMIN: [
      { name: 'Audit Dashboard', href: '/admin', icon: AlertTriangle },
    ]
  };
  return links[role as keyof typeof links] || [];
}
