// ============================================================================
// FILE: src/modules/bills/bill-routes.ts
// BILL ROUTES - Routes for purchasing airtime, data, and bills
// ============================================================================

import { Router } from "express";
import * as controller from "./bill.controller";
import { AuthMiddleware } from "../../middleware/auth.middleware";

const router: Router = Router();
const authMiddleware = new AuthMiddleware();

/**
 * Public Routes
 */
router.get("/data-networks", controller.getDataNetworks);
router.get("/data-plans", controller.getDataPlans);
router.get("/cable-providers", controller.getCableProviders);
router.get("/cable-plans", controller.getCablePlans);
router.get("/electricity-plans", controller.getElectricityPlans);

/**
 * Protected Routes
 */
router.use(authMiddleware.authenticate);

router.post("/airtime", controller.purchaseAirtime);
router.post("/data", controller.purchaseData);
router.post("/verify-customer", controller.verifyCustomer);
router.post("/electricity", controller.purchaseElectricity);
router.post("/cable-tv", controller.purchaseCableTv);

// PINs & Topupmate Services
router.get("/topupmate/services", controller.getTopupmateServices);
router.post("/exam-pins", controller.purchaseExamPin);
router.post("/recharge-pins", controller.purchaseRechargePin);
router.post("/data-pins", controller.purchaseDataPin);

export default router;
