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

export function downloadJobAnalyticsPdf(jobId, token, section) {
  const slug =
    section === 'matched' ? 'matched'
      : section === 'applied' ? 'applied'
        : 'approved';

  return apiRequest(`/jobs/${jobId}/analytics/${slug}.pdf`, {
    method: 'GET',
    token,
    isBlob: true,
    timeoutMs: 60000,
  });
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

export function getJobApplications(jobId, token) {
  return apiRequest(`/jobs/${jobId}/applications`, { method: 'GET', token });
}

export function acceptJobApplication(jobId, workerId, token) {
  return apiRequest(`/jobs/${jobId}/applications/${workerId}/accept`, { method: 'POST', token });
}

export function getMyAppliedJobs(token) {
  return apiRequest('/jobs/my-applied-jobs', { method: 'GET', token });
}
