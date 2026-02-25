"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBase64ToCloudinary = exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const index_1 = require("./index");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: index_1.config.cloudinary.cloudName,
    api_key: index_1.config.cloudinary.apiKey,
    api_secret: index_1.config.cloudinary.apiSecret,
});
// Helper function to upload file buffer to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'image') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `medthread/${folder}`,
            resource_type: resourceType,
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType });
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Helper function to upload base64 to Cloudinary (for migration)
const uploadBase64ToCloudinary = async (base64Data, folder, resourceType = 'image') => {
    const result = await cloudinary_1.v2.uploader.upload(base64Data, {
        folder: `medthread/${folder}`,
        resource_type: resourceType,
    });
    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};
exports.uploadBase64ToCloudinary = uploadBase64ToCloudinary;
