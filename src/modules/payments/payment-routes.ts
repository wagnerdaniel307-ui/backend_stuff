// ============================================================================
// FILE: src/modules/payments/payment-routes.ts
// PAYMENT ROUTES - Definition of public payment/webhook endpoints
// ============================================================================

import { Router } from "express";
import { WebhookController } from "./webhook.controller";

const router: Router = Router();
const controller = new WebhookController();

// Webhooks are PUBLIC endpoints but secured by provider signatures
router.get("/webhooks/squad", (req, res) => {
  res.status(200).json({ status: "active", message: "Squad Webhook Endpoint is ready for POST requests" });
});
router.post("/webhooks/squad", controller.handleSquad);

export default router;
