import { getHassConfig } from './hassConfig';

export async function hassApiFetch(path: string, options: RequestInit = {}) {
  const { url, token } = getHassConfig();
  
  // In development mode, use relative paths for proxy
  // In production mode, use full URL
  const isDevelopment = process.env.NODE_ENV === 'development';
  const fullUrl = isDevelopment ? path : `${url}${path}`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  console.log('Making API call to:', fullUrl);
  
  return fetch(fullUrl, { ...options, headers });
} 