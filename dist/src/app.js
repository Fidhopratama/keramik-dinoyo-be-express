"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const aiAnalysisRoutes = require('./routes/aiAnalysisRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Keramik Dinoyo API berjalan.',
    });
});
app.use('/api', authRoutes);
app.use('/api', shopRoutes);
app.use('/api', productRoutes);
app.use('/api', workshopRoutes);
app.use('/api', transactionRoutes);
app.use('/api', reviewRoutes);
app.use('/api', aiAnalysisRoutes);
app.use('/api', auditLogRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', categoryRoutes);
module.exports = app;
