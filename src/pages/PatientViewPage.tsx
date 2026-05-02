import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ChevronLeft, UserCircle, FileText, ExternalLink, Calendar, Lock, AlertCircle, ShieldCheck, Activity } from 'lucide-react';
import { db } from '../lib/firebase';

interface PatientProfile {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  sharingEnabled: boolean;
}

interface Record {
  id: string;
  type: 'prescription' | 'report';
  fileURL: string;
  fileName: string;
  createdAt: string;
}

export default function PatientViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch patient profile
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Patient not found.");
          return;
        }

        const data = docSnap.data() as PatientProfile;
        setPatient(data);

        if (!data.sharingEnabled) {
          return; // Stop here if sharing is off
        }

        // Fetch records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedRecords: Record[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRecords.push({ id: doc.id, ...doc.data() } as Record);
        });
        setRecords(fetchedRecords);
      } catch (err: any) {
        console.error("Error fetching patient data:", err);
        setError("Unable to access patient records.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-medium mb-6">
          <ChevronLeft className="h-5 w-5" /> Back
        </button>
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">{error}</h2>
          <p className="text-gray-500 mt-2">The patient ID may be incorrect or doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (patient && !patient.sharingEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-medium mb-6">
          <ChevronLeft className="h-5 w-5" /> Back
        </button>
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <Lock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-gray-500 mt-2">Sharing has been turned OFF by the patient.</p>
          <div className="mt-8 p-4 bg-orange-50 text-orange-700 text-sm rounded-xl font-medium">
            Please ask the patient to enable sharing from their dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 font-bold mb-4 hover:text-blue-600 transition-colors uppercase tracking-widest text-xs"
      >
        <ChevronLeft className="h-4 w-4" /> Go Back
      </button>

      {/* Patient Profile Header */}
      <div className="geo-card p-10 flex flex-col md:flex-row items-center gap-10 bg-slate-900 border-none">
        <div className="w-32 h-32 bg-blue-600 rounded-[40px] flex items-center justify-center text-white border-4 border-slate-800 shadow-2xl shrink-0">
          <UserCircle className="h-16 w-16" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-5xl font-black text-white tracking-tighter">{patient?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            <div className="px-6 py-2 bg-slate-800 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] border border-slate-700">
              {patient?.age} Years
            </div>
            <div className="px-6 py-2 bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-700">
              {patient?.gender}
            </div>
            <div className="px-6 py-2 bg-red-950 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-[0.2em] border border-red-900/50">
              Blood: {patient?.bloodGroup}
            </div>
          </div>
        </div>
        <div className="hidden lg:block w-px h-24 bg-slate-800 mx-4"></div>
        <div className="flex flex-col items-center gap-2 bg-slate-800 p-6 rounded-[32px] border border-slate-700">
           <ShieldCheck className="h-8 w-8 text-green-400" />
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized Access</p>
        </div>
      </div>

      {/* Records Timeline */}
      <div className="space-y-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Repository</h2>
            <p className="text-slate-500 font-medium">All synchronized medical data for this patient.</p>
          </div>
        </div>
        
        {records.length === 0 ? (
          <div className="geo-card p-32 text-center border-dashed border-2 bg-slate-50/50">
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">Vault is Empty</p>
             <p className="text-slate-500 mt-2 font-medium">No medical documents have been shared yet.</p>
          </div>
        ) : (
          <div className="space-y-8 relative ml-4 sm:ml-8">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100 rounded-full"></div>
             {records.map((record) => (
                <div key={record.id} className="relative pl-12 group">
                   <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 border-4 border-slate-50 shadow-xl shadow-blue-100 group-hover:scale-125 transition-transform"></div>
                   <div className="geo-card p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:border-blue-400 transition-all group-hover:-translate-y-1 duration-300">
                      <div className="flex items-center gap-8">
                         <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center font-black text-sm shadow-sm ${
                            record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                         }`}>
                            {record.type === 'prescription' ? 'RX' : 'LAB'}
                         </div>
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h3 className="font-black text-slate-900 capitalize text-2xl tracking-tighter">{record.type}</h3>
                               <span className="px-3 py-1 bg-slate-100 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">Verified</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                               <div className="flex items-center gap-2">
                                 <Calendar className="h-4 w-4" />
                                 {new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                               </div>
                               <div className="flex items-center gap-2">
                                 <Activity className="h-4 w-4" />
                                 {record.fileName}
                               </div>
                            </div>
                         </div>
                      </div>
                      <a 
                        href={record.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary py-4 px-10 text-base"
                      >
                         Open Document <ExternalLink className="h-5 w-5" />
                      </a>
                   </div>
                </div>
             ))}
          </div>
        ) }
      </div>
    </div>
  );
}
