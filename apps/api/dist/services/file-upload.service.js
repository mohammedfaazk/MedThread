"use strict";
// File upload service with support for local storage and cloud providers
// Can be extended to use AWS S3, Cloudinary, or other providers
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadService = exports.FileUploadService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
class FileUploadService {
    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        this.ensureUploadDir();
    }
    /**
     * Ensure upload directory exists
     */
    async ensureUploadDir() {
        try {
            await mkdir(this.uploadDir, { recursive: true });
            await mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
            await mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
            await mkdir(path.join(this.uploadDir, 'medical'), { recursive: true });
        }
        catch (error) {
            console.error('Failed to create upload directories:', error);
        }
    }
    /**
     * Upload file from base64
     */
    async uploadFromBase64(base64Data, filename, folder = 'documents') {
        try {
            // Extract mime type and data
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 string');
            }
            const mimetype = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            // Generate unique filename
            const timestamp = Date.now();
            const ext = this.getExtensionFromMimetype(mimetype);
            const uniqueFilename = `${timestamp}-${filename}${ext}`;
            // Save file
            const filepath = path.join(this.uploadDir, folder, uniqueFilename);
            await writeFile(filepath, buffer);
            // Return URL (in production, this would be a CDN URL)
            const url = `/uploads/${folder}/${uniqueFilename}`;
            return {
                url,
                filename: uniqueFilename,
                size: buffer.length,
                mimetype
            };
        }
        catch (error) {
            console.error('File upload error:', error);
            throw new Error('Failed to upload file');
        }
    }
    /**
     * Upload multiple files
     */
    async uploadMultiple(files, folder = 'documents') {
        const results = await Promise.all(files.map(file => this.uploadFromBase64(file.base64, file.filename, folder)));
        return results;
    }
    /**
     * Upload doctor verification documents
     */
    async uploadVerificationDocuments(documents) {
        const results = {};
        // Upload ID proof
        results.idProof = await this.uploadFromBase64(documents.idProof, 'id-proof', 'documents');
        // Upload medical degree
        results.medicalDegree = await this.uploadFromBase64(documents.medicalDegree, 'medical-degree', 'documents');
        // Upload license
        results.licenseDocument = await this.uploadFromBase64(documents.licenseDocument, 'license', 'documents');
        // Upload additional certificates
        if (documents.additionalCertificates && documents.additionalCertificates.length > 0) {
            results.additionalCertificates = await Promise.all(documents.additionalCertificates.map((cert, index) => this.uploadFromBase64(cert, `certificate-${index}`, 'documents')));
        }
        return results;
    }
    /**
     * Upload avatar/profile picture
     */
    async uploadAvatar(base64Data, userId) {
        return this.uploadFromBase64(base64Data, `avatar-${userId}`, 'avatars');
    }
    /**
     * Upload medical document (prescription, report, etc.)
     */
    async uploadMedicalDocument(base64Data, filename) {
        return this.uploadFromBase64(base64Data, filename, 'medical');
    }
    /**
     * Get file extension from mimetype
     */
    getExtensionFromMimetype(mimetype) {
        const mimetypeMap = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
        };
        return mimetypeMap[mimetype] || '';
    }
    /**
     * Validate file size
     */
    validateFileSize(base64Data, maxSizeMB = 5) {
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        return sizeInMB <= maxSizeMB;
    }
    /**
     * Validate file type
     */
    validateFileType(base64Data, allowedTypes) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,/);
        if (!matches)
            return false;
        const mimetype = matches[1];
        return allowedTypes.includes(mimetype);
    }
    /**
     * Delete file
     */
    async deleteFile(filepath) {
        try {
            const fullPath = path.join(this.uploadDir, filepath);
            await (0, util_1.promisify)(fs.unlink)(fullPath);
            return true;
        }
        catch (error) {
            console.error('File deletion error:', error);
            return false;
        }
    }
}
exports.FileUploadService = FileUploadService;
// AWS S3 Integration (optional - uncomment when needed)
/*
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3FileUploadService extends FileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    super();
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'medthread-uploads';
  }

  async uploadToS3(
    base64Data: string,
    filename: string,
    folder: string = 'documents'
  ): Promise<UploadResult> {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches) {
      throw new Error('Invalid base64 string');
    }

    const mimetype = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    const timestamp = Date.now();
    const ext = this.getExtensionFromMimetype(mimetype);
    const key = `${folder}/${timestamp}-${filename}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read'
    });

    await this.s3Client.send(command);

    const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    return {
      url,
      filename: key,
      size: buffer.length,
      mimetype
    };
  }
}
*/
// Cloudinary Integration (optional - uncomment when needed)
/*
import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryFileUploadService extends FileUploadService {
  constructor() {
    super();
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  async uploadToCloudinary(
    base64Data: string,
    folder: string = 'documents'
  ): Promise<UploadResult> {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `medthread/${folder}`,
      resource_type: 'auto'
    });

    return {
      url: result.secure_url,
      filename: result.public_id,
      size: result.bytes,
      mimetype: result.format
    };
  }
}
*/
exports.fileUploadService = new FileUploadService();
