import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ChevronLeft, UserCircle, FileText, ExternalLink, Calendar, Lock, AlertCircle } from 'lucide-react';
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
      <div className="geo-card p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
          <UserCircle className="h-12 w-12" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{patient?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest border border-slate-100">
              {patient?.age} Years
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest border border-slate-100">
              {patient?.gender}
            </div>
            <div className="px-4 py-2 bg-red-50 rounded-xl text-xs font-black text-red-600 uppercase tracking-widest border border-red-100">
              Blood: {patient?.bloodGroup}
            </div>
          </div>
        </div>
      </div>

      {/* Records Timeline */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <FileText className="h-7 w-7 text-blue-600" /> Medical Repository
        </h2>
        
        {records.length === 0 ? (
          <div className="geo-card p-20 text-center border-dashed">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No synchronized records found.</p>
          </div>
        ) : (
          <div className="space-y-6 relative ml-4 sm:ml-6">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
             {records.map((record) => (
                <div key={record.id} className="relative pl-10">
                   <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md"></div>
                   <div className="geo-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${
                            record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                         }`}>
                            {record.type === 'prescription' ? 'RX' : 'PDF'}
                         </div>
                         <div>
                            <h3 className="font-black text-slate-900 capitalize text-lg tracking-tight">{record.type}</h3>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                               <div className="flex items-center gap-1">
                                 <Calendar className="h-3 w-3" />
                                 {new Date(record.createdAt).toLocaleDateString()}
                               </div>
                               <span>•</span>
                               <span className="truncate max-w-[150px]">{record.fileName}</span>
                            </div>
                         </div>
                      </div>
                      <a 
                        href={record.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary py-3 px-6 text-sm flex items-center gap-2"
                      >
                         <ExternalLink className="h-4 w-4" /> View Record
                      </a>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
