import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, QrCode, Activity, ScanLine, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QRScanner } from '../components/QRScanner';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const handleScan = (id: string) => {
    setShowScanner(false);
    navigate(`/doctor/patient/${id}`);
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      {/* Welcome Section */}
      <div className="geo-card-blue relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 p-12 bg-slate-900">
        <div className="relative z-10 w-24 h-24 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-900/40 flex items-center justify-center shrink-0">
          <UserCircle className="h-12 w-12 text-white" />
        </div>
        <div className="relative z-10 text-center lg:text-left flex-1">
          <h1 className="text-5xl font-black text-white tracking-tighter">Dr. {profile.name}</h1>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
             <span className="px-5 py-2 bg-slate-800 rounded-full text-xs font-black text-blue-400 uppercase tracking-widest border border-slate-700">
               {profile.degree}
             </span>
             <span className="px-5 py-2 bg-slate-800 rounded-full text-xs font-black text-green-400 uppercase tracking-widest border border-slate-700">
               Verified Clinician
             </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowScanner(true)}
          className="relative z-10 btn-primary py-5 px-10 text-xl group overflow-hidden"
        >
          <ScanLine className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
          Scan Health QR
          <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform"></div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Search Card */}
        <div className="md:col-span-12 lg:col-span-8">
          <div className="geo-card p-10 space-y-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Patient Lookup</h2>
              <p className="text-slate-500 font-medium mt-1">Manual access via unique identifier.</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter MV-ID (e.g. u1234abcd)"
                  className="input-field pl-16 py-6 text-xl"
                />
              </div>
              <button type="submit" className="btn-secondary w-full py-5 text-xl font-black">
                Connect to Vault
              </button>
            </form>

            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
               <div className="p-4 bg-white rounded-2xl shadow-sm">
                 <QrCode className="h-8 w-8 text-blue-600" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authorization Protocol</p>
                 <p className="text-sm font-bold text-slate-500">
                   Patient must grant explicit "Active sharing" permission for their record to be visible via this dashboard.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          <div className="geo-card p-10 bg-blue-600 border-none text-white overflow-hidden relative group">
            <Activity className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-2xl mb-2 relative z-10">Real-time Sync</h3>
            <p className="text-blue-100 text-sm font-bold relative z-10 leading-relaxed">
              Records are retrieved directly from the patient vault. No data is stored locally on this terminal.
            </p>
          </div>

          {[
            { title: 'Secure Protocol', desc: 'Industry standard AES encryption for all data transit.', color: 'slate' },
            { title: 'Digital Signature', desc: 'Verified doctor credentials required for all read actions.', color: 'slate' }
          ].map((item, i) => (
            <div key={i} className="geo-card p-8">
              <div className="w-10 h-10 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                 <ShieldCheck className="h-5 w-5" />
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
