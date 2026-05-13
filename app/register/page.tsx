'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { User, Shield, Briefcase, Trophy, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Role } from '@/domain/entities/Actor';
import Link from 'next/link';

type Step = 'ROLE_SELECTION' | 'DETAILS';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('ROLE_SELECTION');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'PLAYER' as Role,
    // Player specific
    position: '',
    dateOfBirth: '',
    // Agent/Club specific
    organization: '',
    licenseNumber: '',
    location: '',
  });

  const roles = [
    { id: 'PLAYER', title: 'Player', icon: <Trophy />, desc: 'Showcase your talent to scouts and clubs.' },
    { id: 'AGENT', title: 'Agent', icon: <Briefcase />, desc: 'Manage players and find opportunities.' },
    { id: 'SCOUT', title: 'Scout', icon: <Shield />, desc: 'Identify the next big Liberian star.' },
    { id: 'CLUB', title: 'Club', icon: <User />, desc: 'Recruit talent for your team.' },
  ];

  const handleRoleSelect = (role: Role) => {
    setFormData({ ...formData, role });
    setStep('DETAILS');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile in our database (actors table)
        // Note: We'll need to create this table in Supabase later
        const { error: profileError } = await supabase
          .from('actors')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              display_name: formData.displayName,
              role: formData.role,
              status: 'UNVERIFIED',
              metadata: {
                position: formData.position,
                date_of_birth: formData.dateOfBirth,
                organization: formData.organization,
                license_number: formData.licenseNumber,
                location: formData.location,
              }
            }
          ]);

        if (profileError) throw profileError;

        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="text-blue-600 font-bold text-2xl mb-2 inline-block">NextUp</Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 'ROLE_SELECTION' ? 'Choose your path' : 'Complete your profile'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'ROLE_SELECTION' 
              ? 'Select the role that best describes you' 
              : `Joining as a ${formData.role.toLowerCase()}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'ROLE_SELECTION' ? (
          <div className="grid grid-cols-1 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id as Role)}
                className="flex items-center p-6 bg-white rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {role.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.desc}</p>
                </div>
                <ArrowRight className="text-gray-300 group-hover:text-blue-600" size={20} />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <button 
              type="button" 
              onClick={() => setStep('ROLE_SELECTION')}
              className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {formData.role === 'PLAYER' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DF">Defender</option>
                    <option value="MF">Midfielder</option>
                    <option value="FW">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(formData.role === 'AGENT' || formData.role === 'SCOUT') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization / License</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                  placeholder="e.g. FIFA License #123"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
            )}

            {formData.role === 'CLUB' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location / City</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                  placeholder="e.g. Monrovia"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
