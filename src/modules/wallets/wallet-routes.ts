// ============================================================================
// FILE: src/modules/wallets/wallet-routes.ts
// WALLET ROUTES - Definition of wallet endpoints
// ============================================================================

import { Router } from "express";
import { WalletController } from "./wallet.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";

const router = Router();
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

export default router;
