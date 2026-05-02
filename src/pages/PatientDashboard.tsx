import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Clock, Share2, User, UserCircle, Droplets, MapPin, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { RemindersList } from '../components/RemindersList';
import { HealthuChatbot } from '../components/HealthuChatbot';

export default function PatientDashboard() {
  const { profile, refreshProfile } = useAuth();
  const [sharingLoading, setSharingLoading] = useState(false);

  if (!profile) return null;

  const toggleSharing = async () => {
    setSharingLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        sharingEnabled: !profile.sharingEnabled
      });
      await refreshProfile();
    } catch (error) {
      console.error("Failed to toggle sharing:", error);
    } finally {
      setSharingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage your medical records and digital identity.</p>
        </div>
        <Link to="/patient/upload" className="btn-primary py-4 px-8 text-lg">
          + Upload New Record
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: ID & Privacy */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="geo-card p-10 flex flex-col items-center bg-slate-900 group">
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Digital Health Pass</p>
            <div className="w-64 h-64 bg-white rounded-[40px] p-8 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <QRCodeSVG 
                value={`patient:${profile.uid}`} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="mt-10 w-full text-center space-y-2">
              <p className="font-mono text-sm font-black text-blue-400">
                {profile.uid.substring(0, 12)}
              </p>
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </div>

          <div className="geo-card p-10">
            <RemindersList />
          </div>
        </div>

        {/* Right Column: Stats & Timeline Preview */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="geo-card p-8 bg-blue-600 border-none group overflow-hidden relative">
              <Droplets className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Blood Group</p>
              <p className="text-4xl font-black text-white tracking-tighter relative z-10">{profile.bloodGroup}</p>
            </div>
            <div className="geo-card p-8 bg-slate-900 border-none group overflow-hidden relative">
              <Heart className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Vault Status</p>
              <p className="text-2xl font-black text-green-400 tracking-tighter relative z-10 uppercase flex items-center gap-2">
                <ShieldCheck className="h-6 w-6" /> Secured
              </p>
            </div>
            <div className="geo-card p-8 group overflow-hidden relative">
              <MapPin className="absolute -right-4 -bottom-4 h-24 w-24 text-slate-100 group-hover:scale-110 transition-transform" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 relative z-10">Address</p>
              <p className="text-sm font-bold text-slate-800 line-clamp-2 relative z-10">{profile.address}</p>
            </div>
          </div>

          <div className="geo-card-blue h-[200px] flex items-center justify-between p-12 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-black text-3xl tracking-tight mb-2">Vault Sharing</h3>
              <p className="text-blue-200 font-medium max-w-sm">Enable this to allow verified medical professionals to scan your ID.</p>
            </div>
            <div className="relative z-10">
              <button
                onClick={toggleSharing}
                disabled={sharingLoading}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none shadow-inner ${
                  profile.sharingEnabled ? 'bg-green-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform ${
                    profile.sharingEnabled ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="absolute top-0 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="geo-card overflow-hidden h-[400px]">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-2xl tracking-tight">Recent Archives</h3>
              <Link to="/patient/timeline" className="btn-secondary py-2 px-6 text-xs uppercase tracking-widest">
                History Full View
              </Link>
            </div>
            <div className="h-full flex flex-col items-center justify-center text-center p-20">
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                 <Clock className="h-10 w-10 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Timeline history is encrypted.</p>
               <p className="text-slate-500 mt-2 font-medium">Head over to the timeline to view historical documents.</p>
            </div>
          </div>
        </div>
      </div>

      <HealthuChatbot />
    </div>
  );
}
