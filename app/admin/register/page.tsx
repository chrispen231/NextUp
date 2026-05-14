'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', displayName: '', adminCode: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminCode !== 'NEXTUP-ADMIN-2026') return alert('Invalid Admin Code');
    
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { display_name: formData.displayName, role: 'ADMIN' } }
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('actors').insert([{
          id: authData.user.id,
          email: formData.email,
          display_name: formData.displayName,
          role: 'ADMIN',
          status: 'VERIFIED'
        }]);
        router.push('/admin');
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
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShieldAlert className="text-red-500" /> Admin Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-4 border rounded-xl" placeholder="Full Name" onChange={e => setFormData({...formData, displayName: e.target.value})} />
          <input className="w-full p-4 border rounded-xl" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input className="w-full p-4 border rounded-xl" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
          <input className="w-full p-4 border rounded-xl" type="password" placeholder="Admin Secret Code" onChange={e => setFormData({...formData, adminCode: e.target.value})} />
          <button disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700">
            {loading ? <Loader2 className="animate-spin" /> : 'Register Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
