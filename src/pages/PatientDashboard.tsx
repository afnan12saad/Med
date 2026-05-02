import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Clock, Share2, User, UserCircle, Droplets, MapPin, Calendar } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

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
          <div className="geo-card p-10 flex flex-col items-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Digital Health ID</p>
            <div className="w-56 h-56 bg-slate-100 rounded-[32px] p-6 flex items-center justify-center border-4 border-slate-900 shadow-inner">
              <QRCodeSVG 
                value={`${window.location.origin}/doctor/patient/${profile.uid}`} 
                size={180}
                level="H"
              />
            </div>
            <p className="mt-8 font-mono text-sm font-black bg-slate-100 px-4 py-2 rounded-xl text-slate-600 border border-slate-200">
              mv_auth_{profile.uid.substring(0, 8)}
            </p>
            <p className="mt-3 text-xs font-bold text-slate-400">Scanning allows doctor access</p>
          </div>

          <div className="geo-card-blue flex flex-col justify-between h-[240px]">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl tracking-tight">Privacy Access</h3>
              <button
                onClick={toggleSharing}
                disabled={sharingLoading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                   profile.sharingEnabled ? 'bg-blue-500' : 'bg-blue-800'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    profile.sharingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-blue-200 text-sm font-medium mt-4">When active, verified doctors can scan your ID to view medical history.</p>
            <div className="mt-6 pt-6 border-t border-blue-800 flex justify-between items-center">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Status</span>
              <span className={`text-[10px] font-black px-3 py-1 rounded tracking-tighter ${profile.sharingEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {profile.sharingEnabled ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Timeline Preview */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="geo-card p-8">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Blood Group</p>
              <p className="text-3xl font-black text-blue-600 tracking-tighter">{profile.bloodGroup}</p>
            </div>
            <div className="geo-card p-8">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Age</p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{profile.age} Yrs</p>
            </div>
            <div className="geo-card p-8">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Gender</p>
              <p className="text-lg font-black text-slate-800 tracking-tight">{profile.gender}</p>
            </div>
          </div>

          <div className="geo-card overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-xl tracking-tight">Recent Activity</h3>
              <Link to="/patient/timeline" className="text-blue-600 text-sm font-bold hover:underline">View Timeline</Link>
            </div>
            <div className="p-4 sm:p-10 space-y-6 flex flex-col items-center justify-center text-center">
               <Clock className="h-12 w-12 text-slate-200" />
               <div>
                 <p className="text-slate-500 font-medium">Click "View Timeline" to see all your uploaded medical reports and prescriptions.</p>
               </div>
            </div>
          </div>

          <div className="bg-orange-50 p-8 rounded-[32px] border border-orange-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-orange-900 font-bold">Residency Information</p>
              <p className="text-orange-700 text-sm font-medium">{profile.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
