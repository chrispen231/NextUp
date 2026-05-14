'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      // Verify Admin role
      const { data: actor } = await supabase.from('actors').select('role').eq('id', data.user.id).single();
      if (actor?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        alert('Unauthorized: Admin access only');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="text-red-500" /> Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-4 border rounded-xl" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="w-full p-4 border rounded-xl" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin" /> : 'Login to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
