import { ApiError } from '../utils/http.js';

/**
 * Validate request params, query and/or body with Zod schemas. Parsed values
 * replace the originals so controllers only ever see sanitised input.
 */
export function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      for (const key of ['params', 'query', 'body']) {
        const schema = schemas[key];
        if (!schema) continue;
        const result = schema.safeParse(req[key] ?? {});
        if (!result.success) {
          const details = result.error.issues.map((issue) => ({
            field: issue.path.join('.') || key,
            message: issue.message
          }));
          throw ApiError.unprocessable('Please check the highlighted fields.', details);
        }
        if (key === 'query') {
          Object.keys(req.query).forEach((existing) => delete req.query[existing]);
          Object.assign(req.query, result.data);
        } else {
          req[key] = result.data;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
