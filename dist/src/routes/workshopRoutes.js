"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const imageUpload_1 = require("../middleware/imageUpload");
const { getWorkshops, getWorkshopById, createWorkshop, updateWorkshop, deleteWorkshop, } = require('../controllers/workshopController');
const authenticateToken = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');
const router = express_1.default.Router();
const upload = (0, imageUpload_1.createImageUpload)(path_1.default.join(process.cwd(), 'uploads', 'workshops'), 'workshop');
// Public
router.get('/workshops', getWorkshops);
router.get('/workshops/:id', getWorkshopById);
// Admin only
router.post('/workshops', authenticateToken, authorizeRole('admin'), upload.single('image'), createWorkshop);
router.put('/workshops/:id', authenticateToken, authorizeRole('admin'), upload.single('image'), updateWorkshop);
router.delete('/workshops/:id', authenticateToken, authorizeRole('admin'), deleteWorkshop);
module.exports = router;
