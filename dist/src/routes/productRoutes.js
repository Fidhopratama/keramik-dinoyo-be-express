"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const imageUpload_1 = require("../middleware/imageUpload");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, } = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express_1.default.Router();
const upload = (0, imageUpload_1.createImageUpload)(path_1.default.join(process.cwd(), 'uploads', 'products'), 'product');
// Public
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
// Admin only
router.post('/products', authenticateToken, authorizeRole('admin'), upload.single('image'), createProduct);
router.put('/products/:id', authenticateToken, authorizeRole('admin'), upload.single('image'), updateProduct);
router.delete('/products/:id', authenticateToken, authorizeRole('admin'), deleteProduct);
module.exports = router;
