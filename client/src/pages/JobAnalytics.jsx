import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import {
  getJobAnalytics,
  getJobMatches,
  getJobApplications,
  acceptJobApplication,
  downloadJobAnalyticsPdf,
} from '../api/jobsApi';

const TRANSLATIONS = {
  en: {
    back: "Back",
    noViewData: "No view data yet.",
    jobAnalytics: "Job Analytics",
    failedToLoad: "Failed to load analytics",
    views: "Views",
    interested: "Interested",
    applications: "Applications",
    interestedVsNot: "Interested vs Not Interested",
    interestedWorkers: "interested workers",
    viewsOverTime: "Views Over Time",
    workerManagement: "Worker Management",
    employed: "Employed",
    matched: "Matched",
    applied: "Applied",
    approved: "Approved",
    noMatchedFound: "No matched workers found.",
    noApplications: "No applications yet.",
    noApprovedFound: "No approved workers yet.",
    phone: "Phone: ",
    address: "Address: ",
    distance: "Distance: ",
    km: " km",
    unavailable: "Unavailable",
    worker: "Worker",
    appliedOn: "Applied: ",
    accepting: "Accepting...",
    acceptWorker: "Accept Worker",
    approvedOn: "Approved: ",
    failedToAccept: "Failed to accept worker",
    matchStatus: "Matched",
    downloadMatchedPdf: "Download Matched PDF",
    downloadAppliedPdf: "Download Applied PDF",
    downloadApprovedPdf: "Download Approved PDF",
  },
  kn: {
    back: "ಹಿಂದೆ",
    noViewData: "ಯಾವುದೇ ವೀಕ್ಷಣೆಯ ಡೇಟಾ ಇಲ್ಲ.",
    jobAnalytics: "ಕೆಲಸದ ವಿಶ್ಲೇಷಣೆ",
    failedToLoad: "ವಿಶ್ಲೇಷಣೆ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ",
    views: "ವೀಕ್ಷಣೆಗಳು",
    interested: "ಆಸಕ್ತರು",
    applications: "ಅರ್ಜಿಗಳು",
    interestedVsNot: "ಆಸಕ್ತರು ಮತ್ತು ಆಸಕ್ತಿ ಇಲ್ಲದವರು",
    interestedWorkers: "ಆಸಕ್ತ ಕಾರ್ಮಿಕರು",
    viewsOverTime: "ಸಮಯದ ಮೇಲೆ ವೀಕ್ಷಣೆಗಳು",
    workerManagement: "ಕಾರ್ಮಿಕರ ನಿರ್ವಹಣೆ",
    employed: "ಉದ್ಯೋಗಿ",
    matched: "ಹೊಂದಿಕೆಯಾದ",
    applied: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ",
    approved: "ಅನುಮೋದಿಸಿದ",
    noMatchedFound: "ಯಾವುದೇ ಹೊಂದಿಕೆಯಾದ ಕಾರ್ಮಿಕರು ಕಂಡುಬಂದಿಲ್ಲ.",
    noApplications: "ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿಗಳಿಲ್ಲ.",
    noApprovedFound: "ಇನ್ನೂ ಯಾವುದೇ ಅನುಮೋದಿತ ಕಾರ್ಮಿಕರಿಲ್ಲ.",
    phone: "ಫೋನ್: ",
    address: "ವಿಳಾಸ: ",
    distance: "ದೂರ: ",
    km: " ಕಿಮೀ",
    unavailable: "ಲಭ್ಯವಿಲ್ಲ",
    worker: "ಕಾರ್ಮಿಕ",
    appliedOn: "ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗಿದೆ: ",
    accepting: "ಅನುಮೋದಿಸಲಾಗುತ್ತಿದೆ...",
    acceptWorker: "ಕಾರ್ಮಿಕನನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಿ",
    approvedOn: "ಅನುಮೋದಿಸಲಾಗಿದೆ: ",
    failedToAccept: "ಕಾರ್ಮಿಕನನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಲು ವಿಫಲವಾಗಿದೆ",
    matchStatus: "ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ",
    downloadMatchedPdf: "ಹೊಂದಿಕೆಯಾದ PDF ಡೌನ್‌ಲೋಡ್",
    downloadAppliedPdf: "ಅರ್ಜಿಯಾದ PDF ಡೌನ್‌ಲೋಡ್",
    downloadApprovedPdf: "ಅನುಮೋದಿತ PDF ಡೌನ್‌ಲೋಡ್",
  }
};

