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
  Trash2
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    back: "Back",
    myJobs: "My Jobs",
    manageJobs: "Manage and track all your posted jobs in one place.",
    createJob: "Create New Job",
    deleteConfirm: "Are you sure you want to delete this job? This calculation cannot be undone.",
    tryAgain: "Try Again",
    noJobs: "No jobs posted yet",
    noJobsDesc: "You haven't posted any jobs. Create your first job to start matching with trusted workers in your area.",
    postJobNow: "Post a Job Now",
    workersNeeded: "Workers needed",
    added: "Added",
    locNotSpecified: "Location not specified",
    viewMatches: "View Matches",
    open: "open",
    failedToFetch: "Failed to fetch jobs"
  },
  kn: {
    back: "ಹಿಂದೆ",
    myJobs: "ನನ್ನ ಕೆಲಸಗಳು",
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
    viewMatches: "ಹೊಂದಾಣಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    open: "ತೆರೆದಿದೆ",
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
    <div className="min-h-screen bg-slate-50 p-4 pb-24 md:p-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.back}
              </button>
              
              <button
                onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
                className="relative flex items-center w-14 h-7 bg-white rounded-full p-1 cursor-pointer border border-gray-200 focus:outline-none shadow-sm sm:hidden"
                title="Toggle Language"
              >
                <div
                  className={`absolute left-1 h-5 w-6 bg-gray-100 rounded-full shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out ${
                    language === 'en' ? 'translate-x-0' : 'translate-x-6'
                  }`}
                ></div>
                <div className="relative w-full flex justify-between z-10 text-[10px] font-extrabold tracking-wider pointer-events-none pt-[1px]">
                  <span className={`w-6 text-center transition-colors duration-300 ${language === 'en' ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>EN</span>
                  <span className={`w-6 text-center transition-colors duration-300 ${language === 'kn' ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>ಕನ್</span>
                </div>
              </button>
            </div>
            
            <h1 className="text-3xl tracking-tight md:text-4xl font-extrabold text-[#1A6B3C]">
              {t.myJobs}
            </h1>
            <p className="mt-2 text-base text-gray-500 font-medium">
              {t.manageJobs}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mt-2 sm:mt-0">
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="relative hidden sm:flex items-center w-14 h-7 bg-white rounded-full p-1 cursor-pointer border border-gray-200 focus:outline-none shadow-sm"
              title="Toggle Language"
            >
              <div
                className={`absolute left-1 h-5 w-6 bg-gray-100 rounded-full shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out ${
                  language === 'en' ? 'translate-x-0' : 'translate-x-6'
                }`}
              ></div>
              <div className="relative w-full flex justify-between z-10 text-[10px] font-extrabold tracking-wider pointer-events-none pt-[1px]">
                <span className={`w-6 text-center transition-colors duration-300 ${language === 'en' ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>EN</span>
                <span className={`w-6 text-center transition-colors duration-300 ${language === 'kn' ? 'text-[#1A6B3C]' : 'text-gray-400'}`}>ಕನ್</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/jobs/new')}
              className="flex items-center justify-center w-full sm:w-auto gap-2 rounded-full bg-[#1A6B3C] px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgb(26,107,60,0.25)] transition-all hover:bg-[#124b29] hover:shadow-[0_12px_25px_rgb(26,107,60,0.35)] active:scale-95"
            >
              <Plus className="h-5 w-5" />
              {t.createJob}
            </button>
          </div>
        </div>

        {/* State Handling */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-[#1A6B3C]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-8 text-center shadow-sm ring-1 ring-red-100">
            <p className="font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchJobs}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-red-600 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 shadow-inner">
              <Briefcase className="h-10 w-10 text-[#1A6B3C]" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">{t.noJobs}</h3>
            <p className="mt-3 max-w-md text-gray-500 font-medium leading-relaxed">
              {t.noJobsDesc}
            </p>
            <button
              onClick={() => navigate('/jobs/new')}
              className="mt-8 flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              {t.postJobNow}
            </button>
          </div>
        ) : (
          /* Jobs List */
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}/analytics`)}
                className="group cursor-pointer overflow-hidden rounded-2xl bg-white p-5 md:p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] ring-1 ring-gray-100 transition-all hover:bg-gray-50 hover:shadow-md hover:ring-[#1A6B3C]/30"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1 capitalize">
                        {translateDynamicContent(job.title, language)}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider
                          ${
                            job.status === 'open' || !job.status
                              ? 'bg-green-100/80 text-green-700 ring-1 ring-green-600/20'
                              : 'bg-gray-100 text-gray-600 ring-1 ring-gray-400/20'
                          }
                        `}
                      >
                        {job.status === 'open' || !job.status ? t.open : translateDynamicContent(job.status, language)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm font-semibold text-gray-500">
                      <div className="flex items-center gap-1.5 opacity-90">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="capitalize">{translateDynamicContent(job.location?.village || job.location?.district, language) || t.locNotSpecified}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Users className="h-4 w-4 text-gray-400" />
                        {job.workersRequired} {t.workersNeeded}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {t.added} {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Link */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleDelete(e, job._id)}
                      className="flex items-center justify-center rounded-full p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center text-sm font-extrabold text-[#1A6B3C] group-hover:underline">
                      {t.viewMatches}
                      <ChevronRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
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
