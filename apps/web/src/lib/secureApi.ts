import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

// Session ID for CSRF protection
let sessionId: string | null = null;
let csrfToken: string | null = null;

// Generate or get session ID
function getSessionId(): string {
  if (!sessionId) {
    sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
  }
  return sessionId;
}

// Fetch CSRF token
async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  try {
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      headers: {
        'X-Session-ID': getSessionId(),
      },
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    return csrfToken || '';
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
}

// Create axios instance with security features
const secureClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
secureClient.interceptors.request.use(
  async (config) => {
    // Add session ID
    config.headers['X-Session-ID'] = getSessionId();

    // Add CSRF token for non-GET requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const token = await getCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }

    // Add auth token from localStorage (backward compatibility)
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
secureClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If CSRF token expired, refresh and retry
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      csrfToken = null;
      const token = await getCsrfToken();
      if (token && error.config) {
        error.config.headers['X-CSRF-Token'] = token;
        return secureClient.request(error.config);
      }
    }

    // If unauthorized, clear tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default secureClient;

// Convenience methods
export const secureApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    secureClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    secureClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    secureClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    secureClient.delete<T>(url, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    secureClient.patch<T>(url, data, config),
};
