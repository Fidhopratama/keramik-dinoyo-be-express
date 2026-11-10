"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadErrorHandler = exports.InvalidImageTypeError = void 0;
exports.createImageUpload = createImageUpload;
exports.removeUploadedImage = removeUploadedImage;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = {
    '.jpg': ['image/jpeg', 'image/jpg'],
    '.jpeg': ['image/jpeg', 'image/jpg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
};
class InvalidImageTypeError extends Error {
    constructor() {
        super('File harus berupa gambar JPG, JPEG, PNG, atau WEBP.');
        this.name = 'InvalidImageTypeError';
    }
}
exports.InvalidImageTypeError = InvalidImageTypeError;
function createImageUpload(uploadDir, fallbackName) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const safeName = path_1.default
                .basename(file.originalname, path_1.default.extname(file.originalname))
                .replace(/[^a-zA-Z0-9_-]/g, '-')
                .replace(/-+/g, '-')
                .toLowerCase();
            cb(null, `${Date.now()}-${safeName || fallbackName}${ext}`);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: MAX_IMAGE_SIZE },
        fileFilter: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const acceptedMimeTypes = allowedMimeTypes[ext];
            if (!acceptedMimeTypes?.includes(file.mimetype.toLowerCase())) {
                return cb(new InvalidImageTypeError());
            }
            cb(null, true);
        },
    });
}
function removeUploadedImage(directory, filename) {
    const filePath = path_1.default.join(process.cwd(), 'uploads', directory, path_1.default.basename(filename));
    try {
        fs_1.default.unlinkSync(filePath);
    }
    catch (error) {
        console.error('Remove uploaded image error:', error);
    }
}
const imageUploadErrorHandler = (error, _req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                message: 'Ukuran gambar maksimal 5 MB.',
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Upload gambar tidak valid.',
        });
    }
    if (error instanceof InvalidImageTypeError) {
        return res.status(422).json({
            success: false,
            message: error.message,
        });
    }
    return next(error);
};
exports.imageUploadErrorHandler = imageUploadErrorHandler;
