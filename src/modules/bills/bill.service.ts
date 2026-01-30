// ============================================================================
// FILE: src/modules/bills/bill.service.ts
// BILL SERVICE - Coordinating wallet logic and Peyflex API
// ============================================================================

import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { ErrorCodes } from "../../constants/error-codes";
import { PeyflexService } from "../../services/peyflex.service";
import { TopupmateService } from "../../services/topupmate.service";
import { WalletService } from "../wallets/wallet.service";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export class BillService {
  private peyflexService: PeyflexService;
  private topupmateService: TopupmateService;
  private walletService: WalletService;

  constructor() {
    this.peyflexService = new PeyflexService();
    this.topupmateService = new TopupmateService();
    this.walletService = new WalletService();
  }

  /**
   * Universal Purchase Logic with Idempotency Support
   * Handles multiple providers (Peyflex, Topupmate, etc.)
   */
  private async processPurchase(params: {
    userId: string;
    amount: number;
    type: TransactionType;
    description: string;
    providerCall: (requestId: string) => Promise<any>;
    metadata?: any;
    requestId?: string; // Client-provided idempotency key
  }) {
    const { userId, amount, type, description, providerCall, metadata, requestId: clientRequestId } = params;
    
    // 1. Idempotency Check: See if this requestId already exists
    if (clientRequestId) {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: clientRequestId }
      });
      
      if (existingTransaction) {
        return { 
          status: existingTransaction.status, 
          data: existingTransaction.metadata, 
          isDuplicate: true 
        };
      }
    }

    const wallet = await this.walletService.getWallet(userId);

    if (wallet.balance.toNumber() < amount) {
      throw new AppError(400, "Insufficient wallet balance", ErrorCodes.INSUFFICIENT_FUNDS);
    }

    const requestId = clientRequestId || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await prisma.$transaction(async (tx) => {
      // 2. Create Transaction (PENDING)
      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.minus(amount);

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: new Prisma.Decimal(amount),
          type,
          status: "PENDING",
          reference: requestId,
          description,
          balanceBefore,
          balanceAfter,
          metadata: {
            ...metadata,
            requestId,
          },
        },
      });

      // 3. Debit Wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      try {
        // 4. Call Provider API
        const response = await providerCall(requestId);

        // Standardizing success check across providers
        const isSuccess = 
          response.status === "success" || 
          response.status === "successful" || 
          response.Status === "successful";

        if (isSuccess) {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { 
              status: "SUCCESS",
              metadata: {
                ...transaction.metadata as object,
                providerResponse: response
              }
            },
          });
          return { status: "SUCCESS", data: response };
        } else if (response.status === "processing") {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { 
              metadata: {
                ...transaction.metadata as object,
                providerResponse: response
              }
            },
          });
          return { status: "PENDING", data: response };
        } else {
          throw new Error(response.message || response.msg || "Provider error");
        }
      } catch (error: any) {
        console.error("Purchase Execution Error:", error.message);
        
        // Refund
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: balanceBefore },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: "FAILED",
            description: `${description} (Failed: ${error.message})`,
            balanceAfter: balanceBefore,
          },
        });

        throw new AppError(500, error.message || "Transaction failed and was refunded", ErrorCodes.SERVER_ERROR);
      }
    });
  }

  /**
   * Airtime Purchase
   */
  async purchaseAirtime(userId: string, data: {
    mobile_number: string;
    network: string; 
    amount: number;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Airtime TopUp for ${data.mobile_number}`,
      metadata: { mobile_number: data.mobile_number, network: data.network, category: "AIRTIME" },
      requestId: data.requestId,
      providerCall: () => this.peyflexService.purchaseAirtime({
        network: data.network,
        mobile_number: data.mobile_number,
        amount: data.amount,
        airtime_type: "VTU"
      })
    });
  }

  /**
   * Data Purchase
   */
  async purchaseData(userId: string, data: {
    mobile_number: string;
    network: string; 
    plan_code: string;
    amount: number; 
    planName: string;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Data Purchase (${data.planName}) for ${data.mobile_number}`,
      metadata: { mobile_number: data.mobile_number, network: data.network, plan: data.planName, category: "DATA" },
      requestId: data.requestId,
      providerCall: () => this.peyflexService.purchaseData({
        network: data.network,
        mobile_number: data.mobile_number,
        plan_code: data.plan_code
      })
    });
  }

  /**
   * Electricity Purchase
   */
  async purchaseElectricity(userId: string, data: {
    meter_number: string;
    provider: string; 
    meter_type: "Prepaid" | "Postpaid";
    amount: number;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Electricity Recharge for ${data.meter_number}`,
      metadata: { meter_number: data.meter_number, provider: data.provider, meter_type: data.meter_type, category: "ELECTRICITY" },
      requestId: data.requestId,
      providerCall: () => this.peyflexService.purchaseElectricity({
        provider: data.provider,
        meter_number: data.meter_number,
        amount: data.amount,
        meter_type: data.meter_type
      })
    });
  }

  /**
   * TV Purchase
   */
  async purchaseCableTv(userId: string, data: {
    provider: string;
    iuc_number: string;
    plan_code: string;
    amount: number;
    plan_name: string;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Cable TV (${data.plan_name}) for ${data.iuc_number}`,
      metadata: { iuc_number: data.iuc_number, provider: data.provider, plan: data.plan_name, category: "CABLE_TV" },
      requestId: data.requestId,
      providerCall: () => this.peyflexService.purchaseCableTv({
        provider: data.provider,
        iuc_number: data.iuc_number,
        plan_code: data.plan_code
      })
    });
  }

  /**
   * Exam Pin Purchase (Topupmate)
   */
  async purchaseExamPin(userId: string, data: {
    provider: string;
    quantity: number;
    amount: number;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Exam Pin Purchase (${data.provider}) x${data.quantity}`,
      metadata: { category: "EXAM_PIN", provider: data.provider, quantity: data.quantity },
      requestId: data.requestId,
      providerCall: (requestId) => this.topupmateService.purchaseExamPin({
        provider: data.provider,
        quantity: data.quantity,
        ref: requestId
      })
    });
  }

  /**
   * Recharge Pin Purchase (Topupmate)
   */
  async purchaseRechargePin(userId: string, data: {
    network: string;
    quantity: number;
    plan: string;
    amount: number;
    businessname: string;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Recharge Pin Purchase (${data.network}) x${data.quantity}`,
      metadata: { category: "RECHARGE_PIN", network: data.network, quantity: data.quantity, plan: data.plan },
      requestId: data.requestId,
      providerCall: (requestId) => this.topupmateService.purchaseRechargePin({
        network: data.network,
        quantity: data.quantity,
        plan: data.plan,
        businessname: data.businessname,
        ref: requestId
      })
    });
  }

  /**
   * Data Pin Purchase (Topupmate)
   */
  async purchaseDataPin(userId: string, data: {
    network: string;
    quantity: number;
    data_plan: string;
    amount: number;
    businessname: string;
    requestId?: string;
  }) {
    return this.processPurchase({
      userId,
      amount: data.amount,
      type: "PURCHASE",
      description: `Data Pin Purchase (${data.network}) x${data.quantity}`,
      metadata: { category: "DATA_PIN", network: data.network, quantity: data.quantity, data_plan: data.data_plan },
      requestId: data.requestId,
      providerCall: (requestId) => this.topupmateService.purchaseDataPin({
        network: data.network,
        quantity: data.quantity,
        data_plan: data.data_plan,
        businessname: data.businessname,
        ref: requestId
      })
    });
  }

  async getTopupmateServices(serviceName: string) {
    return this.topupmateService.getServices(serviceName);
  }

  /**
   * Helper: Get Variations
   */
  async getDataNetworks() {
    return this.peyflexService.getDataNetworks();
  }

  async getDataPlans(networkId: string) {
    return this.peyflexService.getDataPlans(networkId);
  }

  async verifyCustomer(type: "cable" | "electricity", data: any) {
    return this.peyflexService.verifyCustomer(type, data);
  }

  async getCableProviders() {
    return this.peyflexService.getCableProviders();
  }

  async getCablePlans(providerId: string) {
    return this.peyflexService.getCablePlans(providerId);
  }

  async getElectricityPlans() {
    return this.peyflexService.getElectricityPlans();
  }
}
