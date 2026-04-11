/**
 * Browser client for same-origin /api routes. Uses Bearer token from localStorage.
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new ApiError(body.error || res.statusText || 'Request failed', res.status);
  }

  return body.data;
}

export async function apiPublic(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new ApiError(body.error || res.statusText || 'Request failed', res.status);
  }
  return body.data;
}
