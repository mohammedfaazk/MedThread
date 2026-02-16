import { Router } from 'express';
import { fileUploadService } from '../services/file-upload.service';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export const fileUploadRouter = Router();

/**
 * POST /api/upload/avatar
 * Upload user avatar
 */
fileUploadRouter.post(
  '/avatar',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { base64Data } = req.body;
    const userId = req.user.userId;

    // Validate file
    if (!fileUploadService.validateFileSize(base64Data, 5)) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    if (!fileUploadService.validateFileType(base64Data, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    const result = await fileUploadService.uploadAvatar(base64Data, userId);
    res.json(result);
  })
);

/**
 * POST /api/upload/document
 * Upload general document
 */
fileUploadRouter.post(
  '/document',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { base64Data, filename } = req.body;

    // Validate file
    if (!fileUploadService.validateFileSize(base64Data, 10)) {
      return res.status(400).json({ error: 'File size must be less than 10MB' });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!fileUploadService.validateFileType(base64Data, allowedTypes)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const result = await fileUploadService.uploadFromBase64(base64Data, filename, 'documents');
    res.json(result);
  })
);

/**
 * POST /api/upload/medical
 * Upload medical document
 */
fileUploadRouter.post(
  '/medical',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { base64Data, filename } = req.body;

    // Validate file
    if (!fileUploadService.validateFileSize(base64Data, 10)) {
      return res.status(400).json({ error: 'File size must be less than 10MB' });
    }

    const result = await fileUploadService.uploadMedicalDocument(base64Data, filename);
    res.json(result);
  })
);

/**
 * POST /api/upload/verification-documents
 * Upload doctor verification documents
 */
fileUploadRouter.post(
  '/verification-documents',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const documents = req.body;

    // Validate all required documents
    if (!documents.idProof || !documents.medicalDegree || !documents.licenseDocument) {
      return res.status(400).json({ error: 'All required documents must be provided' });
    }

    const result = await fileUploadService.uploadVerificationDocuments(documents);
    res.json(result);
  })
);

/**
 * POST /api/upload/multiple
 * Upload multiple files
 */
fileUploadRouter.post(
  '/multiple',
  authenticate,
  asyncHandler(async (req: any, res) => {
    const { files, folder } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Files array is required' });
    }

    const results = await fileUploadService.uploadMultiple(files, folder || 'documents');
    res.json(results);
  })
);

/**
 * DELETE /api/upload/:filepath
 * Delete uploaded file
 */
fileUploadRouter.delete(
  '/:filepath',
  authenticate,
  asyncHandler(async (req, res) => {
    const { filepath } = req.params;
    const success = await fileUploadService.deleteFile(filepath);
    
    if (success) {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  })
);
