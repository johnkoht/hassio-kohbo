import { getHassConfig } from './hassConfig';

export async function hassApiFetch(path: string, options: RequestInit = {}) {
  const { url, token } = getHassConfig();
  // If path starts with /api, use as-is (proxy will handle it in dev)
  // Otherwise, prepend the full URL (for production)
  const isRelativeApi = path.startsWith('/api/');
  const fullUrl = isRelativeApi ? path : `${url}${path}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  return fetch(fullUrl, { ...options, headers });
} 