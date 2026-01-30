// ============================================================================
// FILE: src/services/cloudinary.service.ts
// CLOUDINARY SERVICE - Logic for uploading to Cloudinary
// ============================================================================

import { cloudinary } from "../config/cloudinary";
import { AppError } from "../middleware/error.middleware";
import { ErrorCodes } from "../constants/error-codes";
import { env } from "../config/env";
import { UploadApiResponse } from "cloudinary";

export class CloudinaryService {
  /**
   * Upload an image buffer to Cloudinary
   */
  async uploadImage(
    fileBuffer: Buffer,
    folder: string = "avatars"
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(
              new AppError(500, "Image upload failed", ErrorCodes.SERVER_ERROR)
            );
          }
          if (!result) {
             return reject(
              new AppError(500, "Image upload failed - no result", ErrorCodes.SERVER_ERROR)
            );
          }
          resolve(result);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      // We don't necessarily want to throw here as it might be a cleanup task
    }
  }
}
