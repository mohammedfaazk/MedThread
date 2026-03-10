import axios, { AxiosRequestConfig } from 'axios';
import { cache, cacheKeys } from './cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api';

interface ApiClientOptions extends AxiosRequestConfig {
  cache?: boolean;
  cacheTTL?: number;
}

class ApiClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
    const { cache: useCache = false, cacheTTL, ...axiosConfig } = options;
    const cacheKey = `${url}:${JSON.stringify(axiosConfig.params || {})}`;

    // Check cache first
    if (useCache) {
      const cached = cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<T>(url, axiosConfig);

    // Store in cache
    if (useCache) {
      cache.set(cacheKey, response.data, cacheTTL);
    }

    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Invalidate cache
  invalidateCache(pattern?: string) {
    if (pattern) {
      const stats = cache.getStats();
      stats.keys.forEach((key) => {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      });
    } else {
      cache.clear();
    }
  }
}

export const apiClient = new ApiClient();

// Convenience methods with caching
export const api = {
  // Posts
  getPosts: (page = 1, limit = 20, filters?: Record<string, any>) =>
    apiClient.get('/posts', {
      params: { page, limit, ...filters },
      cache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
    }),

  getPost: (id: string) =>
    apiClient.get(`/posts/${id}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    }),

  // Threads
  getThreads: (page = 1, limit = 20) =>
    apiClient.get('/threads', {
      params: { page, limit },
      cache: true,
      cacheTTL: 2 * 60 * 1000,
    }),

  getThread: (id: string) =>
    apiClient.get(`/threads/${id}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    }),

  // Users
  getUser: (id: string) =>
    apiClient.get(`/users/${id}`, {
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    }),

  // Comments
  getComments: (postId: string, page = 1, limit = 20) =>
    apiClient.get(`/posts/${postId}/comments`, {
      params: { page, limit },
      cache: true,
      cacheTTL: 1 * 60 * 1000, // 1 minute
    }),
};
