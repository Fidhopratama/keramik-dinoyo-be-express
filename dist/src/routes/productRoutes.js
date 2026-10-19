"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, } = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express_1.default.Router();
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'products');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, {
        recursive: true,
    });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const safeName = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .toLowerCase();
        cb(null, `${Date.now()}-${safeName}${ext.toLowerCase()}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Format gambar harus JPG, PNG, atau WEBP.'));
        }
        cb(null, true);
    },
});
// Public
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
// Admin only
router.post('/products', authenticateToken, authorizeRole('admin'), upload.single('image'), createProduct);
router.put('/products/:id', authenticateToken, authorizeRole('admin'), upload.single('image'), updateProduct);
router.delete('/products/:id', authenticateToken, authorizeRole('admin'), deleteProduct);
module.exports = router;
