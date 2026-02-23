import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingle, uploadMultiple, processImage, generateThumbnail } from '../middleware/upload';
import { uploadToCloudinary, deleteFromCloudinary, uploadBase64ToCloudinary } from '../config/cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';
import { asyncHandler } from '../middleware/asyncHandler';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all upload routes
router.use(uploadLimiter);

// Upload single file
router.post(
  '/single',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      next();
    });
  },
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { folder = 'general', type = 'image' } = req.body;
    let fileBuffer = req.file.buffer;

    // Process image if it's an image
    if (req.file.mimetype.startsWith('image/')) {
      fileBuffer = await processImage(fileBuffer, {
        width: 1200,
        quality: 85,
        format: 'jpeg',
      });
    }

    // Determine resource type
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileBuffer, folder, resourceType);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  })
);

// Upload multiple files
router.post(
  '/multiple',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      next();
    });
  },
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const { folder = 'general' } = req.body;
    const uploadPromises = req.files.map(async (file) => {
      let fileBuffer = file.buffer;

      // Process image if it's an image
      if (file.mimetype.startsWith('image/')) {
        fileBuffer = await processImage(fileBuffer, {
          width: 1200,
          quality: 85,
          format: 'jpeg',
        });
      }

      // Determine resource type
      let resourceType: 'image' | 'video' | 'raw' = 'raw';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      }

      const result = await uploadToCloudinary(fileBuffer, folder, resourceType);

      return {
        url: result.url,
        publicId: result.publicId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: results,
    });
  })
);

// Upload avatar/profile picture
router.post(
  '/avatar',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }
      next();
    });
  },
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed for avatars',
      });
    }

    // Process and resize avatar
    const avatarBuffer = await processImage(req.file.buffer, {
      width: 400,
      height: 400,
      quality: 90,
      format: 'jpeg',
    });

    // Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(req.file.buffer, 100);

    // Upload both to Cloudinary
    const [avatar, thumbnail] = await Promise.all([
      uploadToCloudinary(avatarBuffer, 'avatars', 'image'),
      uploadToCloudinary(thumbnailBuffer, 'avatars/thumbnails', 'image'),
    ]);

    res.json({
      success: true,
      data: {
        url: avatar.url,
        publicId: avatar.publicId,
        thumbnail: {
          url: thumbnail.url,
          publicId: thumbnail.publicId,
        },
      },
    });
  })
);

// Upload from base64 (for backward compatibility and migration)
router.post(
  '/base64',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { base64Data, folder = 'general', type = 'image' } = req.body;

    if (!base64Data) {
      return res.status(400).json({
        success: false,
        error: 'No base64 data provided',
      });
    }

    // Determine resource type
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (type === 'image' || base64Data.startsWith('data:image/')) {
      resourceType = 'image';
    } else if (type === 'video' || base64Data.startsWith('data:video/')) {
      resourceType = 'video';
    }

    const result = await uploadBase64ToCloudinary(base64Data, folder, resourceType);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  })
);

// Delete file
router.delete(
  '/:publicId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { publicId } = req.params;
    const { type = 'image' } = req.body;

    // Decode publicId (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);

    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (type === 'video') {
      resourceType = 'video';
    } else if (type === 'raw') {
      resourceType = 'raw';
    }

    await deleteFromCloudinary(decodedPublicId, resourceType);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  })
);

export { router as uploadRouter };
