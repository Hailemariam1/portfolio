import { ApiError } from '../utils/http.js';
import env from '../config/env.js';

export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api')) {
    return next(ApiError.notFound(`No API route matches ${req.method} ${req.originalUrl}`));
  }
  return next();
}

export function errorHandler(error, req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Something went wrong.';
  let details = error.details;

  if (error.name === 'ValidationError' && error.errors) {
    status = 422;
    message = 'Please check the highlighted fields.';
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'That identifier is not valid.';
  } else if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    message = `That ${field} is already in use.`;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'The request body was not valid JSON.';
  }

  if (status >= 500) {
    console.error('[error]', error);
  }

  res.status(status).json({
    error: status >= 500 && env.isProd ? 'Something went wrong on the server.' : message,
    ...(details ? { details } : {})
  });
}
