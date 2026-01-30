// ============================================================================
// FILE: src/middleware/upload.middleware.ts
// UPLOAD MIDDLEWARE - Multer configuration for image uploads
// ============================================================================

import multer from "multer";
import { AppError } from "./error.middleware";
import { ErrorCodes } from "../constants/error-codes";

// Use memory storage to avoid saving files locally (we upload to Cloudinary directly)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new AppError(400, "Invalid file type. Only images are allowed.", ErrorCodes.VALIDATION_ERROR),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
