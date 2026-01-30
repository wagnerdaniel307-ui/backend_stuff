import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import crypto from "crypto";

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRATION as SignOptions["expiresIn"],
    };
    return jwt.sign({ userId }, env.JWT_SECRET, options);
  }

  static generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRATION as SignOptions["expiresIn"],
    };
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, options);
  }

  static verifyAccessToken(token: string): { userId: string } {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string };
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  }

  static generateReferralCode(firstName: string, lastName: string): string {
    const random = crypto.randomBytes(3).toString("hex").toUpperCase();
    const initials = (firstName[0] + lastName[0]).toUpperCase();
    return `${initials}${random}`;
  }

  static getRefreshTokenExpiry(): Date {
    const expiration = env.JWT_REFRESH_EXPIRATION.toString();
    const days = parseInt(expiration.replace("d", ""));
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Generate 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Get OTP expiry time (10 minutes from now)
   */
  static getOTPExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Check if OTP is expired
   */
  static isOTPExpired(expiryDate: Date | null): boolean {
    if (!expiryDate) return true;
    return new Date() > expiryDate;
  }

  /**
   * Generate secure password reset token
   * Uses crypto.randomBytes for cryptographically strong random token
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Get password reset token expiry time (1 hour from now)
   */
  static getPasswordResetExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  }

  /**
   * Check if password reset token is expired
   */
  static isResetTokenExpired(expiryDate: Date | null): boolean {
    if (!expiryDate) return true;
    return new Date() > expiryDate;
  }
}