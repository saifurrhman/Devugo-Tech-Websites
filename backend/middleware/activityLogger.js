const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

const activityLogger = async (req, res, next) => {
    // Only log authenticated users
    if (!req.user || !req.user._id) {
        return next();
    }

    // Skip static files, health checks, and OPTIONS requests
    if (req.method === 'OPTIONS' || req.path.startsWith('/uploads') || req.path === '/') {
        return next();
    }

    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // 1. Create Log Entry
        // We run this asynchronously without awaiting to not block the response
        ActivityLog.create({
            user: req.user._id,
            action: `${req.method} ${req.path}`,
            method: req.method,
            path: req.path,
            ip: ip,
            userAgent: userAgent
        }).catch(err => console.error('Activity Log Error:', err.message));

        // 2. Update User's 'Last Active' and 'Last IP' (if your User model supports it)
        // We can update the standard lastLogin field if it's a login request, 
        // but for general activity, we might just rely on the logs.
        // However, tracking "lastActive" on the user document is efficient for "Online Now" status.

        // Assuming we might add `lastActive` to User schema later, or use `lastLogin`.
        // For now, let's just log.

    } catch (error) {
        console.error('Activity Logger Middleware Error:', error);
    }

    next();
};

module.exports = activityLogger;
