import { getHassConfig } from '../api/hassConfig';

/**
 * Converts a relative URL to a full URL using the Home Assistant base URL
 * @param relativePath - The relative path from Home Assistant (e.g., '/api/media_player_proxy/...')
 * @returns The full URL, or undefined if no path provided
 */
export function getFullImageUrl(relativePath: string | undefined): string | undefined {
  if (!relativePath) return undefined;
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Get the Home Assistant base URL
  const { url } = getHassConfig();
  
  // In development mode, we need to use the full URL for images
  // since they can't go through the proxy
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, use the full Home Assistant URL
    return `${url}${relativePath}`;
  } else {
    // In production, the URL is already available
    return `${url}${relativePath}`;
  }
} 