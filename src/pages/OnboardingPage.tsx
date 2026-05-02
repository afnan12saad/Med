import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.initialRole || 'patient';
  
  const [role, setRole] = useState<'patient' | 'doctor'>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    degree: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const profileData: any = {
        uid: user.uid,
        email: user.email,
        role: role,
        name: formData.name,
        address: formData.address,
        createdAt: new Date().toISOString(),
      };

      if (role === 'patient') {
        profileData.age = formData.age;
        profileData.gender = formData.gender;
        profileData.bloodGroup = formData.bloodGroup;
        profileData.sharingEnabled = true; // Default ON
      } else {
        profileData.degree = formData.degree;
      }

      await setDoc(doc(db, 'users', user.uid), profileData);
      await refreshProfile();
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-10 rounded-[40px] shadow-xl border border-slate-200">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete your profile</h1>
          <p className="text-slate-500 font-medium mt-1">Tell us a bit more about you to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            {role === 'patient' ? (
              <>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="input-field"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option>A Positive (A+)</option>
                    <option>A Negative (A-)</option>
                    <option>B Positive (B+)</option>
                    <option>B Negative (B-)</option>
                    <option>O Positive (O+)</option>
                    <option>O Negative (O-)</option>
                    <option>AB Positive (AB+)</option>
                    <option>AB Negative (AB-)</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Degree / Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="input-field"
                  placeholder="MBBS, MD Cardiology"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Address</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field min-h-[120px] resize-none"
                placeholder="123 Health St, Medical District"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-lg"
          >
            {loading ? 'Setting up Vault...' : 'Complete Account Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
