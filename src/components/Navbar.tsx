import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-blue-900 tracking-tight">MedVault</span>
          </Link>
          
          {user && (
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="hidden sm:flex items-center gap-3 p-2 pr-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs uppercase">
                    {profile.name.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-none">{profile.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{profile.role}</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
