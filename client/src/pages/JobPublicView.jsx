import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyJob } from '../api/jobsApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function JobPublicView() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      // Remember where to return after login (labour applies from WhatsApp link)
      try {
        localStorage.setItem('agrolink_next_url', `/jobs/view/${jobId}`);
      } catch {
        // ignore
      }
      navigate('/', { replace: true });
    }
  }, [authLoading, token, jobId, navigate]);

  useEffect(() => {
    if (authLoading || !token) return;

    const load = async () => {
      try {
        setError('');
        const response = await fetch(`${API_URL}/jobs/public/${jobId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load job');
        setJob(data);
      } catch (err) {
        setError(err.message || 'Unable to load job');
      }
    };
    load();
  }, [authLoading, token, jobId]);

  const locationText = useMemo(() => {
    if (!job?.location) return '';
    return [
      job.location.addressLine,
      job.location.village,
      job.location.district,
      job.location.state,
    ]
      .filter(Boolean)
      .join(', ');
  }, [job]);

  const onApply = async () => {
    if (!token) return;
    setApplying(true);
    setError('');
    try {
      await applyJob(jobId, token);
      setApplied(true);
    } catch (err) {
      setError(err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-4 shadow-sm">
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        {authLoading ? <p className="text-sm text-gray-600">Loading...</p> : null}
        {!job && token ? <p className="text-sm text-gray-600">Loading job...</p> : null}
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

            <button
              onClick={onApply}
              disabled={applying || applied}
              className="mt-5 w-full rounded-xl bg-[#1A6B3C] px-4 py-3 font-bold text-white disabled:opacity-50"
            >
              {applied ? 'Applied' : applying ? 'Applying...' : 'Apply'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
