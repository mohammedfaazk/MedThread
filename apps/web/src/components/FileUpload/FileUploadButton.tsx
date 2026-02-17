'use client';

import React, { useRef, useState } from 'react';
import { Upload, Loader2, X, Check } from 'lucide-react';
import { uploadFile, validateFileSize, validateFileType, formatFileSize } from '@/lib/upload';

interface FileUploadButtonProps {
  onUploadComplete: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  token?: string;
  buttonText?: string;
  buttonClassName?: string;
  showPreview?: boolean;
  allowedTypes?: string[];
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onUploadComplete,
  onUploadError,
  folder = 'general',
  accept = 'image/*',
  maxSizeMB = 10,
  token,
  buttonText = 'Upload File',
  buttonClassName = '',
  showPreview = true,
  allowedTypes = ['image/*'],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (!validateFileSize(file, maxSizeMB)) {
      const error = `File size must be less than ${maxSizeMB}MB`;
      onUploadError?.(error);
      alert(error);
      return;
    }

    // Validate file type
    if (!validateFileType(file, allowedTypes)) {
      const error = 'File type not allowed';
      onUploadError?.(error);
      alert(error);
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));

    // Show preview for images
    if (showPreview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setUploading(true);
    setUploadSuccess(false);

    try {
      const result = await uploadFile(file, folder, token);
      onUploadComplete(result.data.url, result.data.publicId);
      setUploadSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      onUploadError?.(errorMessage);
      alert(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${uploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
          ${uploadSuccess ? 'bg-green-500' : ''}
          ${buttonClassName}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : uploadSuccess ? (
          <>
            <Check className="w-4 h-4" />
            Uploaded!
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>

      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {fileName && !preview && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{fileName}</span>
          <span className="text-gray-400">({fileSize})</span>
          <button
            type="button"
            onClick={clearPreview}
            className="text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
