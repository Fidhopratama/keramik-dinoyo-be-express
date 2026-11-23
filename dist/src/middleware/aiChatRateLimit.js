"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const buckets = new Map();
function aiChatRateLimit(req, res, next) {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Token autentikasi diperlukan.' });
        return;
    }
    const now = Date.now();
    if (buckets.size > 1000) {
        for (const [id, value] of buckets) {
            if (value.resetAt <= now)
                buckets.delete(id);
        }
    }
    const bucket = buckets.get(userId);
    if (!bucket || bucket.resetAt <= now) {
        buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        next();
        return;
    }
    if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
        res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
        res.status(429).json({
            success: false,
            message: 'Batas pertanyaan Dinoyo AI tercapai. Coba lagi sebentar.',
        });
        return;
    }
    bucket.count += 1;
    next();
}
module.exports = aiChatRateLimit;
