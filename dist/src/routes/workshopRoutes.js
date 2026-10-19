"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const { getWorkshops, getWorkshopById, createWorkshop, updateWorkshop, deleteWorkshop, } = require('../controllers/workshopController');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express_1.default.Router();
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'workshops');
fs_1.default.mkdirSync(uploadDir, {
    recursive: true,
});
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
        cb(null, `${Date.now()}-${baseName || 'workshop'}${ext.toLowerCase()}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('File gambar harus berupa JPG, JPEG, PNG, atau WEBP.'));
        }
        cb(null, true);
    },
});
// Public
router.get('/workshops', getWorkshops);
router.get('/workshops/:id', getWorkshopById);
// Admin only
router.post('/workshops', authenticateToken, authorizeRole('admin'), upload.single('image'), createWorkshop);
router.put('/workshops/:id', authenticateToken, authorizeRole('admin'), upload.single('image'), updateWorkshop);
router.delete('/workshops/:id', authenticateToken, authorizeRole('admin'), deleteWorkshop);
module.exports = router;
