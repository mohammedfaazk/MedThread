const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth
  async register(data: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Threads
  async getThreads() {
    return this.request('/api/threads');
  }

  async getThread(id: string) {
    return this.request(`/api/threads/${id}`);
  }

  async createThread(data: any) {
    return this.request('/api/threads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Replies
  async createReply(data: any) {
    return this.request('/api/replies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Timeline
  async getTimeline(threadId: string) {
    return this.request(`/api/timeline/${threadId}`);
  }

  async addTimelineEvent(data: any) {
    return this.request('/api/timeline', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
