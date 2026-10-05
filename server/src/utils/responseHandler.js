/**
 * Standard API Success Response
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Human readable message
 * @param {any} data Response payload
 */
const successResponse = (res, statusCode = 200, message = 'Operation successful', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standard API Error Response
 * @param {Response} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {string} message Human readable error message
 * @param {any} errors Specific error details/field errors
 */
const errorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
