import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function JobPublicView() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/jobs/public/${jobId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load job');
        setJob(data);
      } catch (err) {
        setError(err.message || 'Unable to load job');
      }
    };
    load();
  }, [jobId]);

  const locationText =
    job?.location &&
    [job.location.addressLine, job.location.village, job.location.district, job.location.state]
      .filter(Boolean)
      .join(', ');

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-sm">
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        {!job ? <p className="text-sm text-gray-600">Loading job...</p> : null}
        {job ? (
          <>
            <h1 className="text-xl font-bold text-[#1A6B3C]">{job.title}</h1>
            <p className="mt-2 text-sm text-gray-700">{job.description}</p>
            <p className="mt-3 text-sm">Category: {job.category}</p>
            <p className="text-sm">Wage: INR {job.wageAmount} ({job.wageType})</p>
            {locationText ? <p className="text-sm">Location: {locationText}</p> : null}
            {job.startDate ? (
              <p className="text-sm">Starts: {new Date(job.startDate).toLocaleDateString()}</p>
            ) : null}
            <p className="text-sm">Contact: {job.contactPreference}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
