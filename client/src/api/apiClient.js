const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let onUnauthorized = () => {};

/**
 * Called from AuthProvider with a handler that clears session and navigates to login (/).
 */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : () => {};
}

/**
 * Shared API fetch for authenticated routes.
 * - 401 → redirect to login
 * - 404 on /users/me (session/user missing) → redirect to login
 */
export async function apiRequest(path, { method = 'GET', token, body, isBlob = false, timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body != null && !isBlob ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
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

  if (response.status === 401) {
    onUnauthorized();
  }

  if (response.status === 404 && token) {
    const isUserMe = path === '/users/me' || path.endsWith('/users/me');
    if (isUserMe) {
      onUnauthorized();
    }
  }

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (_err) {
      // ignore
    }
    throw new Error(message);
  }

  if (isBlob) {
    return response.blob();
  }

  return response.json();
}
