import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobAnalytics, getJobMatches } from '../api/jobsApi';

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
  const [error, setError] = useState('');

  useEffect(() => {
    let timer = null;
    const fetchData = async () => {
      try {
        const [result, matches] = await Promise.all([
          getJobAnalytics(jobId, token),
          getJobMatches(jobId, token),
        ]);
        setData(result);
        setWorkers(matches);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      }
    };

    fetchData();
    timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, [jobId, token]);

  const interestedPercent = useMemo(() => {
    const interested = data?.pie?.interested || 0;
    const notInterested = data?.pie?.notInterested || 0;
    const total = interested + notInterested;
    return total ? Math.round((interested / total) * 100) : 0;
  }, [data]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-3">
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

        <Link
          to={`/jobs/${jobId}/workers`}
          className="block rounded-lg bg-[#1A6B3C] px-4 py-3 text-center font-bold text-white"
        >
          View Matched Workers
        </Link>

        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Available Workers</p>
            <span className="text-xs text-gray-500">{workers.length}</span>
          </div>
          {!workers.length ? (
            <p className="text-sm text-gray-500">No available workers found yet.</p>
          ) : (
            <div className="space-y-2">
              {workers.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-100 p-2">
                  <p className="text-sm font-semibold text-gray-800">{item.worker?.name || 'Worker'}</p>
                  <p className="text-xs text-gray-600">{item.worker?.phone || '-'}</p>
                  <p className="text-xs text-gray-500">
                    {[
                      item.worker?.location?.village,
                      item.worker?.location?.taluk,
                      item.worker?.location?.district,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Address unavailable'}
                  </p>
                  <p className="text-xs text-gray-500">Distance: {item.distanceKm} km</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
