"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
// Simple in-memory token buckets. Use Redis in production.
const userBuckets = new Map();
let globalBucket = { tokens: 1000, lastRefill: Date.now() };
const refill = (bucket, ratePerMinute, capacity) => {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = (elapsed / 60000) * ratePerMinute;
    if (tokensToAdd > 0) {
        bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;
    }
};
const rateLimit = (opts) => {
    const perUserRate = opts?.perUserRate ?? 20; // 20 requests/min default
    const perUserCapacity = opts?.perUserCapacity ?? 40;
    const globalRate = opts?.globalRate ?? 500; // global tokens/min
    const globalCapacity = opts?.globalCapacity ?? 1000;
    return (req, res, next) => {
        try {
            // identify user (fallback to IP)
            const userId = req.user?._id || req.ip || "anonymous";
            // init user bucket
            if (!userBuckets.has(userId)) {
                userBuckets.set(userId, { tokens: perUserCapacity, lastRefill: Date.now() });
            }
            const userBucket = userBuckets.get(userId);
            // refill buckets
            refill(userBucket, perUserRate, perUserCapacity);
            refill(globalBucket, globalRate, globalCapacity);
            // check tokens
            if (userBucket.tokens < 1) {
                const retrySeconds = Math.ceil((1 - userBucket.tokens) * (60000 / perUserRate));
                res.setHeader("Retry-After", String(retrySeconds));
                return res.status(429).json({ message: "Rate limit exceeded for user", retryAfter: retrySeconds });
            }
            if (globalBucket.tokens < 1) {
                const retrySeconds = Math.ceil((1 - globalBucket.tokens) * (60000 / globalRate));
                res.setHeader("Retry-After", String(retrySeconds));
                return res.status(429).json({ message: "Global rate limit exceeded", retryAfter: retrySeconds });
            }
            // consume tokens
            userBucket.tokens -= 1;
            globalBucket.tokens -= 1;
            return next();
        }
        catch (err) {
            console.error("RateLimit middleware error:", err);
            return next();
        }
    };
};
exports.rateLimit = rateLimit;
exports.default = exports.rateLimit;
