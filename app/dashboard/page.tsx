'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { User, LogOut, Settings, Bell, Calendar, Search } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <span className="text-blue-600 font-bold text-2xl">NextUp</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <a href="#" className="bg-blue-50 text-blue-600 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Calendar className="mr-3 h-5 w-5" />
              Overview
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Search className="mr-3 h-5 w-5" />
              Find Trials
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-4 py-3 text-sm font-medium rounded-xl">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button 
            onClick={handleSignOut}
            className="flex-shrink-0 w-full group block text-gray-600 hover:text-red-600 transition-colors"
          >
            <div className="flex items-center">
              <LogOut className="inline-block h-5 w-5 mr-3" />
              <div className="text-sm font-medium">Sign out</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.user_metadata?.display_name?.charAt(0) || user?.email?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-4xl">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {user?.user_metadata?.display_name || 'User'}!
              </h2>
              <p className="text-gray-500">
                You are currently registered as a <span className="font-semibold text-blue-600 capitalize">{user?.user_metadata?.role || 'member'}</span>. 
                Complete your verification to unlock all features.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  Verify Identity
                </button>
                <button className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Upcoming Trials</h3>
                <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  No trials found near you.
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                  Your activity will appear here.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
