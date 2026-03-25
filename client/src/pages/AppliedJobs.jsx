import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMyAppliedJobs } from '../api/jobsApi';

const TRANSLATIONS = {
  en: {
    back: "Back",
    title: "Applied Jobs",
    subtitle: "Track jobs you applied for and approved selections.",
    total: "Total",
    applied: "Applied",
    approved: "Approved",
    failedToLoad: "Failed to load applied jobs",
    loading: "Loading...",
    allApplied: "All Applied Jobs",
    noApplied: "No applied jobs yet.",
    wage: "Wage:",
    start: "Start:",
    location: "Location:",
    farmer: "Farmer:",
    approvedSelected: "Approved / Selected",
    noApproved: "No approved jobs yet.",
    farmerContact: "Farmer contact:"
  },
  kn: {
    back: "ಹಿಂದೆ",
    title: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಕೆಲಸಗಳು",
    subtitle: "ನೀವು ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಮತ್ತು ಅನುಮೋದಿಸಿದ ಕೆಲಸಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    total: "ಒಟ್ಟು",
    applied: "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
    failedToLoad: "ಕೆಲಸಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    allApplied: "ಎಲ್ಲಾ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಕೆಲಸಗಳು",
    noApplied: "ಯಾವುದೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿಲ್ಲ.",
    wage: "ಕೂಲಿ:",
    start: "ಪ್ರಾರಂಭ:",
    location: "ಸ್ಥಳ:",
    farmer: "ರೈತ:",
    approvedSelected: "ಅನುಮೋದಿಸಲಾಗಿದೆ / ಆಯ್ಕೆಯಾಗಿದೆ",
    noApproved: "ಯಾವುದೇ ಅನುಮೋದಿತ ಕೆಲಸಗಳಿಲ್ಲ.",
    farmerContact: "ರೈತರ ಸಂಪರ್ಕ:"
  }
};

function statusBadge(status) {
  if (status === 'shortlisted' || status === 'hired') {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (status === 'rejected') {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

export default function AppliedJobs() {
  const { token } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, applied: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMyAppliedJobs(token);
        setItems(data.jobs || []);
        setSummary(data.summary || { total: 0, applied: 0, approved: 0 });
      } catch (e) {
        setError(e.message || t.failedToLoad);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const approvedJobs = useMemo(
    () => items.filter((i) => ['shortlisted', 'hired'].includes(i.applicationStatus)),
    [items]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 md:p-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
          >
            {t.back}
          </button>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="relative flex items-center w-14 h-7 bg-white rounded-full p-1 cursor-pointer border border-gray-200 focus:outline-none shadow-sm"
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

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A6B3C]">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t.total}</p>
            <p className="text-xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t.applied}</p>
            <p className="text-xl font-bold text-amber-700">{summary.applied}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">{t.approved}</p>
            <p className="text-xl font-bold text-green-700">{summary.approved}</p>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <p className="mt-4 text-sm text-gray-500">{t.loading}</p> : null}

        <div className="mt-5">
          <h2 className="mb-2 text-sm font-bold text-gray-800">{t.allApplied}</h2>
          <div className="space-y-3">
            {!loading && !items.length ? (
              <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">{t.noApplied}</p>
            ) : null}
            {items.map((item) => (
              <div key={item.applicationId} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-bold text-gray-900">{item.job?.title || 'Job'}</p>
                    <p className="text-xs text-gray-500">{item.job?.category || '-'} </p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusBadge(item.applicationStatus)}`}>
                    {item.applicationStatus}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <p>{t.wage} INR {item.job?.wageAmount} ({item.job?.wageType})</p>
                  <p>{t.start} {item.job?.startDate ? new Date(item.job.startDate).toLocaleDateString() : '-'}</p>
                  <p>
                    {t.location}{' '}
                    {[item.job?.location?.village, item.job?.location?.district, item.job?.location?.state]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                  <p>{t.farmer} {item.farmer?.name || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-gray-800">{t.approvedSelected}</h2>
          <div className="space-y-3">
            {!loading && !approvedJobs.length ? (
              <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">{t.noApproved}</p>
            ) : null}
            {approvedJobs.map((item) => (
              <div key={`approved-${item.applicationId}`} className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                <p className="text-base font-bold text-green-800">{item.job?.title || 'Job'}</p>
                <p className="mt-1 text-xs text-green-700">
                  {t.farmerContact} {item.farmer?.phone || '-'} | {t.start}{' '}
                  {item.job?.startDate ? new Date(item.job.startDate).toLocaleDateString() : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
