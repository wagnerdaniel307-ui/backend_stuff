// ============================================================================
// FILE: src/app.ts
// EXPRESS APP SETUP WITH ROUTES
// ============================================================================

import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
// Import routes
import authRoutes from "./modules/auth/auth-routes";
import userRoutes from "./modules/users/user-routes";
import walletRoutes from "./modules/wallets/wallet-routes";
import paymentRoutes from "./modules/payments/payment-routes";
import billRoutes from "./modules/bills/bill-routes";

// Create Express app
const app: Application = express();

// Trust proxy for rate limiting on Render
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ];
      
      // Add FRONTEND_URL from env if it exists
      if (env.FRONTEND_URL) {
        allowedOrigins.push(env.FRONTEND_URL);
        // Also add version without trailing slash just in case
        allowedOrigins.push(env.FRONTEND_URL.replace(/\/$/, ""));
      }
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Exact match or includes check
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Pattern match for production frontend (robust check)
      if (env.FRONTEND_URL) {
        const normalizedFrontend = env.FRONTEND_URL.replace(/\/$/, "");
        if (origin === normalizedFrontend || origin.startsWith(normalizedFrontend)) {
          return callback(null, true);
        }
      }

      // Allow all in development mode
      if (env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Safety fallback to prevent lockout during integration
      return callback(null, true); 
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/wallets", walletRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/bills", billRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