function MiniLineChart({ points, t }) {
  if (!points.length) return <div className="text-sm text-gray-500">{t.noViewData}</div>;
  const max = Math.max(...points.map((p) => p.views), 1);
  const width = 280;
  const height = 90;
  const path = points
    .map((p, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (p.views / max) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full">
      <polyline fill="none" stroke="#1A6B3C" strokeWidth="3" points={path} />
    </svg>
  );
}

export default function JobAnalytics() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  
  const [data, setData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [applied, setApplied] = useState([]);
  const [selected, setSelected] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('matched');
  const [acceptingId, setAcceptingId] = useState(null);
  const [downloadingPdfFor, setDownloadingPdfFor] = useState(null);

  const fetchData = async () => {
    try {
      const [result, matches, apps] = await Promise.all([
        getJobAnalytics(jobId, token),
        getJobMatches(jobId, token),
        getJobApplications(jobId, token),
      ]);
      setData(result);
      setWorkers(matches);
      setApplied(apps.applied || []);
      setSelected(apps.selected || []);
      setJobInfo(apps.job || null);
    } catch (err) {
      setError(err.message || t.failedToLoad);
    }
  };

  useEffect(() => {
    let timer = null;
    fetchData();
    timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, token]);

  const refreshApplications = async () => {
    try {
      const apps = await getJobApplications(jobId, token);
      setApplied(apps.applied || []);
      setSelected(apps.selected || []);
      setJobInfo(apps.job || null);
    } catch (err) {
      console.error(err);
    }
  };

  const onAccept = async (workerId) => {
    if (!token) return;
    setAcceptingId(workerId);
    try {
      await acceptJobApplication(jobId, workerId, token);
      await refreshApplications();
    } catch (err) {
      alert(err.message || t.failedToAccept);
    } finally {
      setAcceptingId(null);
    }
  };

  const downloadPdf = async (section) => {
    if (!token) return;
    setDownloadingPdfFor(section);
    setError('');
    try {
      const blob = await downloadJobAnalyticsPdf(jobId, token, section);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `job-${jobId}-${section}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'PDF download failed');
    } finally {
      setDownloadingPdfFor(null);
    }
  };

  const interestedPercent = useMemo(() => {
    const interested = data?.pie?.interested || 0;
    const notInterested = data?.pie?.notInterested || 0;
    const total = interested + notInterested;
    return total ? Math.round((interested / total) * 100) : 0;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-3 pb-24">
      <div className="mx-auto max-w-xl space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full bg-white p-2 text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
            title={t.back}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold text-[#1A6B3C]">{t.jobAnalytics}</h1>
        </div>
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">{t.views}</p>
            <p className="text-xl font-bold">{data?.cards?.totalViews ?? 0}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">{t.interested}</p>
            <p className="text-xl font-bold">{data?.cards?.interestedWorkers ?? 0}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">{t.applications}</p>
            <p className="text-xl font-bold">{data?.cards?.applications ?? 0}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold">{t.interestedVsNot}</p>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-[#1A6B3C]" style={{ width: `${interestedPercent}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{interestedPercent}% {t.interestedWorkers}</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold">{t.viewsOverTime}</p>
          <MiniLineChart points={data?.line || []} t={t} />
        </div>

        <div className="mt-6 rounded-xl bg-white p-3 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-gray-800">{t.workerManagement}</h2>
            {jobInfo && (
              <p className="text-sm font-semibold text-[#1A6B3C]">
                {t.employed}: {jobInfo.selectedCount}/{jobInfo.workersRequired}
              </p>
            )}
          </div>

          <div className="mb-4 flex gap-2 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('matched')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === 'matched'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.matched} ({workers.length})
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === 'applied'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.applied} ({applied.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === 'approved'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.approved} ({selected.length})
            </button>
          </div>

          {/* PDF download buttons for each section */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => downloadPdf('matched')}
              className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition-colors ${
                activeTab === 'matched'
                  ? 'border-[#1A6B3C] bg-[#E8F5EE] text-[#1A6B3C]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={downloadingPdfFor != null}
            >
              {downloadingPdfFor === 'matched' ? 'Preparing...' : t.downloadMatchedPdf}
            </button>
            <button
              onClick={() => downloadPdf('applied')}
              className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition-colors ${
                activeTab === 'applied'
                  ? 'border-[#1A6B3C] bg-[#E8F5EE] text-[#1A6B3C]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={downloadingPdfFor != null}
            >
              {downloadingPdfFor === 'applied' ? 'Preparing...' : t.downloadAppliedPdf}
            </button>
            <button
              onClick={() => downloadPdf('approved')}
              className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition-colors ${
                activeTab === 'approved'
                  ? 'border-[#1A6B3C] bg-[#E8F5EE] text-[#1A6B3C]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              disabled={downloadingPdfFor != null}
            >
              {downloadingPdfFor === 'approved' ? 'Preparing...' : t.downloadApprovedPdf}
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'matched' && (
              <>
                {!workers.length ? (
                  <p className="text-sm text-gray-500">{t.noMatchedFound}</p>
                ) : (
                  workers.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-100 p-3 shadow-sm">
                      <p className="text-base font-semibold text-gray-800">{item.worker?.name || t.worker}</p>
                      <p className="text-sm text-gray-600">{t.phone}{item.worker?.phone || '-'}</p>
                      <p className="text-sm text-gray-600">
                        {t.address}
                        {[
                          item.worker?.location?.village,
                          item.worker?.location?.taluk,
                          item.worker?.location?.district,
                        ]
                          .filter(Boolean)
                          .join(', ') || t.unavailable}
                      </p>
                      <p className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{t.distance}{item.distanceKm}{t.km}</span>
                        <span className="font-semibold">{item.matchStatus || t.matchStatus}</span>
                      </p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'applied' && (
              <>
                {!applied.length ? (
                  <p className="text-sm text-gray-500">{t.noApplications}</p>
                ) : (
                  applied.map((app) => {
                    const worker = app.worker;
                    const workerId = worker?._id;
                    const canAccept =
                      jobInfo?.status === 'open' &&
                      Number(jobInfo?.selectedCount || 0) < Number(jobInfo?.workersRequired || 0);

                    return (
                      <div key={app.applicationId} className="rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-base font-semibold text-gray-800">{worker?.name || t.worker}</p>
                        <p className="text-sm text-gray-600">{t.phone}{worker?.phone || '-'}</p>
                        <p className="text-xs text-gray-500">
                          {t.appliedOn}{app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '-'}
                        </p>
                        <button
                          onClick={() => onAccept(workerId)}
                          disabled={!canAccept || acceptingId === workerId}
                          className="mt-2 w-full rounded-lg bg-[#1A6B3C] px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                        >
                          {acceptingId === workerId ? t.accepting : t.acceptWorker}
                        </button>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <>
                {!selected.length ? (
                  <p className="text-sm text-gray-500">{t.noApprovedFound}</p>
                ) : (
                  selected.map((app) => {
                    const worker = app.worker;
                    return (
                      <div key={app.applicationId} className="rounded-xl border border-gray-100 p-3 shadow-sm bg-green-50/50">
                        <p className="text-base font-semibold text-gray-800">{worker?.name || t.worker}</p>
                        <p className="text-sm text-gray-600">{t.phone}{worker?.phone || '-'}</p>
                        <p className="text-xs text-green-700 font-medium">
                          {t.approvedOn}{app.selectedAt ? new Date(app.selectedAt).toLocaleString() : '-'}
                        </p>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
