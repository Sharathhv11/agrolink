const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, method = 'GET', token, body, isBlob = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body && !isBlob ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_err) {
      // Ignore parse issues.
    }
    throw new Error(message);
  }

  if (isBlob) {
    return response.blob();
  }

  return response.json();
}

export function createJob(payload, token) {
  return request('/jobs', 'POST', token, payload);
}

export function getJobAnalytics(jobId, token) {
  return request(`/jobs/${jobId}/analytics`, 'GET', token);
}

export function getJobMatches(jobId, token) {
  return request(`/jobs/${jobId}/matches`, 'GET', token);
}

export function downloadWorkerPdf(jobId, token) {
  return request(`/jobs/${jobId}/workers.pdf`, 'GET', token, undefined, true);
}

export function getMyJobs(token) {
  return request('/jobs/my-jobs', 'GET', token);
}

export function deleteJob(jobId, token) {
  return request(`/jobs/${jobId}`, 'DELETE', token);
}
