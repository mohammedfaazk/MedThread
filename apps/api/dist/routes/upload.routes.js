"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const cloudinary_1 = require("../config/cloudinary");
const auth_refactored_1 = require("../middleware/auth.refactored");
const asyncHandler_1 = require("../middleware/asyncHandler");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
exports.uploadRouter = router;
// Apply rate limiting to all upload routes
router.use(rateLimiter_1.uploadLimiter);
// Upload single file
router.post('/single', auth_refactored_1.authenticate, (req, res, next) => {
    (0, upload_1.uploadSingle)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
        next();
    });
}, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
        fileBuffer = await (0, upload_1.processImage)(fileBuffer, {
            width: 1200,
            quality: 85,
            format: 'jpeg',
        });
    }
    // Determine resource type
    let resourceType = 'raw';
    if (req.file.mimetype.startsWith('image/')) {
        resourceType = 'image';
    }
    else if (req.file.mimetype.startsWith('video/')) {
        resourceType = 'video';
    }
    // Upload to Cloudinary
    const result = await (0, cloudinary_1.uploadToCloudinary)(fileBuffer, folder, resourceType);
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
}));
// Upload multiple files
router.post('/multiple', auth_refactored_1.authenticate, (req, res, next) => {
    (0, upload_1.uploadMultiple)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
        next();
    });
}, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            fileBuffer = await (0, upload_1.processImage)(fileBuffer, {
                width: 1200,
                quality: 85,
                format: 'jpeg',
            });
        }
        // Determine resource type
        let resourceType = 'raw';
        if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        }
        else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }
        const result = await (0, cloudinary_1.uploadToCloudinary)(fileBuffer, folder, resourceType);
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
}));
// Upload avatar/profile picture
router.post('/avatar', auth_refactored_1.authenticate, (req, res, next) => {
    (0, upload_1.uploadSingle)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
        next();
    });
}, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    const avatarBuffer = await (0, upload_1.processImage)(req.file.buffer, {
        width: 400,
        height: 400,
        quality: 90,
        format: 'jpeg',
    });
    // Generate thumbnail
    const thumbnailBuffer = await (0, upload_1.generateThumbnail)(req.file.buffer, 100);
    // Upload both to Cloudinary
    const [avatar, thumbnail] = await Promise.all([
        (0, cloudinary_1.uploadToCloudinary)(avatarBuffer, 'avatars', 'image'),
        (0, cloudinary_1.uploadToCloudinary)(thumbnailBuffer, 'avatars/thumbnails', 'image'),
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
}));
// Upload from base64 (for backward compatibility and migration)
router.post('/base64', auth_refactored_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { base64Data, folder = 'general', type = 'image' } = req.body;
    if (!base64Data) {
        return res.status(400).json({
            success: false,
            error: 'No base64 data provided',
        });
    }
    // Determine resource type
    let resourceType = 'raw';
    if (type === 'image' || base64Data.startsWith('data:image/')) {
        resourceType = 'image';
    }
    else if (type === 'video' || base64Data.startsWith('data:video/')) {
        resourceType = 'video';
    }
    const result = await (0, cloudinary_1.uploadBase64ToCloudinary)(base64Data, folder, resourceType);
    res.json({
        success: true,
        data: {
            url: result.url,
            publicId: result.publicId,
        },
    });
}));
// Delete file
router.delete('/:publicId', auth_refactored_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { publicId } = req.params;
    const { type = 'image' } = req.body;
    // Decode publicId (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    let resourceType = 'image';
    if (type === 'video') {
        resourceType = 'video';
    }
    else if (type === 'raw') {
        resourceType = 'raw';
    }
    await (0, cloudinary_1.deleteFromCloudinary)(decodedPublicId, resourceType);
    res.json({
        success: true,
        message: 'File deleted successfully',
    });
}));
