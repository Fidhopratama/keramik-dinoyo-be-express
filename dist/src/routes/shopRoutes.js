"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const imageUpload_1 = require("../middleware/imageUpload");
const { getShops, getShopById, createShop, updateShop, deleteShop, } = require('../controllers/shopController');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express_1.default.Router();
const upload = (0, imageUpload_1.createImageUpload)(path_1.default.join(process.cwd(), 'uploads', 'shops'), 'shop');
// Public
router.get('/shops', getShops);
router.get('/shops/:id', getShopById);
// Admin only
router.post('/shops', authenticateToken, authorizeRole('admin'), upload.single('image'), createShop);
router.put('/shops/:id', authenticateToken, authorizeRole('admin'), upload.single('image'), updateShop);
router.delete('/shops/:id', authenticateToken, authorizeRole('admin'), deleteShop);
module.exports = router;
