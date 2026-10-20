import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Express middleware for request schema validation using Zod.
 * Validates any combination of body, query, and params against the provided Zod schemas.
 * On success, assigns validated/transformed data back onto req.
 * On failure, terminates the request with HTTP 422 Unprocessable Entity and structured field errors.
 *
 * @param {Object} schemas
 * @param {import('zod').ZodTypeAny} [schemas.body] - Schema for req.body
 * @param {import('zod').ZodTypeAny} [schemas.query] - Schema for req.query
 * @param {import('zod').ZodTypeAny} [schemas.params] - Schema for req.params
 * @returns {import('express').RequestHandler}
 */
export const validateRequest = (schemas = {}) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      return next();
    } catch (err) {
      if (err instanceof ZodError || err?.errors) {
        const issues = err.issues || err.errors || [];
        const formattedErrors = issues.map((issue) => ({
          field: issue.path.length > 0 ? issue.path.join('.') : 'root',
          message: issue.message,
        }));

        return ApiResponse.error(res, {
          statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: RESPONSE_MESSAGES.VALIDATION_ERROR,
          errors: formattedErrors,
        });
      }
      return next(err);
    }
  };
};
