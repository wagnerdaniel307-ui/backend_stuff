// ============================================================================
// FILE: src/config/env.ts
// ============================================================================

import dotenv from "dotenv";

dotenv.config();

export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000"),
  APP_NAME: process.env.APP_NAME || "GraceBills Backend",
  APP_URL: process.env.APP_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_EXPIRATION: (process.env.JWT_ACCESS_EXPIRATION || "15m") as
    | string
    | number,
  JWT_REFRESH_EXPIRATION: (process.env.JWT_REFRESH_EXPIRATION || "7d") as
    | string
    | number,

  // Email (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",
  EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || "",
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@gracebills.com",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",

  // Squad (Payments)
  SQUAD_SECRET_KEY: process.env.SQUAD_SECRET_KEY || "",
  SQUAD_PUBLIC_KEY: process.env.SQUAD_PUBLIC_KEY || "",
  SQUAD_BASE_URL: process.env.SQUAD_BASE_URL || "https://api-d.squadco.com",
  SQUAD_BENEFIT_ACCOUNT: process.env.SQUAD_BENEFIT_ACCOUNT || "",

  // Peyflex
  PEYFLEX_API_TOKEN: process.env.PEYFLEX_API_TOKEN || "",
  PEYFLEX_BASE_URL: process.env.PEYFLEX_BASE_URL || "https://client.peyflex.com.ng",

  // Topupmate
  TOPUPMATE_API_KEY: process.env.TOPUPMATE_API_KEY || "",
  TOPUPMATE_BASE_URL: process.env.TOPUPMATE_BASE_URL || "https://connect.topupmate.com/api",
};

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "RESEND_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "PEYFLEX_API_TOKEN",
  "TOPUPMATE_API_KEY",
  "SQUAD_SECRET_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}