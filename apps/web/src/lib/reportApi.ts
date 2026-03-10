import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

const getAuthHeaders = (token?: string) => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const reportPost = async (postId: string, reason: string, details: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/api/reports/post/${postId}`,
    { reason, details },
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const reportComment = async (commentId: string, reason: string, details: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/api/reports/comment/${commentId}`,
    { reason, details },
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const reportUser = async (userId: string, reason: string, details: string, token: string) => {
  const response = await axios.post(
    `${API_URL}/api/reports/user/${userId}`,
    { reason, details },
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};

export const getMyReports = async (page: number = 1, limit: number = 20, token: string) => {
  const response = await axios.get(
    `${API_URL}/api/reports/my-reports?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders(token) }
  );
  return response.data;
};
