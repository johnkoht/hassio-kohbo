import { getHassConfig } from './hassConfig';

export async function hassApiFetch(path: string, options: RequestInit = {}) {
  const { url, token } = getHassConfig();
  
  // Always use the full Home Assistant URL for all API calls
  const fullUrl = `${url}${path}`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  console.log('Making API call to:', fullUrl);
  
  return fetch(fullUrl, { ...options, headers });
} 