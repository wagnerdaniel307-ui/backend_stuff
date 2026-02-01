import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { ErrorCodes } from "../../constants/error-codes";
import { SquadService } from "../../services/squad.service";

export class BankingService {
  private squadService: SquadService;

  constructor() {
    this.squadService = new SquadService();
  }

  /**
   * Get all banks (for dropdown)
   */
  async getBankList() {
    // We can hardcode common Nigerian banks or fetch from Squad if they have a list API
    // For now, let's assume the frontend provides the bank name and code
    // Optimization: We could add a Squad "Get Banks" call here later
    return [
      { id: "058", name: "GTBank" },
      { id: "011", name: "First Bank" },
      { id: "032", name: "Union Bank" },
      { id: "033", name: "UBA" },
      { id: "035", name: "Wema Bank" },
      { id: "044", name: "Access Bank" },
      { id: "057", name: "Zenith Bank" },
      { id: "050", name: "Ecobank" },
      { id: "070", name: "Fidelity Bank" },
      { id: "214", name: "First City Monument Bank" },
      { id: "215", name: "Unity Bank" },
      { id: "221", name: "Heritage Bank" },
      { id: "232", name: "Sterling Bank" },
      { id: "301", name: "Jaiz Bank" },
      { id: "068", name: "Standard Chartered Bank" },
      { id: "304", name: "Stanbic IBTC Bank" },
      { id: "101", name: "Providus Bank" },
      { id: "102", name: "Sun Trust Bank" },
      { id: "103", name: "Globus Bank" },
      { id: "104", name: "Titan Trust Bank" },
      { id: "999", name: "Kuda Bank" },
      { id: "50211", name: "Palmpay" },
      { id: "50515", name: "Moniepoint" },
      { id: "100004", name: "Opay" },
    ];
  }

  /**
   * Save a new bank account
   */
  async addBankAccount(userId: string, data: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) {
    // Check if account already saved
    const existing = await prisma.bankAccount.findFirst({
      where: {
        userId,
        accountNumber: data.accountNumber,
        bankCode: data.bankCode
      }
    });

    if (existing) {
      throw new AppError(400, "Bank account already saved", ErrorCodes.VALIDATION_ERROR);
    }

    return await prisma.bankAccount.create({
      data: {
        userId,
        bankName: data.bankName,
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName
      }
    });
  }

  /**
   * Get user's saved bank accounts
   */
  async getUserBankAccounts(userId: string) {
    return await prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Delete a saved bank account
   */
  async deleteBankAccount(userId: string, accountId: string) {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) {
      throw new AppError(404, "Bank account not found", ErrorCodes.VALIDATION_ERROR);
    }

    return await prisma.bankAccount.delete({
      where: { id: accountId }
    });
  }
}
