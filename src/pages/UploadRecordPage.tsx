import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function UploadRecordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setLoading(true);

    try {
      const storageRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileURL,
        fileName: file.name,
        type,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-blue-600 transition-colors uppercase tracking-widest text-xs"
      >
        <ChevronLeft className="h-4 w-4" /> Go Back
      </button>

      <div className="geo-card p-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Add to Vault</h1>

        {success ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center p-6 bg-green-50 rounded-[32px] mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Upload Successful</h2>
            <p className="text-slate-500 font-medium mt-2 tracking-tight">Syncing with your medical timeline...</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-10">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Select Record Category</label>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setType('prescription')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all border-2 ${
                    type === 'prescription' ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <FileText className="h-5 w-5" /> Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setType('report')}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all border-2 ${
                    type === 'report' ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <Upload className="h-5 w-5" /> Lab Report
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Digital Document (PDF/IMG)</label>
              <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-slate-100 rounded-[32px] cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-slate-300" />
                </div>
                <span className="text-slate-600 font-black text-center tracking-tight">
                  {file ? file.name : 'Drop file here or browse device'}
                </span>
                <p className="text-slate-400 text-xs font-medium mt-2">Maximum file size: 10MB</p>
                <input type="file" className="hidden" onChange={handleFileChange} required />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="btn-primary w-full py-5 text-xl"
            >
              {loading ? (
                <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                'Securely Upload to Vault'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
