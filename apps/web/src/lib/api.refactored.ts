import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// API Response types
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any[];
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<ApiSuccessResponse<T>>(config);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiErrorResponse;
        throw new Error(apiError.error || 'An error occurred');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
    role: string;
  }) {
    const result = await this.request<{ token: string; user: any }>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
    this.setToken(result.token);
    return result;
  }

  async login(data: { email: string; password: string }) {
    const result = await this.request<{ token: string; user: any }>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
    this.setToken(result.token);
    return result;
  }

  async logout() {
    try {
      await this.request({
        method: 'POST',
        url: '/auth/logout',
      });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return this.request<any>({
      method: 'GET',
      url: '/auth/me',
    });
  }

  async refreshToken() {
    const result = await this.request<{ token: string }>({
      method: 'POST',
      url: '/auth/refresh',
    });
    this.setToken(result.token);
    return result;
  }

  // User endpoints
  async getUser(userId: string) {
    return this.request<any>({
      method: 'GET',
      url: `/users/${userId}`,
    });
  }

  async getUserByUsername(username: string) {
    return this.request<any>({
      method: 'GET',
      url: `/users/username/${username}`,
    });
  }

  async updateUser(userId: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/users/${userId}`,
      data,
    });
  }

  async followUser(userId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/users/${userId}/follow`,
    });
  }

  async unfollowUser(userId: string) {
    return this.request<any>({
      method: 'DELETE',
      url: `/users/${userId}/follow`,
    });
  }

  // Post endpoints
  async createPost(data: any) {
    return this.request<any>({
      method: 'POST',
      url: '/posts',
      data,
    });
  }

  async getPosts(params?: {
    communityId?: string;
    authorId?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    return this.request<{ posts: any[]; pagination: any }>({
      method: 'GET',
      url: '/posts',
      params,
    });
  }

  async getPost(postId: string) {
    return this.request<any>({
      method: 'GET',
      url: `/posts/${postId}`,
    });
  }

  async updatePost(postId: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/posts/${postId}`,
      data,
    });
  }

  async deletePost(postId: string) {
    return this.request<any>({
      method: 'DELETE',
      url: `/posts/${postId}`,
    });
  }

  async votePost(postId: string, value: 1 | -1) {
    return this.request<any>({
      method: 'POST',
      url: `/posts/${postId}/vote`,
      data: { value },
    });
  }

  async savePost(postId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/posts/${postId}/save`,
    });
  }

  async hidePost(postId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/posts/${postId}/hide`,
    });
  }

  // Comment endpoints
  async createComment(data: {
    postId: string;
    content: string;
    parentId?: string;
  }) {
    return this.request<any>({
      method: 'POST',
      url: '/comments',
      data,
    });
  }

  async getComments(postId: string, sortBy?: string) {
    return this.request<any[]>({
      method: 'GET',
      url: `/posts/${postId}/comments`,
      params: { sortBy },
    });
  }

  async getCommentReplies(commentId: string) {
    return this.request<any[]>({
      method: 'GET',
      url: `/comments/${commentId}/replies`,
    });
  }

  async updateComment(commentId: string, content: string) {
    return this.request<any>({
      method: 'PUT',
      url: `/comments/${commentId}`,
      data: { content },
    });
  }

  async deleteComment(commentId: string) {
    return this.request<any>({
      method: 'DELETE',
      url: `/comments/${commentId}`,
    });
  }

  async voteComment(commentId: string, value: 1 | -1) {
    return this.request<any>({
      method: 'POST',
      url: `/comments/${commentId}/vote`,
      data: { value },
    });
  }

  // Community endpoints
  async createCommunity(data: {
    name: string;
    displayName: string;
    description?: string;
    isNSFW?: boolean;
    isPrivate?: boolean;
  }) {
    return this.request<any>({
      method: 'POST',
      url: '/communities',
      data,
    });
  }

  async getCommunities(params?: {
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    return this.request<{ communities: any[]; pagination: any }>({
      method: 'GET',
      url: '/communities',
      params,
    });
  }

  async getCommunity(name: string) {
    return this.request<any>({
      method: 'GET',
      url: `/communities/${name}`,
    });
  }

  async updateCommunity(communityId: string, data: any) {
    return this.request<any>({
      method: 'PUT',
      url: `/communities/${communityId}`,
      data,
    });
  }

  async joinCommunity(communityId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/communities/${communityId}/join`,
    });
  }

  async leaveCommunity(communityId: string) {
    return this.request<any>({
      method: 'DELETE',
      url: `/communities/${communityId}/leave`,
    });
  }
}

export const api = new ApiClient();
export default api;
