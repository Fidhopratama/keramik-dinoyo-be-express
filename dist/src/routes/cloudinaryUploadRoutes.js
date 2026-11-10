"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinaryUpload_1 = require("../services/cloudinaryUpload");
const express = require('express');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express.Router();
function createUploadSignature(_req, res) {
    try {
        return res.json({
            success: true,
            data: (0, cloudinaryUpload_1.createCloudinaryUploadSignature)(),
        });
    }
    catch (error) {
        if (error instanceof cloudinaryUpload_1.CloudinaryConfigurationError) {
            return res.status(503).json({
                success: false,
                message: error.message,
            });
        }
        console.error('Cloudinary upload signature generation failed.');
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat signature upload.',
        });
    }
}
router.post('/uploads/cloudinary-signature', authenticateToken, authorizeRole('admin'), createUploadSignature);
module.exports = router;
