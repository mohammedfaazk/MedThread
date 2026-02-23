'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { uploadAvatar } from '@/lib/upload';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUploadComplete: (url: string, thumbnailUrl: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  token?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onUploadComplete,
  onUploadError,
  token,
  size = 'md',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Please select an image file';
      onUploadError?.(error);
      alert(error);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const error = 'Image size must be less than 10MB';
      onUploadError?.(error);
      alert(error);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);

    try {
      const result = await uploadAvatar(file, token);
      onUploadComplete(
        result.data.url,
        result.data.thumbnail?.url || result.data.url,
        result.data.publicId
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      onUploadError?.(errorMessage);
      alert(errorMessage);
      // Revert preview on error
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        className={`
          ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600
          flex items-center justify-center cursor-pointer group relative
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
          transition-all duration-200
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-white`} />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-600 transition">
        <Camera className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};
