"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFrontendCorsMiddleware = createFrontendCorsMiddleware;
const cors_1 = __importDefault(require("cors"));
function parseFrontendOrigins(value) {
    if (!value)
        return [];
    const origins = new Set();
    for (const entry of value.split(',')) {
        const candidate = entry.trim();
        if (!candidate)
            continue;
        try {
            const url = new URL(candidate);
            if ((url.protocol === 'https:' || url.protocol === 'http:') &&
                url.username === '' &&
                url.password === '' &&
                url.pathname === '/' &&
                url.search === '' &&
                url.hash === '') {
                origins.add(url.origin);
            }
        }
        catch {
            continue;
        }
    }
    return [...origins];
}
function createFrontendCorsMiddleware(frontendOrigin = process.env.FRONTEND_ORIGIN ??
    (process.env.NODE_ENV === 'production'
        ? undefined
        : 'http://localhost:3000,http://127.0.0.1:3000')) {
    const allowedOrigins = parseFrontendOrigins(frontendOrigin);
    const corsMiddleware = (0, cors_1.default)({
        origin: (origin, callback) => {
            callback(null, Boolean(origin && allowedOrigins.includes(origin)));
        },
        credentials: true,
    });
    return (req, res, next) => {
        const origin = req.get('Origin');
        if (!origin)
            return next();
        if (!allowedOrigins.includes(origin)) {
            return res.status(403).json({
                success: false,
                message: 'Origin tidak diizinkan.',
            });
        }
        return corsMiddleware(req, res, next);
    };
}
exports.default = createFrontendCorsMiddleware();
