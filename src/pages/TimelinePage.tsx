import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, ExternalLink, Calendar } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Record {
  id: string;
  type: 'prescription' | 'report';
  fileURL: string;
  fileName: string;
  createdAt: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedRecords: Record[] = [];
        querySnapshot.forEach((doc) => {
          fetchedRecords.push({ id: doc.id, ...doc.data() } as Record);
        });
        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-blue-600 transition-colors uppercase tracking-widest text-xs"
      >
        <ChevronLeft className="h-4 w-4" /> Go Back
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medical Timeline</h1>
          <p className="text-slate-500 font-medium">Historical history of documents and reports.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : records.length === 0 ? (
        <div className="geo-card p-20 text-center">
          <FileText className="h-16 w-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No records in vault</h2>
          <p className="text-slate-500 font-medium mt-2">Upload medical data to build your history.</p>
        </div>
      ) : (
        <div className="space-y-6 relative ml-4 sm:ml-6">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
          {records.map((record) => (
            <div key={record.id} className="relative pl-10">
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md shadow-blue-100"></div>
              <div className="geo-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-blue-300 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${
                    record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {record.type === 'prescription' ? 'RX' : 'PDF'}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 capitalize text-lg tracking-tight">{record.type} Record</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', day: '2-digit', year: 'numeric' 
                        })}
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
                  className="btn-secondary py-3 px-6 text-sm"
                >
                  View Document <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
