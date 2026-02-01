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
    contentSecurityPolicy: false, // Disable CSP temporarily to rule it out
  }),
);

app.use(
  cors({
    origin: true, // Echoes the request origin automatically
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Fingerprint", "X-App-Version"],
    exposedHeaders: ["Set-Cookie", "Authorization"],
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
  max: 1000, // Increased for development/testing
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
