import { apiRequest } from './apiClient';

export function createJob(payload, token) {
  return apiRequest('/jobs', { method: 'POST', token, body: payload });
}

export function getJobAnalytics(jobId, token) {
  return apiRequest(`/jobs/${jobId}/analytics`, { method: 'GET', token });
}

export function getJobMatches(jobId, token) {
  return apiRequest(`/jobs/${jobId}/matches`, { method: 'GET', token });
}

export function downloadWorkerPdf(jobId, token) {
  return apiRequest(`/jobs/${jobId}/workers.pdf`, { method: 'GET', token, isBlob: true });
}

export function getMyJobs(token) {
  return apiRequest('/jobs/my-jobs', { method: 'GET', token });
}

export function deleteJob(jobId, token) {
  return apiRequest(`/jobs/${jobId}`, { method: 'DELETE', token });
}

export function applyJob(jobId, token) {
  return apiRequest(`/jobs/${jobId}/apply`, { method: 'POST', token });
}
