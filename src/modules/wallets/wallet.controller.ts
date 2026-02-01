// ============================================================================
// FILE: src/modules/wallets/wallet.controller.ts
// WALLET CONTROLLER - Request handlers for wallet operations
// ============================================================================

import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error.middleware";
import { ResponseUtil } from "../../utils/response.util";
import { WalletService } from "./wallet.service";

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  /**
   * Get wallet balance and virtual accounts
   */
  getWalletInfo = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const wallet = await this.walletService.getWallet(userId);
    
    ResponseUtil.success(res, "Wallet info retrieved", { wallet });
  });

  /**
   * Initialize/Create virtual accounts for user
   */
  initializeVirtualAccount = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const accounts = await this.walletService.createVirtualAccount(userId);
    
    ResponseUtil.success(res, "Virtual accounts initialized", { accounts });
  });

  /**
   * Get transaction history
   */
  getTransactionHistory = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await this.walletService.getTransactions(userId, limit, offset);
    
    ResponseUtil.success(res, "Transaction history retrieved", { transactions });
  });

  /**
   * Set Wallet Transaction Pin
   */
  setPin = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const { pin } = req.body;

    await this.walletService.setTransactionPin(userId, pin);
    
    ResponseUtil.success(res, "Transaction PIN set successfully");
  });

  /**
   * Change Wallet Transaction Pin
   */
  changePin = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const { currentPin, newPin } = req.body;

    await this.walletService.changeTransactionPin(userId, currentPin, newPin);
    
    ResponseUtil.success(res, "Transaction PIN changed successfully");
  });
}
