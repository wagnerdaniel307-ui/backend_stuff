// ============================================================================
// FILE: src/services/topupmate.service.ts
// TOPUPMATE SERVICE - Integration with topupmate.com for pins & fallbacks
// ============================================================================

import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { ErrorCodes } from "../constants/error-codes";
import {
  TopupmateUserResponse,
  TopupmatePurchaseResponse,
  TopupmateVerifyResponse,
  TopupmateServiceResponse,
} from "../types/topupmate.types";

export class TopupmateService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.TOPUPMATE_BASE_URL,
      headers: {
        Authorization: `Token ${env.TOPUPMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get Wallet Balance
   */
  async getBalance(): Promise<number> {
    try {
      const response = await this.axiosInstance.get<TopupmateUserResponse>("/user/");
      return parseFloat(response.data.balance.replace(/,/g, ""));
    } catch (error: any) {
      console.error("Topupmate Balance Error:", error.response?.data || error.message);
      throw new AppError(500, "Could not retrieve balance from Topupmate", ErrorCodes.SERVER_ERROR);
    }
  }

  /**
   * Get Services (Networks, Plans, etc.)
   */
  async getServices(service: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get<TopupmateServiceResponse>(`/services/?service=${service}`);
      return response.data.response;
    } catch (error: any) {
      console.error(`Topupmate Get Services (${service}) Error:`, error.response?.data || error.message);
      throw new AppError(500, `Could not retrieve ${service} list`, ErrorCodes.SERVER_ERROR);
    }
  }

  /**
   * Purchase Exam Pin
   */
  async purchaseExamPin(data: {
    provider: string;
    quantity: number;
    ref: string;
  }): Promise<TopupmatePurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<TopupmatePurchaseResponse>("/exampin/", {
        provider: data.provider,
        quantity: data.quantity.toString(),
        ref: data.ref,
      });
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Exam Pin purchase failed");
    }
  }

  /**
   * Purchase Recharge Pin
   */
  async purchaseRechargePin(data: {
    network: string;
    quantity: number;
    plan: string;
    businessname: string;
    ref: string;
  }): Promise<TopupmatePurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<TopupmatePurchaseResponse>("/rechargepin/", {
        ...data,
        quantity: data.quantity.toString(),
      });
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Recharge Pin purchase failed");
    }
  }

  /**
   * Purchase Data Pin
   */
  async purchaseDataPin(data: {
    network: string;
    quantity: number;
    data_plan: string;
    businessname: string;
    ref: string;
  }): Promise<TopupmatePurchaseResponse> {
    try {
      const response = await this.axiosInstance.post<TopupmatePurchaseResponse>("/datapin/", {
        ...data,
        quantity: data.quantity.toString(),
      });
      return response.data;
    } catch (error: any) {
      this.handleApiError(error, "Data Pin purchase failed");
    }
  }

  /**
   * Helper to handle API errors
   */
  private handleApiError(error: any, defaultMessage: string): never {
    const status = error.response?.status || 500;
    const errorData = error.response?.data;
    const message = errorData?.msg || errorData?.message || defaultMessage;
    
    console.error(`Topupmate API Error [${status}]:`, errorData || error.message);
    
    throw new AppError(
      status,
      message,
      ErrorCodes.SERVER_ERROR
    );
  }
}
