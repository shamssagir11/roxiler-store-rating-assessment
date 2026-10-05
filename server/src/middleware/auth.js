const prisma = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Authentication Middleware: Validates Bearer JWT Token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication required. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 401, 'Authentication required. Invalid token format.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Session expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token.');
    }

    // Fetch user details from database to ensure user still exists and role is fresh
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return errorResponse(res, 500, 'Authentication error occurred.');
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Allowed roles for the endpoint (e.g. 'ADMIN', 'STORE_OWNER', 'USER')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
