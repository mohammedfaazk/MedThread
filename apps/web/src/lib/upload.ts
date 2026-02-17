import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    publicId: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    thumbnail?: {
      url: string;
      publicId: string;
    };
  };
}

export interface MultipleUploadResponse {
  success: boolean;
  data: Array<{
    url: string;
    publicId: string;
    originalName: string;
    mimeType: string;
    size: number;
  }>;
}

/**
 * Upload a single file
 */
export const uploadFile = async (
  file: File,
  folder: string = 'general',
  token?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<UploadResponse>(
    `${API_URL}/api/upload/single`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headers,
      },
    }
  );

  return response.data;
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string = 'general',
  token?: string
): Promise<MultipleUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<MultipleUploadResponse>(
    `${API_URL}/api/upload/multiple`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headers,
      },
    }
  );

  return response.data;
};

/**
 * Upload avatar/profile picture
 */
export const uploadAvatar = async (
  file: File,
  token?: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<UploadResponse>(
    `${API_URL}/api/upload/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headers,
      },
    }
  );

  return response.data;
};

/**
 * Upload from base64 (for backward compatibility)
 */
export const uploadBase64 = async (
  base64Data: string,
  folder: string = 'general',
  type: 'image' | 'video' | 'raw' = 'image',
  token?: string
): Promise<UploadResponse> => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.post<UploadResponse>(
    `${API_URL}/api/upload/base64`,
    { base64Data, folder, type },
    { headers }
  );

  return response.data;
};

/**
 * Delete a file
 */
export const deleteFile = async (
  publicId: string,
  type: 'image' | 'video' | 'raw' = 'image',
  token?: string
): Promise<void> => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await axios.delete(
    `${API_URL}/api/upload/${encodeURIComponent(publicId)}`,
    {
      headers,
      data: { type },
    }
  );
};

/**
 * Convert file to base64 (for fallback)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.split('/')[0];
      return file.type.startsWith(prefix + '/');
    }
    return file.type === type;
  });
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
