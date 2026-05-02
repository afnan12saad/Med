import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Section */}
      <div className="geo-card-blue relative overflow-hidden flex flex-col md:flex-row items-center gap-10 p-12">
        <div className="relative z-10 w-24 h-24 bg-white/20 rounded-[32px] backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
          <UserCircle className="h-12 w-12 text-white" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-white tracking-tighter">Welcome, Dr. {profile.name}</h1>
          <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mt-2">{profile.degree}</p>
        </div>
        
        {/* Abstract Geometry */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-white rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Search Card */}
        <div className="md:col-span-12 lg:col-span-8">
          <div className="geo-card p-10 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Patient Vault</h2>
              <p className="text-slate-500 font-medium mt-1">Enter a Patient ID or scan their Health QR to view history.</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter unique ID (e.g. u1234abcd)"
                  className="input-field pl-14 py-5 text-lg"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3">
                <Search className="h-6 w-6" /> Unlock Records
              </button>
            </form>

            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
               <div className="p-2 bg-white rounded-xl shadow-sm">
                 <QrCode className="h-5 w-5 text-blue-600" />
               </div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                 Patient must have active sharing status to grant access
               </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          {[
            { title: 'Secure Access', desc: 'Patient records are only visible with their explicit permission.', color: 'blue' },
            { title: 'Real-time Updates', desc: 'See reports and prescriptions instantly as они are uploaded.', color: 'green' },
            { title: 'Digital Identity', desc: 'Each patient has a unique Health QR for immediate check-ins.', color: 'orange' }
          ].map((item, i) => (
            <div key={i} className="geo-card p-8">
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                item.color === 'green' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                 <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-black text-slate-900 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
