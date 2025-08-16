const jwt = require('jsonwebtoken');
const User = require('../models/auth');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format.'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            next();
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
                error: jwtError.message
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have admin privileges.'
        });
    }
    next()
}

const authorize = (req, res, next) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. only users can make orders.'
        });
    }
    next();
}
module.exports = { authMiddleware, adminOnly, authorize };