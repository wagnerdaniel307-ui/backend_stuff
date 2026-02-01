// ============================================================================
// FILE: src/modules/wallets/wallet.service.ts
// WALLET SERVICE - Business logic for balance and transactions
// ============================================================================

import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { ErrorCodes } from "../../constants/error-codes";
import { SquadService } from "../../services/squad.service";
import { Prisma } from "@prisma/client";

export class WalletService {
  private squadService: SquadService;

  constructor() {
    this.squadService = new SquadService();
  }

  /**
   * Get wallet by user ID, create if not exists
   */
  async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        virtualAccounts: true,
      },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist (lazy initialization)
      wallet = await prisma.wallet.create({
        data: {
          userId,
        },
        include: {
          virtualAccounts: true,
        },
      });
    }

    return wallet;
  }

  /**
   * Create Squad Virtual Account for User
   */
  async createVirtualAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    const wallet = await this.getWallet(userId);

    // Check if user already has virtual accounts
    if (wallet.virtualAccounts.length > 0) {
      return wallet.virtualAccounts;
    }

    // MUST have BVN to create virtual account
    if (!user.bvn) {
      throw new AppError(
        400,
        "Please update your profile with your BVN (Bank Verification Number) to create a virtual account",
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Format Data for Squad
    const dob = user.dateOfBirth 
      ? new Date(user.dateOfBirth).toLocaleDateString("en-GB") // dd/mm/yyyy
      : "01/01/1990"; // Fallback for sandbox
    
    // Map gender to Squad format (1=Male, 2=Female)
    const genderMap: Record<string, "1" | "2"> = {
      "male": "1",
      "female": "2",
      "m": "1",
      "f": "2"
    };
    const gender = genderMap[user.gender?.toLowerCase() || ""] || "1";

    // Call Squad to create account using user's BVN
    const squadAccount = await this.squadService.createVirtualAccount({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || undefined,
      mobile: user.phone,
      dob: dob, 
      email: user.email,
      bvn: user.bvn, // Already validated above
      gender: gender,
      address: user.address || "Lagos, Nigeria",
      customerIdentifier: userId,
    });

    if (!squadAccount.success || !squadAccount.data) {
       throw new AppError(500, "Squad failed to return account details", ErrorCodes.SERVER_ERROR);
    }

    const { virtual_account_number, first_name, last_name, bank_code } = squadAccount.data;

    if (!virtual_account_number) {
      throw new AppError(500, "Squad response missing account number", ErrorCodes.SERVER_ERROR);
    }

    // Save account to database
    try {
      const savedAccount = await prisma.virtualAccount.create({
        data: {
          walletId: wallet!.id,
          bankName: bank_code === "058" ? "GTBank" : "Squad Bank",
          accountNumber: virtual_account_number,
          accountName: `${first_name} ${last_name}`,
          bankCode: bank_code || "058",
          provider: "squad",
          reference: userId, // Squad uses customer identifier
        },
      });
      return [savedAccount];
    } catch (error: any) {
      // If account number already exists (P2002), it likely belongs to this user anyway or previous attempt failed
      if (error.code === 'P2002') {
         // Return existing account if found
         const existing = await prisma.virtualAccount.findUnique({
            where: { accountNumber: virtual_account_number }
         });
         return existing ? [existing] : [];
      }
      throw error;
    }
  }

  /**
   * Credit Wallet (used by Webhooks)
   */
  async creditWallet(walletId: string, amount: number, reference: string, description: string) {
    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) throw new Error("Wallet not found");

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.plus(amount);

      // 1. Update balance
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter },
      });

      // 2. Log transaction
      await tx.transaction.create({
        data: {
          walletId,
          amount,
          type: "DEPOSIT",
          status: "SUCCESS",
          reference,
          description,
          balanceBefore,
          balanceAfter,
        },
      });

      return updatedWallet;
    });
  }

  /**
   * Get Transaction History
   */
  async getTransactions(userId: string, limit = 20, offset = 0) {
    const wallet = await this.getWallet(userId);

    return prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Set Wallet Transaction PIN
   */
  async setTransactionPin(userId: string, pin: string) {
    const wallet = await this.getWallet(userId);

    if (wallet.pin) {
      throw new AppError(400, "Transaction PIN is already set. Use change PIN instead.", ErrorCodes.VALIDATION_ERROR);
    }

    // Hash the PIN (reusing bcrypt)
    const bcrypt = require("bcryptjs");
    const hashedPin = await bcrypt.hash(pin, 10);

    return await prisma.wallet.update({
      where: { id: wallet.id },
      data: { pin: hashedPin },
    });
  }

  /**
   * Change Wallet Transaction PIN
   */
  async changeTransactionPin(userId: string, currentPin: string, newPin: string) {
    const wallet = await this.getWallet(userId);

    if (!wallet.pin) {
      throw new AppError(400, "Transaction PIN is not set.", ErrorCodes.VALIDATION_ERROR);
    }

    // Verify current PIN
    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(currentPin, wallet.pin);
    if (!isPinValid) {
      throw new AppError(401, "Invalid current transaction PIN", ErrorCodes.INVALID_CREDENTIALS);
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);

    return await prisma.wallet.update({
      where: { id: wallet.id },
      data: { pin: hashedPin },
    });
  }

  /**
   * Verify Transaction PIN (Helper for billing services)
   */
  async verifyTransactionPin(userId: string, pin: string) {
    const wallet = await this.getWallet(userId);

    if (!wallet.pin) {
      throw new AppError(400, "Please set a transaction PIN before performing this action.", ErrorCodes.VALIDATION_ERROR);
    }

    const bcrypt = require("bcryptjs");
    const isPinValid = await bcrypt.compare(pin, wallet.pin);
    
    if (!isPinValid) {
      throw new AppError(401, "Invalid transaction PIN", ErrorCodes.INVALID_CREDENTIALS);
    }

    return true;
  }
}
