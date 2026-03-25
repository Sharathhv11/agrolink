import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMyJobs } from '../api/jobsApi';
import {
  Plus,
  Briefcase,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Users,
  Trash2,
  Sparkles
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    back: "Back",
    myJobs: "Job Workspace",
    manageJobs: "Manage and track all your posted jobs in one place.",
    createJob: "Create New Job",
    deleteConfirm: "Are you sure you want to delete this job? This action cannot be undone.",
    tryAgain: "Try Again",
    noJobs: "No Active Postings",
    noJobsDesc: "You haven't posted any jobs yet. Create your first job to start matching with verified workers.",
    postJobNow: "Post a Job Now",
    workersNeeded: "Workers needed",
    added: "Added",
    locNotSpecified: "Location not specified",
    viewMatches: "View Analytics",
    open: "Active",
    failedToFetch: "Failed to fetch jobs"
  },
  kn: {
    back: "ಹಿಂದೆ",
    myJobs: "ಕೆಲಸದ ಸ್ಥಳ",
    manageJobs: "ನಿಮ್ಮ ಎಲ್ಲಾ ಕೆಲಸಗಳನ್ನು ಇಲ್ಲಿ ನಿರ್ವಹಿಸಿ.",
    createJob: "ಹೊಸ ಕೆಲಸ ರಚಿಸಿ",
    deleteConfirm: "ಈ ಕೆಲಸವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?",
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    noJobs: "ಯಾವುದೇ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿಲ್ಲ",
    noJobsDesc: "ನೀವು ಯಾವುದೇ ಕೆಲಸವನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿಲ್ಲ. ಈಗಲೆ ಪ್ರಾರಂಭಿಸಿ.",
    postJobNow: "ಈಗ ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ",
    workersNeeded: "ಕಾರ್ಮಿಕರ ಅಗತ್ಯವಿದೆ",
    added: "ಸೇರಿಸಲಾಗಿದೆ",
    locNotSpecified: "ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಿಲ್ಲ",
    viewMatches: "ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಿ",
    open: "ಸಕ್ರಿಯ",
    failedToFetch: "ಕೆಲಸಗಳನ್ನು ತರಲು ವಿಫಲವಾಗಿದೆ"
  }
};

const translateDynamicContent = (text, lang) => {
  if (!text || lang !== 'kn') return text;
  const map = {
    'worker': 'ಕಾರ್ಮಿಕ',
    'harvesting': 'ಕೊಯ್ಲು',
    'dasarkoppal': 'ದಾಸರಕೊಪ್ಪಲು',
    'filled': 'ಭರ್ತಿಯಾಗಿದೆ',
    'closed': 'ಮುಚ್ಚಲಾಗಿದೆ'
  };
  const key = text.toString().toLowerCase().trim();
  return map[key] || text;
};

export default function JobsList() {
  const { token } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyJobs(token);
      setJobs(data);
    } catch (err) {
      setError(err.message || t.failedToFetch);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      try {
        const { deleteJob } = await import('../api/jobsApi');
        await deleteJob(jobId, token);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (err) {
        alert(err.message || 'Failed to delete job');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 lg:px-12 selection:bg-blue-100 selection:text-blue-900 mx-auto w-full overflow-x-hidden font-sans pb-32">
      <div className="mx-auto max-w-5xl">
        
        {/* PREMIUM HEADER SECTION */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12 pt-4">
          <div className="flex-1 animate-[fade-in-up_0.3s_ease-out]">
            <button
              onClick={() => navigate(-1)}
              className="flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-[13px] font-bold tracking-tight text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:text-slate-900 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </button>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 flex items-center gap-4">
              {t.myJobs} <Sparkles className="w-8 h-8 text-indigo-500" />
            </h1>
            <p className="mt-3 text-lg font-medium tracking-tight text-slate-500 max-w-xl">
              {t.manageJobs}
            </p>
          </div>
          
          <div className="flex items-center gap-4 animate-[fade-in-up_0.4s_ease-out]">
            {/* Minimal Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="hidden sm:flex items-center justify-center px-4 py-3 rounded-2xl text-[13px] font-bold border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors tracking-tight text-slate-700 h-[3.5rem]"
            >
              {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>

            <button
              onClick={() => navigate('/jobs/new')}
              className="flex items-center justify-center w-full sm:w-auto gap-2 rounded-[1.5rem] bg-slate-900 px-8 font-bold tracking-wide text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)] active:scale-95 h-[3.5rem]"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
              {t.createJob}
            </button>
          </div>
        </div>

        {/* STATE HANDLING */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] bg-red-50 p-10 text-center shadow-sm border border-red-100 flex flex-col items-center justify-center gap-6 animate-[fade-in-up_0.3s_ease-out]">
            <p className="font-bold text-red-600 text-lg tracking-tight">{error}</p>
            <button
              onClick={fetchJobs}
              className="rounded-full bg-white px-8 py-3 text-sm font-bold text-red-600 shadow-sm border border-red-200 hover:bg-red-50 transition-colors active:scale-95"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : jobs.length === 0 ? (
          /* EMPTY STATE - BENTO STYLE */
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white px-6 py-24 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 animate-[fade-in-up_0.4s_ease-out]">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-slate-50 shadow-inner border border-slate-100">
              <Briefcase className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-4">{t.noJobs}</h3>
            <p className="max-w-md text-slate-500 font-medium text-lg tracking-tight leading-relaxed">
              {t.noJobsDesc}
            </p>
            <button
              onClick={() => navigate('/jobs/new')}
              className="mt-10 flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              {t.postJobNow}
            </button>
          </div>
        ) : (
          /* JOBS BENTO GRID */
          <div className="grid gap-6">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}/analytics`)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="group cursor-pointer overflow-hidden rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-[fade-in-up_0.5s_ease-out_both]"
              >
                {/* Left Info Block */}
                <div className="flex-1 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h3 className="font-black text-2xl tracking-tight text-slate-900 capitalize leading-tight">
                      {translateDynamicContent(job.title, language)}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest w-fit
                        ${
                          job.status === 'open' || !job.status
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }
                      `}
                    >
                      {job.status === 'open' || !job.status ? t.open : translateDynamicContent(job.status, language)}
                    </span>
                  </div>

                  {/* Chips Container */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-semibold tracking-tight">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="capitalize">{translateDynamicContent(job.location?.village || job.location?.district, language) || t.locNotSpecified}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100/50 text-blue-700 font-bold tracking-tight">
                      <Users className="h-4 w-4 text-blue-400" />
                      {job.workersRequired} {t.workersNeeded}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-semibold tracking-tight">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {t.added} {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Action Block */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100">
                  <button
                    onClick={(e) => handleDelete(e, job._id)}
                    className="flex items-center justify-center rounded-[1rem] p-3 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-colors group/del"
                    title="Delete Job"
                  >
                    <Trash2 className="h-6 w-6 group-hover/del:scale-110 transition-transform" />
                  </button>
                  <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-[1rem] bg-indigo-50 text-indigo-600 font-bold tracking-tight text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {t.viewMatches}
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
