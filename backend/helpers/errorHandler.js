/**
 * Wraps an async route handler to automatically catch and forward errors.
 * Use on any async controller function to avoid repetitive try/catch blocks.
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Defines a custom error format.
 */
class HttpError extends Error {
  /**
   * @param {number} statusCode HTTP status code you want to return
   * @param {string} message Human‐readable error message
  */
  constructor(statusCode, message) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { asyncHandler, HttpError }