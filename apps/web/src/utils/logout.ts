/**
 * Clear authentication data and redirect to login
 */
export function clearAuthAndRedirect() {
  // Clear localStorage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  
  // Clear sessionStorage if used
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user');
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
