
// Check if user has required role
exports.checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Not authenticated'
            });
        }

        // Convert single role string to array for flexibility
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Always allow 'admin' (Super Admin) to access everything
        if (req.user.role === 'admin') {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log(`❌ Access denied. User role: ${req.user.role}, Required: ${allowedRoles.join(' or ')}`);
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        // console.log(`✅ Role authorized: ${req.user.role}`);
        next();
    };
};
