import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = (token?: string) => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Platform Statistics
export const getPlatformStats = async (token: string) => {
  const response = await axios.get(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

// User Management
export const getUsers = async (
  filters: {
    role?: string;
    verified?: boolean;
    suspended?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/users?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const suspendUser = async (userId: string, reason: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/admin/users/${userId}/suspend`,
    { reason },
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const unsuspendUser = async (userId: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/admin/users/${userId}/unsuspend`,
    {},
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const deleteUser = async (userId: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

// Post Management
export const getPosts = async (
  filters: {
    communityId?: string;
    authorId?: string;
    isRemoved?: boolean;
    isPinned?: boolean;
    isLocked?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/posts?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const deletePost = async (postId: string, reason: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/admin/posts/${postId}`, {
    headers: getAuthHeaders(token),
    data: { reason },
  });
  return response.data;
};

export const togglePinPost = async (postId: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/admin/posts/${postId}/pin`,
    {},
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const toggleLockPost = async (postId: string, token: string) => {
  const response = await axios.put(
    `${API_URL}/api/admin/posts/${postId}/lock`,
    {},
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

// Comment Management
export const getComments = async (
  filters: {
    postId?: string;
    authorId?: string;
    isRemoved?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/comments?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const deleteComment = async (commentId: string, reason: string, token: string) => {
  const response = await axios.delete(`${API_URL}/api/admin/comments/${commentId}`, {
    headers: getAuthHeaders(token),
    data: { reason },
  });
  return response.data;
};

// Report Management
export const getReports = async (
  filters: {
    status?: string;
    category?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/reports?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const resolveReport = async (
  reportId: string,
  action: 'APPROVED' | 'REJECTED',
  notes: string,
  token: string
) => {
  const response = await axios.put(
    `${API_URL}/api/admin/reports/${reportId}/resolve`,
    { action, notes },
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

// Audit Logs
export const getAuditLogs = async (
  filters: {
    adminId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/audit-logs?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};

export const getAuditLogStats = async (
  filters: {
    adminId?: string;
    startDate?: string;
    endDate?: string;
  },
  token: string
) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const response = await axios.get(`${API_URL}/api/admin/audit-logs/stats?${params}`, {
    headers: getAuthHeaders(token),
  });
  return response.data;
};
