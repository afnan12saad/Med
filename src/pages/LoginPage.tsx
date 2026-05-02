import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Activity, Mail, Lock, User, UserCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // Profile will be loaded by AuthContext, redirecting handled in useEffect or ProtectedRoute
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Role is handled during onboarding after account creation
        navigate('/onboarding', { state: { initialRole: role } });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in and profile exists, redirect
  React.useEffect(() => {
    if (profile) {
      navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    }
  }, [profile, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl mb-6 shadow-xl shadow-blue-200/50">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">MedVault</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your medical records and identity.</p>
        </div>

        <div className="geo-card p-10">
          <div className="flex gap-2 mb-10 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                !isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
              }`}
            >
              Join
            </button>
          </div>

          {!isLogin && (
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${
                  role === 'patient' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <User className={`h-6 w-6 ${role === 'patient' ? 'text-blue-600' : 'text-slate-300'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${role === 'patient' ? 'text-blue-600' : 'text-slate-400'}`}>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-[24px] border-2 transition-all ${
                  role === 'doctor' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <UserCheck className={`h-6 w-6 ${role === 'doctor' ? 'text-blue-600' : 'text-slate-300'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${role === 'doctor' ? 'text-blue-600' : 'text-slate-400'}`}>Doctor</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 mt-4"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                isLogin ? 'Sign In' : 'Create Vault'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
