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
  
  // If it's a data URL (base64), validate and return as is
  if (path.startsWith('data:')) {
    // Check if the base64 string is too large (over 1MB)
    const maxSize = 1024 * 1024; // 1MB
    if (path.length > maxSize) {
      console.warn('⚠️ Base64 image too large, using placeholder');
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMiIgeT0iMTIiPgo8cGF0aCBkPSJNOCAxNEMxMS4zMTM3IDE0IDE0IDExLjMxMzcgMTQgOEMxNCA0LjY4NjI5IDExLjMxMzcgMiA4IDJDNC42ODYyOSAyIDIgNC42ODYyOSAyIDhDMiAxMS4zMTM3IDQuNjg2MjkgMTQgOCAxNFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMiIgeT0iMTIiPgo8cGF0aCBkPSJNOCAxNEMxMS4zMTM3IDE0IDE0IDExLjMxMzcgMTQgOEMxNCA0LjY4NjI5IDExLjMxMzcgMiA4IDJDNC42ODYyOSAyIDIgNC42ODYyOSAyIDhDMiAxMS4zMTM3IDQuNjg2MjkgMTQgOCAxNFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNOCA2VjgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjMzMzMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNOCAxMEg4LjAwNjY3IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMS4zMzMzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=';
    }
    return path;
  }
  
  // If it looks like just a filename (no slashes), it's probably an uploaded file
  // These should be served from /uploads/ directory
  if (!path.includes('/')) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${API_URL}/uploads/${path}`;
  }
  
  // If it's a relative path, prepend the API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_URL}${cleanPath}`;
}
