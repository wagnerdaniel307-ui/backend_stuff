import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * Create rate limit middleware with custom options
 */
export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      success: false,
      message: options.message || "Too many requests, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: options.message || "Too many requests, please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil(options.windowMs / 1000), // seconds
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health check
      return req.path === "/health";
    },
  });
};

// Preset rate limiters
export const strictRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: "Too many attempts, please try again in 15 minutes.",
});

export const standardRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});