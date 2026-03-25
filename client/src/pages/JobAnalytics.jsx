import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobAnalytics, getJobMatches, getJobApplications, acceptJobApplication } from '../api/jobsApi';

function MiniLineChart({ points }) {
  if (!points.length) return <div className="text-sm text-gray-500">No view data yet.</div>;
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
  const { token } = useAuth();
  
  const [data, setData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [applied, setApplied] = useState([]);
  const [selected, setSelected] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('matched');
  const [acceptingId, setAcceptingId] = useState(null);

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
      setError(err.message || 'Failed to load analytics');
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
      alert(err.message || 'Failed to accept worker');
    } finally {
      setAcceptingId(null);
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
        <h1 className="text-xl font-bold text-[#1A6B3C]">Job Analytics</h1>
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Views</p>
            <p className="text-xl font-bold">{data?.cards?.totalViews ?? 0}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Interested</p>
            <p className="text-xl font-bold">{data?.cards?.interestedWorkers ?? 0}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Applications</p>
            <p className="text-xl font-bold">{data?.cards?.applications ?? 0}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold">Interested vs Not Interested</p>
          <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-[#1A6B3C]" style={{ width: `${interestedPercent}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{interestedPercent}% interested workers</p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <p className="text-sm font-semibold">Views Over Time</p>
          <MiniLineChart points={data?.line || []} />
        </div>

        <div className="mt-6 rounded-xl bg-white p-3 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <h2 className="font-bold text-gray-800">Worker Management</h2>
            {jobInfo && (
              <p className="text-sm font-semibold text-[#1A6B3C]">
                Employed: {jobInfo.selectedCount}/{jobInfo.workersRequired}
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
              Matched ({workers.length})
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === 'applied'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Applied ({applied.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                activeTab === 'approved'
                  ? 'bg-white text-[#1A6B3C] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Approved ({selected.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'matched' && (
              <>
                {!workers.length ? (
                  <p className="text-sm text-gray-500">No matched workers found.</p>
                ) : (
                  workers.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-100 p-3 shadow-sm">
                      <p className="text-base font-semibold text-gray-800">{item.worker?.name || 'Worker'}</p>
                      <p className="text-sm text-gray-600">Phone: {item.worker?.phone || '-'}</p>
                      <p className="text-sm text-gray-600">
                        Address:{' '}
                        {[
                          item.worker?.location?.village,
                          item.worker?.location?.taluk,
                          item.worker?.location?.district,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Unavailable'}
                      </p>
                      <p className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>Distance: {item.distanceKm} km</span>
                        <span className="font-semibold">{item.matchStatus || 'Matched'}</span>
                      </p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'applied' && (
              <>
                {!applied.length ? (
                  <p className="text-sm text-gray-500">No applications yet.</p>
                ) : (
                  applied.map((app) => {
                    const worker = app.worker;
                    const workerId = worker?._id;
                    const canAccept =
                      jobInfo?.status === 'open' &&
                      Number(jobInfo?.selectedCount || 0) < Number(jobInfo?.workersRequired || 0);

                    return (
                      <div key={app.applicationId} className="rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-base font-semibold text-gray-800">{worker?.name || 'Worker'}</p>
                        <p className="text-sm text-gray-600">Phone: {worker?.phone || '-'}</p>
                        <p className="text-xs text-gray-500">
                          Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '-'}
                        </p>
                        <button
                          onClick={() => onAccept(workerId)}
                          disabled={!canAccept || acceptingId === workerId}
                          className="mt-2 w-full rounded-lg bg-[#1A6B3C] px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                        >
                          {acceptingId === workerId ? 'Accepting...' : 'Accept Worker'}
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
                  <p className="text-sm text-gray-500">No approved workers yet.</p>
                ) : (
                  selected.map((app) => {
                    const worker = app.worker;
                    return (
                      <div key={app.applicationId} className="rounded-xl border border-gray-100 p-3 shadow-sm bg-green-50/50">
                        <p className="text-base font-semibold text-gray-800">{worker?.name || 'Worker'}</p>
                        <p className="text-sm text-gray-600">Phone: {worker?.phone || '-'}</p>
                        <p className="text-xs text-green-700 font-medium">
                          Approved: {app.selectedAt ? new Date(app.selectedAt).toLocaleString() : '-'}
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
