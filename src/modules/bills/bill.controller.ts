// ============================================================================
// FILE: src/modules/bills/bill.controller.ts
// BILL CONTROLLER - API endpoints for Peyflex services
// ============================================================================

import { Request, Response, NextFunction } from "express";
import { BillService } from "./bill.service";

const billService = new BillService();

export const purchaseAirtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mobile_number, network, amount, requestId } = req.body;
    
    const result = await billService.purchaseAirtime(userId, { 
      mobile_number, 
      network, 
      amount,
      requestId 
    });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const purchaseData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { mobile_number, network, plan_code, amount, planName, requestId } = req.body;
    
    const result = await billService.purchaseData(userId, { 
      mobile_number, 
      network, 
      plan_code, 
      amount, 
      planName,
      requestId 
    });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getDataNetworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const networks = await billService.getDataNetworks();
    res.status(200).json({ status: "success", data: networks });
  } catch (error) {
    next(error);
  }
};

export const getDataPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { networkId } = req.query;
    const plans = await billService.getDataPlans(networkId as string);
    res.status(200).json({ status: "success", data: plans });
  } catch (error) {
    next(error);
  }
};

export const verifyCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, ...data } = req.body; // type: 'cable' | 'electricity'
    const result = await billService.verifyCustomer(type, data);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const purchaseElectricity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { meter_number, provider, meter_type, amount, requestId } = req.body;
    
    const result = await billService.purchaseElectricity(userId, { 
      meter_number, 
      provider, 
      meter_type, 
      amount,
      requestId 
    });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const purchaseCableTv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { provider, iuc_number, plan_code, amount, plan_name, requestId } = req.body;
    
    const result = await billService.purchaseCableTv(userId, { 
      provider, 
      iuc_number, 
      plan_code, 
      amount, 
      plan_name,
      requestId 
    });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getCableProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await billService.getCableProviders();
    res.status(200).json({ status: "success", data: providers });
  } catch (error) {
    next(error);
  }
};

export const getCablePlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { providerId } = req.query;
    const plans = await billService.getCablePlans(providerId as string);
    res.status(200).json({ status: "success", data: plans });
  } catch (error) {
    next(error);
  }
};

export const getElectricityPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { providerId } = req.query;
    const plans = await billService.getElectricityPlans(providerId as string);
    res.status(200).json({ status: "success", data: plans });
  } catch (error) {
    next(error);
  }
};

export const purchaseExamPin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { provider, quantity, amount, requestId } = req.body;
    const result = await billService.purchaseExamPin(userId, { provider, quantity, amount, requestId });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const purchaseRechargePin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { network, quantity, plan, amount, businessname, requestId } = req.body;
    const result = await billService.purchaseRechargePin(userId, { network, quantity, plan, amount, businessname, requestId });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const purchaseDataPin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { network, quantity, data_plan, amount, businessname, requestId } = req.body;
    const result = await billService.purchaseDataPin(userId, { network, quantity, data_plan, amount, businessname, requestId });
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};

export const getTopupmateServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service } = req.query;
    const result = await billService.getTopupmateServices(service as string);
    res.status(200).json({ status: "success", data: result });
  } catch (error) {
    next(error);
  }
};
