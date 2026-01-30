// ============================================================================
// FILE: src/services/peyflex.service.ts
// PEYFLEX SERVICE - Integration with Peyflex.com.ng for bills
// ============================================================================

import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { ErrorCodes } from "../constants/error-codes";
import {
  PeyflexUserBalance,
  PeyflexPurchaseResponse,
  PeyflexVerifyResponse,
  PeyflexNetwork,
  PeyflexDataPlan,
  CableProvider,
  ElectricityProvider,
} from "../types/peyflex.types";

export class PeyflexService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.PEYFLEX_BASE_URL,
      headers: {
        Authorization: `Token ${env.PEYFLEX_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get Wallet Balance
   */
  async getBalance(): Promise<number> {
    try {
      const response = await this.axiosInstance.get<PeyflexUserBalance>("/api/user/balance/");
      return response.data.balance;
    } catch (error: any) {
      console.error("Peyflex Balance Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve balance from provider", ErrorCodes.SERVER_ERROR);
    }
  }

  /**
   * Purchase Airtime
   */
  async purchaseAirtime(data: {
    network: string;
    mobile_number: string;
    amount: number;
    airtime_type: "VTU" | "Share and Sell";
  }): Promise<PeyflexPurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<PeyflexPurchaseResponse>("/api/airtime/topup/", data);
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Airtime purchase failed");
    }
  }

  async getDataNetworks(): Promise<PeyflexNetwork[]> {
    try {
      const response = await this.axiosInstance.get("/api/data/networks/");
      // Peyflex returns { networks: [...] } where each item has identifier and name
      if (response.data && Array.isArray(response.data.networks)) {
        return response.data.networks.map((net: any) => ({
          id: net.identifier,
          name: net.name,
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Peyflex Data Networks Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve data networks", ErrorCodes.SERVER_ERROR);
    }
  }

  async getDataPlans(network_id: string): Promise<PeyflexDataPlan[]> {
    try {
      const response = await this.axiosInstance.get(`/api/data/plans/?network=${network_id}`);
      // Peyflex returns { network: "...", plans: [...] } 
      // where each plan has plan_code, amount, label
      if (response.data && Array.isArray(response.data.plans)) {
        return response.data.plans.map((plan: any) => {
          // Try to extract duration from label if possible, e.g. "1GB = N826 (7DAYS)"
          const durationMatch = plan.label.match(/\((.*?)\)/);
          const duration = durationMatch ? durationMatch[1] : "30 days";
          
          return {
            id: plan.plan_code,
            name: plan.label.split("=")[0].trim(),
            amount: plan.amount,
            duration: duration,
          };
        });
      }
      return [];
    } catch (error: any) {
      console.error("Peyflex Data Plans Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve data plans", ErrorCodes.SERVER_ERROR);
    }
  }

  /**
   * Purchase Data
   */
  async purchaseData(data: {
    network: string;
    mobile_number: string;
    plan_code: string;
  }): Promise<PeyflexPurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<PeyflexPurchaseResponse>("/api/data/purchase/", data);
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Data purchase failed");
    }
  }

  /**
   * Verify Customer (IUC or Meter)
   */
  async verifyCustomer(type: "cable" | "electricity", data: any): Promise<PeyflexVerifyResponse> {
    try {
      if (type === "cable") {
        const response = await this.axiosInstance.post<PeyflexVerifyResponse>("/api/cable/verify/", data);
        return response.data;
      } else {
        // Electricity Verification (GET request based on docs)
        // Params: identifier, meter, plan (provider ID), type (prepaid/postpaid)
        const { meter_number, provider, meter_type } = data;
        const response = await this.axiosInstance.get<PeyflexVerifyResponse>(
          `/api/electricity/verify/?identifier=electricity&meter=${meter_number}&plan=${provider}&type=${meter_type?.toLowerCase()}`
        );
        
        // Strict Validation: If name is "Unknown", considering it invalid even if status says success
        if (response.data?.customer_name?.toLowerCase().includes("unknown")) {
          throw new AppError(400, "Invalid meter number or unable to verify details", ErrorCodes.VALIDATION_ERROR);
        }

        return response.data;
      }
    } catch (error: any) {
      this.handleApiError(error, "Customer verification failed");
    }
  }

  /**
   * Recharge Cable TV
   */
  async purchaseCableTv(data: {
    provider: string;
    iuc_number: string;
    plan_code: string;
  }): Promise<PeyflexPurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<PeyflexPurchaseResponse>("/api/cable/subscribe/", data);
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Cable TV recharge failed");
    }
  }

  /**
   * Purchase Electricity
   */
  async purchaseElectricity(data: {
    provider: string;
    meter_number: string;
    amount: number;
    meter_type: "Prepaid" | "Postpaid";
  }): Promise<PeyflexPurchaseResponse> {
    try {
      const payload = {
        identifier: "electricity",
        meter: data.meter_number,
        plan: data.provider, // Provider ID maps to 'plan' in Peyflex
        amount: data.amount,
        type: data.meter_type.toLowerCase(),
        phone: "08123456789" // Required by Peyflex, using a placeholder or should be passed from controller
      };
      
      const response = await this.axiosInstance.post<PeyflexPurchaseResponse>("/api/electricity/subscribe/", payload);
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Electricity purchase failed");
    }
  }

  /**
   * Helper: Get Cable Providers
   */
  async getCableProviders(): Promise<CableProvider[]> {
    try {
      const response = await this.axiosInstance.get("/api/cable/providers/");
      if (response.data && Array.isArray(response.data.providers)) {
        return response.data.providers.map((p: any) => ({
          id: p.identifier,
          name: p.name,
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Peyflex Cable Providers Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve cable providers", ErrorCodes.SERVER_ERROR);
    }
  }

  async getCablePlans(providerId: string): Promise<PeyflexDataPlan[]> {
    try {
      const response = await this.axiosInstance.get(`/api/cable/plans/${providerId}/`);
      if (response.data && Array.isArray(response.data.plans)) {
        return response.data.plans.map((p: any) => ({
          id: p.plan_code,
          name: p.display || p.description?.split("=")[0].trim() || p.plan_code,
          amount: Number(p.amount),
          duration: "Monthly", // Cable plans are usually monthly
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Peyflex Cable Plans Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve cable plans", ErrorCodes.SERVER_ERROR);
    }
  }

  async getElectricityPlans(): Promise<ElectricityProvider[]> {
    try {
      // Peyflex's electricity/plans/ returns a 'plans' array
      const response = await this.axiosInstance.get("/api/electricity/plans/?identifier=electricity");
      
      if (response.data && Array.isArray(response.data.plans)) {
        return response.data.plans.map((p: any) => ({
          id: p.plan_code || p.plan_id,
          name: p.plan_name,
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Peyflex Electricity Plans Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve electricity plans", ErrorCodes.SERVER_ERROR);
    }
  }

  /**
   * Helper to handle API errors
   */
  private handleApiError(error: any, defaultMessage: string): never {
    const status = error.response?.status || 500;
    const errorData = error.response?.data;
    const message = errorData?.message || defaultMessage;
    
    console.error(`Peyflex API Error [${status}]:`, errorData || error.message);
    
    throw new AppError(
      status,
      message,
      ErrorCodes.SERVER_ERROR
    );
  }
}
