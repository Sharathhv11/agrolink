import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadWorkerPdf, getJobMatches } from '../api/jobsApi';

export default function MatchedWorkers() {
  const { jobId } = useParams();
  const { token } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const matches = await getJobMatches(jobId, token);
        setWorkers(matches);
      } catch (err) {
        setError(err.message || 'Failed to fetch workers');
      }
    };
    load();
  }, [jobId, token]);

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
          <h1 className="text-xl font-bold text-[#1A6B3C]">Matched Workers</h1>
          <button
            onClick={downloadPdf}
            className="rounded-full bg-[#1A6B3C] px-3 py-2 text-xs font-bold text-white"
            disabled={downloading}
          >
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>
        {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {workers.map((item) => (
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
        ))}
      </div>
    </div>
  );
}
