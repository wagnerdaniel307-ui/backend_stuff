// ============================================================================
// FILE: src/types/peyflex.types.ts
// PEYFLEX API TYPES
// ============================================================================

export interface PeyflexUserBalance {
  balance: number;
}

export interface PeyflexNetwork {
  id: string;
  name: string;
}

export interface CableProvider {
  id: string;
  name: string;
}

export interface ElectricityProvider {
  id: string;
  name: string;
}

export interface PeyflexDataPlan {
  id: string; // planCode
  name: string; // planName
  amount: number;
  duration: string;
}

export interface PeyflexPurchaseResponse {
  status: "success" | "fail" | "processing";
  message: string;
  id?: string; // Transaction reference from Peyflex
}

export interface PeyflexCableProvider {
  id: string;
  name: string;
}

export interface PeyflexCablePlan {
  id: string;
  name: string;
  amount: number;
}

export interface PeyflexVerifyResponse {
  status: "success" | "fail";
  message: string;
  customer_name?: string;
}
