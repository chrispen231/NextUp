'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: actorData } = await supabase
        .from('actors')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (actorData) setProfile(actorData);
      setLoading(false);
    };

    initDashboard();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  const role = profile?.role || user?.user_metadata?.role || 'PLAYER';

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <Sidebar role={role} userId={user.id} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
