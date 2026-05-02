import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Bell, Plus, Trash2, Clock, Calendar as CalIcon, X } from 'lucide-react';

export const RemindersList = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', time: '09:00' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'reminders'),
      where('patientId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title || !auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'reminders'), {
        patientId: auth.currentUser.uid,
        title: newReminder.title,
        time: newReminder.time,
        active: true,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        createdAt: serverTimestamp()
      });
      setNewReminder({ title: '', time: '09:00' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await updateDoc(doc(db, 'reminders', id), { active: !active });
  };

  const deleteReminder = async (id: string) => {
    await deleteDoc(doc(db, 'reminders', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" /> Health Timers
        </h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {showAdd && (
        <div className="geo-card p-6 border-blue-200 bg-blue-50/30">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">New Reminder</span>
              <button type="button" onClick={() => setShowAdd(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g., Vitamin C, 500mg"
              className="input-field py-3 text-sm"
              value={newReminder.title}
              onChange={e => setNewReminder({...newReminder, title: e.target.value})}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="time"
                  required
                  className="input-field py-3 text-sm"
                  value={newReminder.time}
                  onChange={e => setNewReminder({...newReminder, time: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary py-3 px-8 text-sm"
              >
                Set
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-[24px] border border-dashed border-slate-200">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active timers</p>
          </div>
        ) : (
          reminders.map(r => (
            <div key={r.id} className={`flex items-center justify-between p-5 geo-card group ${!r.active && 'opacity-60 grayscale'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 tracking-tight">{r.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{r.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleActive(r.id, r.active)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${r.active ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${r.active ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <button 
                  onClick={() => deleteReminder(r.id)}
                  className="p-2 text-slate-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
