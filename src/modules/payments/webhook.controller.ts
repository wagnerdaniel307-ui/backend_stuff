import { Request, Response } from "express";
import { SquadService } from "../../services/squad.service";
import { WalletService } from "../wallets/wallet.service";
import { prisma } from "../../config/database";

export class WebhookController {
  private squadService: SquadService;
  private walletService: WalletService;

  constructor() {
    this.squadService = new SquadService();
    this.walletService = new WalletService();
  }

  /**
   * Handle Squad Webhook
   */
  handleSquad = async (req: Request, res: Response) => {
    const signature = req.headers["x-squad-encrypted-body"] as string;
    const payload = req.body;

    // 1. Verify Signature
    if (!this.squadService.verifyWebhookSignature(payload, signature)) {
      console.warn("Invalid Squad Webhook Signature received");
      return res.status(401).json({ message: "Invalid signature" });
    }

    console.log("Squad Webhook Received:", JSON.stringify(payload, null, 2));

    try {
      // 2. Process 'charge_successful' event (Virtual Account Transfer)
      // Squad event structure: { Event: 'charge_successful', Body: { ... } }
      if (payload.Event === "charge_successful") {
        const data = payload.Body;
        
        // Check if this is a transfer to a virtual account we know
        const amountPaid = data.amount / 100; // Squad sends amount in Kobo
        const transactionRef = data.transaction_ref;
        const customerIdentifier = data.merchant_customer_id; // We passed userId here

        if (customerIdentifier) {
           // Find wallet by userId (since we used userId as customerIdentifier)
           const wallet = await prisma.wallet.findUnique({
             where: { userId: customerIdentifier }
           });

           if (wallet) {
             // Check if transaction already processed (Idempotency)
             const exists = await prisma.transaction.findUnique({
               where: { reference: transactionRef }
             });

             if (!exists) {
               await this.walletService.creditWallet(
                 wallet.id,
                 amountPaid,
                 transactionRef,
                 `Wallet funding via Squad (${data.bank_code || 'Transfer'})`
               );
               console.log(`Credited wallet ${wallet.id} with N${amountPaid}`);
             } else {
               console.log("Transaction already processed:", transactionRef);
             }
           }
        }
      }

      // Always return 200 to Squad
      return res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing Squad Webhook:", error);
      return res.status(200).send("OK");
    }
  };
}
