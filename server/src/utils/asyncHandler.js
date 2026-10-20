/**
 * Wraps an asynchronous Express route handler or middleware.
 * Catches any rejected promises or thrown exceptions and automatically forwards
 * them to Express's next() error handling chain.
 *
 * @param {Function} fn - Async controller or middleware function (req, res, next)
 * @returns {Function} Standard Express request handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
