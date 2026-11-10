"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryConfigurationError = exports.CLOUDINARY_ALLOWED_FORMATS = exports.CLOUDINARY_UPLOAD_PRESET = exports.CLOUDINARY_FOLDER = void 0;
exports.getCloudinaryCredentials = getCloudinaryCredentials;
exports.createCloudinaryUploadSignature = createCloudinaryUploadSignature;
const node_crypto_1 = require("node:crypto");
const cloudinary_1 = require("cloudinary");
exports.CLOUDINARY_FOLDER = 'keramik-dinoyo';
exports.CLOUDINARY_UPLOAD_PRESET = 'keramik-dinoyo-uploads';
exports.CLOUDINARY_ALLOWED_FORMATS = 'jpg,jpeg,png,webp';
class CloudinaryConfigurationError extends Error {
}
exports.CloudinaryConfigurationError = CloudinaryConfigurationError;
function getCloudinaryCredentials() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    if (!cloudName ||
        !/^[a-zA-Z0-9_-]+$/.test(cloudName) ||
        !apiKey ||
        !apiSecret) {
        throw new CloudinaryConfigurationError('Konfigurasi Cloudinary belum tersedia atau tidak valid.');
    }
    return { cloudName, apiKey, apiSecret };
}
function createCloudinaryUploadSignature(timestamp = Math.floor(Date.now() / 1000), publicId = (0, node_crypto_1.randomUUID)()) {
    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
    const paramsToSign = {
        folder: exports.CLOUDINARY_FOLDER,
        allowed_formats: exports.CLOUDINARY_ALLOWED_FORMATS,
        public_id: publicId,
        timestamp,
        upload_preset: exports.CLOUDINARY_UPLOAD_PRESET,
    };
    return {
        cloudName,
        apiKey,
        timestamp,
        signature: cloudinary_1.v2.utils.api_sign_request(paramsToSign, apiSecret),
        folder: exports.CLOUDINARY_FOLDER,
        publicId,
    };
}
