const { errorResponse } = require('../utils/responseHandler');

/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle JSON body parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 400, 'Malformed JSON payload provided.');
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    return errorResponse(res, 409, `A record with this ${target} already exists.`, {
      [target]: `Duplicate value detected for ${target}`,
    });
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Requested record was not found.');
  }

  // Handle Prisma foreign key constraint failure (P2003)
  if (err.code === 'P2003') {
    return errorResponse(res, 400, 'Invalid related record reference.');
  }

  // Default internal server error
  const message = err.isOperational ? err.message : 'An unexpected internal error occurred.';
  return errorResponse(res, err.statusCode || 500, message);
};

module.exports = errorHandler;
