// ============================================================================
// FILE: src/middleware/validation.middleware.ts
// VALIDATION MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ResponseUtil } from "../utils/response.util";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues?.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return ResponseUtil.error(res, "Validation failed", 400, errors);
      }
      next(error);
    }
  };
};
