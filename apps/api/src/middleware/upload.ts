import multer from 'multer';
import sharp from 'sharp';
import { Request } from 'express';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedMimes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Create multer upload instances with different size limits
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single('file');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Max 5 files
  },
}).array('files', 5);

export const uploadFields = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'medicalDegree', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 },
]);

// Image processing helper
export const processImage = async (
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<Buffer> => {
  const {
    width = 1200,
    height,
    quality = 80,
    format = 'jpeg',
  } = options;

  let image = sharp(buffer);

  // Resize if dimensions provided
  if (width || height) {
    image = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert format and compress
  switch (format) {
    case 'jpeg':
      image = image.jpeg({ quality });
      break;
    case 'png':
      image = image.png({ quality });
      break;
    case 'webp':
      image = image.webp({ quality });
      break;
  }

  return image.toBuffer();
};

// Generate thumbnail
export const generateThumbnail = async (
  buffer: Buffer,
  size: number = 200
): Promise<Buffer> => {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 70 })
    .toBuffer();
};
