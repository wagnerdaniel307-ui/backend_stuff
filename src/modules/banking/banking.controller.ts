import { Response } from "express";
import { asyncHandler } from "../../middleware/error.middleware";
import { ResponseUtil } from "../../utils/response.util";
import { BankingService } from "./banking.service";

export class BankingController {
  private bankingService: BankingService;

  constructor() {
    this.bankingService = new BankingService();
  }

  /**
   * Get all banks
   */
  getBanks = asyncHandler(async (req: any, res: Response) => {
    const banks = await this.bankingService.getBankList();
    ResponseUtil.success(res, "Bank list retrieved", { banks });
  });

  /**
   * Add new bank account
   */
  addAccount = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const { bankName, bankCode, accountNumber, accountName } = req.body;

    const account = await this.bankingService.addBankAccount(userId, {
      bankName,
      bankCode,
      accountNumber,
      accountName,
    });

    ResponseUtil.success(res, "Bank account added successfully", { account });
  });

  /**
   * Get user's saved accounts
   */
  getAccounts = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const accounts = await this.bankingService.getUserBankAccounts(userId);
    ResponseUtil.success(res, "Saved bank accounts retrieved", { accounts });
  });

  /**
   * Delete saved account
   */
  deleteAccount = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    await this.bankingService.deleteBankAccount(userId, id);
    ResponseUtil.success(res, "Bank account deleted successfully");
  });
}
