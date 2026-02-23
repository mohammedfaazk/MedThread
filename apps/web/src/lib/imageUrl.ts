/**
 * Get the full URL for an uploaded image
 * Handles both relative paths and full URLs
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If it's already a full URL (http:// or https://), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a data URL (base64), return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // If it's a relative path, prepend the API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_URL}${cleanPath}`;
}
