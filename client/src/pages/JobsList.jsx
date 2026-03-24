import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function JobsList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getMyJobs(token);
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job? This calculation cannot be undone.')) {
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-3xl tracking-tight md:text-4xl font-extrabold text-[#1A6B3C]">
              My Jobs
            </h1>
            <p className="mt-2 text-base text-gray-500 font-medium">
              Manage and track all your posted jobs in one place.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/jobs/new')}
            className="flex items-center justify-center gap-2 rounded-full bg-[#1A6B3C] px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgb(26,107,60,0.25)] transition-all hover:bg-[#124b29] hover:shadow-[0_12px_25px_rgb(26,107,60,0.35)] active:scale-95 sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Create New Job
          </button>
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
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-20 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 shadow-inner">
              <Briefcase className="h-10 w-10 text-[#1A6B3C]" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">No jobs posted yet</h3>
            <p className="mt-3 max-w-md text-gray-500 font-medium leading-relaxed">
              You haven't posted any jobs. Create your first job to start matching with trusted workers in your area.
            </p>
            <button
              onClick={() => navigate('/jobs/new')}
              className="mt-8 flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Post a Job Now
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
                      <h3 className="font-bold text-xl text-gray-900 line-clamp-1">
                        {job.title}
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
                        {job.status || 'open'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm font-semibold text-gray-500">
                      <div className="flex items-center gap-1.5 opacity-90">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {job.location?.village || job.location?.district || 'Location not specified'}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Users className="h-4 w-4 text-gray-400" />
                        {job.workersRequired} Workers needed
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Added {new Date(job.createdAt).toLocaleDateString()}
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
                      View Matches
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
