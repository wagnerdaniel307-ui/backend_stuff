// ============================================================================
// FILE: src/services/squad.service.ts
// SQUAD SERVICE - Integration with Squad (GTCO) for Virtual Accounts
// ============================================================================

import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import { env } from "../config/env";
import { AppError } from "../middleware/error.middleware";
import { ErrorCodes } from "../constants/error-codes";

export interface SquadVirtualAccountResponse {
  success: boolean;
  message: string;
  data?: {
    first_name: string;
    last_name: string;
    bank_code: string;
    virtual_account_number: string;
    beneficiary_account?: string;
    customer_identifier?: string;
  };
}

export class SquadService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.SQUAD_BASE_URL,
      headers: {
        Authorization: `Bearer ${env.SQUAD_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Create a Dynamic Virtual Account for a User
   * This gives them a recurring account number they can transfer to anytime.
   */
  async createVirtualAccount(data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    mobile: string;
    dob: string; // dd/mm/yyyy
    email: string;
    bvn: string;
    gender: "1" | "2"; // 1=Male, 2=Female
    address: string;
    customerIdentifier: string; // Unique user ID
  }): Promise<SquadVirtualAccountResponse> {
    try {
      const payload: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        mobile_num: data.mobile.replace("+234", "0"),
        dob: data.dob,
        email: data.email,
        bvn: data.bvn,
        gender: data.gender,
        address: data.address,
        customer_identifier: data.customerIdentifier,
      };

      if (data.middleName) {
        payload.middle_name = data.middleName;
      }

      if (env.SQUAD_BENEFIT_ACCOUNT) {
        payload.beneficiary_account = env.SQUAD_BENEFIT_ACCOUNT;
      }

      const response = await this.axiosInstance.post(
        "/virtual-account",
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Squad Create Virtual Account Error:",
        error.response?.data || error.message
      );
      throw new AppError(
        error.response?.status || 500,
        error.response?.data?.message || "Failed to create virtual account",
        ErrorCodes.SERVER_ERROR
      );
    }
  }

  /**
   * Verify Webhook Signature
   * Ensures the request actually came from Squad.
   */
  verifyWebhookSignature(body: any, signature: string): boolean {
    if (!signature) return false;

    const hash = crypto
      .createHmac("sha512", env.SQUAD_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    return hash === signature;
  }
}
