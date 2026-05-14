'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, ShieldAlert, CheckCircle, Search, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function AdminAuditPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: actor } = await supabase.from('actors').select('role').eq('id', user.id).single();
        if (actor?.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
      }

      const { data } = await supabase.from('actors').select('*');
      if (data) setUsers(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const verifyUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('actors')
        .update({ status: 'VERIFIED' })
        .eq('id', id);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === id ? { ...u, status: 'VERIFIED' } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar role="ADMIN" userId={user.id} />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <ShieldAlert className="text-red-500" /> Audit Dashboard
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">Manage Users & Verification</h3>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <Link href={`/players/${u.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{u.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{u.role} • {u.status}</p>
                  </div>
                </Link>
                {u.status !== 'VERIFIED' ? (
                  <button 
                    onClick={() => verifyUser(u.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Verify
                  </button>
                ) : (
                  <span className="text-green-500 font-bold text-sm flex items-center gap-1">
                    <CheckCircle size={16} /> Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
