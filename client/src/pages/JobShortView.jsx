import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function JobShortView() {
  const { shortCode } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/jobs/short/${shortCode}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load job');
        setJob(data);
      } catch (err) {
        setError(err.message || 'Unable to load job');
      }
    };
    load();
  }, [shortCode]);

  const handleResponse = async (actionCode) => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/jobs/public/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode, phone, actionCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit response');
      
      setStatusMsg(actionCode === '1' 
        ? 'Great! You have accepted the job. The farmer will contact you soon.' 
        : 'You have rejected this job.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !job) return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6"><p className="text-red-500 font-bold">{error}</p></div>
  );

  if (!job) return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
  );

  if (statusMsg) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Response Sent!</h2>
          <p className="text-slate-600 font-medium">{statusMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-50/50 p-6 border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 font-bold tracking-tight mb-2 text-sm uppercase">
             🌾 AgroLink Job Alert
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-2">
            {job.title}
          </h1>
          <p className="text-slate-600 font-medium text-sm">
            Farmers: {job.farmer?.name || "Unknown"}
          </p>
        </div>

        {/* Details List */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
               <Briefcase className="w-5 h-5 text-slate-500" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</p>
               <p className="text-sm font-semibold text-slate-900">{job.category}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
               <IndianRupee className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Wage</p>
               <p className="text-sm font-semibold text-emerald-700">₹{job.wageAmount} <span className="text-slate-500 font-medium">({job.wageType})</span></p>
             </div>
          </div>
        </div>

        {/* Response Action */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3 text-center tracking-tight">Are you available for this job?</h3>
          
          <div className="mb-4">
             <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest pl-1">Your Mobile Number</label>
             <input
               type="tel"
               placeholder="Enter to confirm"
               value={phone}
               maxLength={10}
               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
               className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl py-3 px-4 font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-400 outline-none transition-all shadow-inner text-center tracking-widest"
             />
             {error && <p className="text-xs text-red-500 font-bold mt-2 text-center">{error}</p>}
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => handleResponse('1')}
               disabled={submitting}
               className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
             >
               {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Accept</>}
             </button>
             <button 
               onClick={() => handleResponse('2')}
               disabled={submitting}
               className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
             >
               <XCircle className="w-4 h-4" /> Reject
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
