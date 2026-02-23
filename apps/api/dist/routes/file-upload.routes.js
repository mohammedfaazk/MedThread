"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadRouter = void 0;
const express_1 = require("express");
const file_upload_service_1 = require("../services/file-upload.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.fileUploadRouter = (0, express_1.Router)();
/**
 * POST /api/upload/avatar
 * Upload user avatar
 */
exports.fileUploadRouter.post('/avatar', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { base64Data } = req.body;
    const userId = req.user.userId;
    // Validate file
    if (!file_upload_service_1.fileUploadService.validateFileSize(base64Data, 5)) {
        return res.status(400).json({ error: 'File size must be less than 5MB' });
    }
    if (!file_upload_service_1.fileUploadService.validateFileType(base64Data, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])) {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    const result = await file_upload_service_1.fileUploadService.uploadAvatar(base64Data, userId);
    res.json(result);
}));
/**
 * POST /api/upload/document
 * Upload general document
 */
exports.fileUploadRouter.post('/document', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { base64Data, filename } = req.body;
    // Validate file
    if (!file_upload_service_1.fileUploadService.validateFileSize(base64Data, 10)) {
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
    if (!file_upload_service_1.fileUploadService.validateFileType(base64Data, allowedTypes)) {
        return res.status(400).json({ error: 'Invalid file type' });
    }
    const result = await file_upload_service_1.fileUploadService.uploadFromBase64(base64Data, filename, 'documents');
    res.json(result);
}));
/**
 * POST /api/upload/medical
 * Upload medical document
 */
exports.fileUploadRouter.post('/medical', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { base64Data, filename } = req.body;
    // Validate file
    if (!file_upload_service_1.fileUploadService.validateFileSize(base64Data, 10)) {
        return res.status(400).json({ error: 'File size must be less than 10MB' });
    }
    const result = await file_upload_service_1.fileUploadService.uploadMedicalDocument(base64Data, filename);
    res.json(result);
}));
/**
 * POST /api/upload/verification-documents
 * Upload doctor verification documents
 */
exports.fileUploadRouter.post('/verification-documents', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const documents = req.body;
    // Validate all required documents
    if (!documents.idProof || !documents.medicalDegree || !documents.licenseDocument) {
        return res.status(400).json({ error: 'All required documents must be provided' });
    }
    const result = await file_upload_service_1.fileUploadService.uploadVerificationDocuments(documents);
    res.json(result);
}));
/**
 * POST /api/upload/multiple
 * Upload multiple files
 */
exports.fileUploadRouter.post('/multiple', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { files, folder } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Files array is required' });
    }
    const results = await file_upload_service_1.fileUploadService.uploadMultiple(files, folder || 'documents');
    res.json(results);
}));
/**
 * DELETE /api/upload/:filepath
 * Delete uploaded file
 */
exports.fileUploadRouter.delete('/:filepath', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { filepath } = req.params;
    const success = await file_upload_service_1.fileUploadService.deleteFile(filepath);
    if (success) {
        res.json({ message: 'File deleted successfully' });
    }
    else {
        res.status(404).json({ error: 'File not found' });
    }
}));
