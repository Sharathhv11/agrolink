import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppliedJobs } from '../api/jobsApi';

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
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total: 0, applied: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMyAppliedJobs(token);
        setItems(data.jobs || []);
        setSummary(data.summary || { total: 0, applied: 0, approved: 0 });
      } catch (e) {
        setError(e.message || 'Failed to load applied jobs');
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
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
        >
          Back
        </button>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A6B3C]">Applied Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">Track jobs you applied for and approved selections.</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">Applied</p>
            <p className="text-xl font-bold text-amber-700">{summary.applied}</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-xl font-bold text-green-700">{summary.approved}</p>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {loading ? <p className="mt-4 text-sm text-gray-500">Loading...</p> : null}

        <div className="mt-5">
          <h2 className="mb-2 text-sm font-bold text-gray-800">All Applied Jobs</h2>
          <div className="space-y-3">
            {!loading && !items.length ? (
              <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">No applied jobs yet.</p>
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
                  <p>Wage: INR {item.job?.wageAmount} ({item.job?.wageType})</p>
                  <p>Start: {item.job?.startDate ? new Date(item.job.startDate).toLocaleDateString() : '-'}</p>
                  <p>
                    Location:{' '}
                    {[item.job?.location?.village, item.job?.location?.district, item.job?.location?.state]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </p>
                  <p>Farmer: {item.farmer?.name || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-gray-800">Approved / Selected</h2>
          <div className="space-y-3">
            {!loading && !approvedJobs.length ? (
              <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm">No approved jobs yet.</p>
            ) : null}
            {approvedJobs.map((item) => (
              <div key={`approved-${item.applicationId}`} className="rounded-xl border border-green-100 bg-green-50/40 p-4">
                <p className="text-base font-bold text-green-800">{item.job?.title || 'Job'}</p>
                <p className="mt-1 text-xs text-green-700">
                  Farmer contact: {item.farmer?.phone || '-'} | Start:{' '}
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
