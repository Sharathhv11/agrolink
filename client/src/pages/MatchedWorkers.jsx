import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  acceptJobApplication,
  downloadWorkerPdf,
  getJobApplications,
  getJobMatches,
} from '../api/jobsApi';

export default function MatchedWorkers() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [applied, setApplied] = useState([]);
  const [selected, setSelected] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [matches, apps] = await Promise.all([
          getJobMatches(jobId, token),
          getJobApplications(jobId, token),
        ]);
        setWorkers(matches);
        setApplied(apps.applied || []);
        setSelected(apps.selected || []);
        setJobInfo(apps.job || null);
      } catch (err) {
        setError(err.message || 'Failed to fetch workers');
      }
    };
    load();
  }, [jobId, token]);

  const refreshApplications = async () => {
    try {
      const apps = await getJobApplications(jobId, token);
      setApplied(apps.applied || []);
      setSelected(apps.selected || []);
      setJobInfo(apps.job || null);
    } catch (err) {
      setError(err.message || 'Failed to refresh applications');
    }
  };

  const onAccept = async (workerId) => {
    if (!token) return;
    setAcceptingId(workerId);
    setError('');
    try {
      await acceptJobApplication(jobId, workerId, token);
      await refreshApplications();
    } catch (err) {
      setError(err.message || 'Failed to accept worker');
    } finally {
      setAcceptingId(null);
    }
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await downloadWorkerPdf(jobId, token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `job-${jobId}-workers.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'PDF download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-3">
      <div className="mx-auto max-w-xl space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1A6B3C]">Farmer Dashboard</h1>
          <button
            onClick={downloadPdf}
            className="rounded-full bg-[#1A6B3C] px-3 py-2 text-xs font-bold text-white"
            disabled={downloading}
          >
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>

        {jobInfo ? (
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Workers needed</p>
              <p className="text-sm font-bold text-[#1A6B3C]">
                {jobInfo.selectedCount}/{jobInfo.workersRequired}
              </p>
            </div>
            {jobInfo.status !== 'open' ? (
              <p className="mt-2 text-xs text-gray-500">
                Job status: <span className="font-semibold">{jobInfo.status}</span>
                {jobInfo.closeReason ? ` - ${jobInfo.closeReason}` : ''}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Select workers until the requirement is fulfilled.</p>
            )}
          </div>
        ) : null}

        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {/* 1) Matched workers */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-800">1) Matched Workers</h2>
          {workers.length ? (
            workers.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-base font-semibold">{item.worker?.name || 'Worker'}</p>
                <p className="text-sm text-gray-700">Phone: {item.worker?.phone || '-'}</p>
                <p className="text-sm text-gray-700">
                  Address:{' '}
                  {[
                    item.worker?.location?.addressLine,
                    item.worker?.location?.village,
                    item.worker?.location?.taluk,
                    item.worker?.location?.district,
                    item.worker?.location?.state,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Distance: {item.distanceKm} km | Status: {item.matchStatus}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No matched workers found.</p>
          )}
        </div>

        {/* 2) Applied workers + accept */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-800">2) Applied Workers</h2>
          {applied.length ? (
            applied.map((app) => {
              const worker = app.worker;
              const workerId = worker?._id;
              const canAccept =
                jobInfo?.status === 'open' &&
                Number(jobInfo?.selectedCount || 0) < Number(jobInfo?.workersRequired || 0);

              return (
                <div key={app.applicationId} className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-base font-semibold">{worker?.name || 'Worker'}</p>
                  <p className="text-sm text-gray-700">Phone: {worker?.phone || '-'}</p>
                  <p className="text-xs text-gray-500">
                    Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '-'}
                  </p>
                  <button
                    onClick={() => onAccept(workerId)}
                    disabled={!canAccept || acceptingId === workerId}
                    className="mt-2 w-full rounded-lg bg-[#1A6B3C] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {acceptingId === workerId ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No applications yet.</p>
          )}
        </div>

        {/* 3) Selected workers */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-800">3) Selected For Work</h2>
          {selected.length ? (
            selected.map((app) => {
              const worker = app.worker;
              return (
                <div key={app.applicationId} className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-base font-semibold">{worker?.name || 'Worker'}</p>
                  <p className="text-sm text-gray-700">Phone: {worker?.phone || '-'}</p>
                  <p className="text-xs text-gray-500">
                    Status: {app.applicationStatus} | Selected: {app.selectedAt ? new Date(app.selectedAt).toLocaleString() : '-'}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No selected workers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
