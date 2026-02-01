import { Router } from "express";
import { BankingController } from "./banking.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { z } from "zod";

const router: Router = Router();
const controller = new BankingController();
const authMiddleware = new AuthMiddleware();

// Validation schema
const bankingValidation = {
  addAccount: z.object({
    body: z.object({
      bankName: z.string().min(1, "Bank name is required"),
      bankCode: z.string().min(1, "Bank code is required"),
      accountNumber: z.string().length(10, "Account number must be 10 digits").regex(/^[0-9]+$/, "Account number must be numeric"),
      accountName: z.string().min(1, "Account name is required")
    })
  })
};

/**
 * Public routes (or just protected)
 */
router.use(authMiddleware.authenticate);

router.get("/banks", controller.getBanks);
router.get("/accounts", controller.getAccounts);
router.post("/accounts", validate(bankingValidation.addAccount), controller.addAccount);
router.delete("/accounts/:id", controller.deleteAccount);

export default router;
