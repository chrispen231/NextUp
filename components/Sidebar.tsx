'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Shield, Upload, Mail, User, Search, AlertTriangle, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { supabase } from '@/infrastructure/database/supabase';

interface SidebarProps {
  role: 'PLAYER' | 'CLUB' | 'AGENT' | 'SCOUT' | 'ADMIN';
  userId: string;
}

export default function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const commonNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Feed', href: '/feed', icon: Zap },
    { name: 'LFA Center', href: '/lfa', icon: Shield },
  ];

  const roleSpecificLinks = getRoleSpecificLinks(role, userId);
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button className="md:hidden p-4 fixed top-0 left-0 z-50 text-gray-600 dark:text-gray-400" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Navigation */}
      <nav className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-50 p-6 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-8 px-4" />
        
        {commonNav.map(item => (
          <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <item.icon size={20} /> {item.name}
          </Link>
        ))}

        <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

        {roleSpecificLinks.map(item => (
          <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${isActive(item.href) ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <item.icon size={20} /> {item.name}
          </Link>
        ))}

        <div className="mt-auto">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold transition-colors">
            <LogOut size={20} /> Sign out
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
