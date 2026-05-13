'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Shield, Upload, Mail, User, Search, Settings, AlertTriangle, LogOut } from 'lucide-react';
import { supabase } from '@/infrastructure/database/supabase';

interface SidebarProps {
  role: 'PLAYER' | 'CLUB' | 'AGENT' | 'SCOUT' | 'ADMIN';
  userId: string;
}

export default function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = {
    common: [
      { name: 'Feed', href: '/feed', icon: Zap },
      { name: 'LFA Center', href: '/lfa', icon: Shield },
    ],
    roleSpecific: {
      PLAYER: [
        { name: 'Upload Clip', href: '/upload', icon: Upload },
        { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
        { name: 'Profile', href: `/players/${userId}`, icon: User },
      ],
      CLUB: [
        { name: 'Trials', href: '/dashboard/trials', icon: Search },
        { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ],
      AGENT: [
        { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ],
      SCOUT: [
        { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ],
      ADMIN: [
        { name: 'Audit Dashboard', href: '/admin', icon: AlertTriangle },
      ],
    }
  };

  const isActive = (href: string) => pathname === href;
  const roleSpecificLinks = getRoleSpecificLinks(role, userId);

  return (
    <nav className="flex flex-col w-64 p-6 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0">
      <div className="mb-6 px-4">
        <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">NextUp</Link>
      </div>
      
      {navItems.common.map(item => (
        <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <item.icon size={20} /> {item.name}
        </Link>
      ))}

      <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

      {roleSpecificLinks.map(item => (
        <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          <item.icon size={20} /> {item.name}
        </Link>
      ))}

      <div className="mt-auto">
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold transition-colors">
          <LogOut size={20} /> Sign out
        </button>
      </div>
    </nav>
  );
}

function getRoleSpecificLinks(role: string, userId: string) {
  const links = {
    PLAYER: [
      { name: 'Upload Clip', href: '/upload', icon: Upload },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: `/players/${userId}`, icon: User },
    ],
    CLUB: [
      { name: 'Trials', href: '/dashboard/trials', icon: Search },
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    AGENT: [
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    SCOUT: [
      { name: 'Inbox', href: '/dashboard/inbox', icon: Mail },
      { name: 'Profile', href: '/dashboard/profile', icon: User },
    ],
    ADMIN: [
      { name: 'Audit Dashboard', href: '/admin', icon: AlertTriangle },
    ]
  };
  return links[role as keyof typeof links] || [];
}
