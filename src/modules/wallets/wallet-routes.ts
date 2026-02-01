// ============================================================================
// FILE: src/modules/wallets/wallet-routes.ts
// WALLET ROUTES - Definition of wallet endpoints
// ============================================================================

import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validation.middleware";
import { walletValidation } from "./wallet.validation";

const router: Router = Router();
const controller = new WalletController();
const authMiddleware = new AuthMiddleware();

/**
 * All wallet routes require authentication
 */
router.use(authMiddleware.authenticate);

/**
 * @route GET /api/v1/wallets/info
 */
router.get("/info", controller.getWalletInfo);

/**
 * @route POST /api/v1/wallets/virtual-accounts
 */
router.post("/virtual-accounts", controller.initializeVirtualAccount);

/**
 * @route GET /api/v1/wallets/transactions
 */
router.get("/transactions", controller.getTransactionHistory);

/**
 * @route POST /api/v1/wallets/pin/set
 */
router.post("/pin/set", validate(walletValidation.setPin), controller.setPin);

/**
 * @route POST /api/v1/wallets/pin/change
 */
router.post("/pin/change", validate(walletValidation.changePin), controller.changePin);

export default router;
