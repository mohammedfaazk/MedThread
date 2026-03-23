"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = exports.processImage = exports.uploadFields = exports.uploadMultiple = exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
// Configure multer to use memory storage
const storage = multer_1.default.memoryStorage();
// File filter function
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
};
// Create multer upload instances with different size limits
exports.uploadSingle = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
}).single('file');
exports.uploadMultiple = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5, // Max 5 files
    },
}).array('files', 5);
exports.uploadFields = (0, multer_1.default)({
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
const processImage = async (buffer, options = {}) => {
    const { width = 1200, height, quality = 80, format = 'jpeg', } = options;
    let image = (0, sharp_1.default)(buffer);
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
exports.processImage = processImage;
// Generate thumbnail
const generateThumbnail = async (buffer, size = 200) => {
    return (0, sharp_1.default)(buffer)
        .resize(size, size, {
        fit: 'cover',
        position: 'center',
    })
        .jpeg({ quality: 70 })
        .toBuffer();
};
exports.generateThumbnail = generateThumbnail;
