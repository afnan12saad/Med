import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Activity, Mail, Lock, User, UserCheck, Chrome } from 'lucide-react';
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
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          // If user doesn't exist, automatically try to create the account (The "Bypass")
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              navigate('/onboarding', { state: { initialRole: role } });
            } catch (createErr: any) {
              throw createErr;
            }
          } else {
            throw err;
          }
        }
      } else {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          navigate('/onboarding', { state: { initialRole: role } });
        } catch (err: any) {
          // If email already in use, automatically try to sign in (The "Bypass")
          if (err.code === 'auth/email-already-in-use') {
            try {
              await signInWithEmailAndPassword(auth, email, password);
            } catch (loginErr: any) {
              if (loginErr.code === 'auth/wrong-password' || loginErr.code === 'auth/invalid-credential') {
                setError('This account already exists, but the password provided is incorrect.');
                setLoading(false);
                return;
              }
              throw loginErr;
            }
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Auth provider not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in Firebase Console. Please enable it in the Authentication tab under "Providers".');
      } else {
        setError(err.message || 'Google Authentication failed');
      }
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
              <div className="p-5 bg-red-50 text-red-700 text-xs font-bold rounded-[24px] border border-red-100 space-y-2">
                <p>{error}</p>
                {error.includes('operation-not-allowed') && (
                  <div className="pt-2 border-t border-red-100 text-[10px] text-red-500 uppercase tracking-wider leading-relaxed">
                    ⚙️ Fix: Go to Firebase Console → Authentication → Sign-in method and enable "Email/Password" and "Google".
                  </div>
                )}
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

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-[0.2em]">
                <span className="bg-white px-4 text-slate-400">Secure Gateway</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-700 flex items-center justify-center gap-3 hover:border-blue-600 hover:text-blue-600 transition-all group overflow-hidden relative shadow-sm"
            >
              <Chrome className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
