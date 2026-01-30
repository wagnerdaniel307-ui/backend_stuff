// ============================================================================
// FILE: src/types/topupmate.types.ts
// TOPUPMATE API TYPES
// ============================================================================

export interface TopupmateUserResponse {
  name: string;
  balance: string;
  status: string;
}

export interface TopupmateServiceResponse {
  status: string;
  msg: string;
  response: any[];
}

export interface TopupmatePurchaseResponse {
  status: "success" | "fail";
  Status?: string;
  msg?: string;
  token?: string;
  pin?: string;
  pins?: string;
  serial?: string;
  load_pin?: string;
  check_balance?: string;
  quantity?: string;
}

export interface TopupmateVerifyResponse {
  status: "success" | "fail";
  msg: string;
  Customer_Name?: string;
}

export interface TopupmateTransactionStatus {
  status: string;
  msg: string;
  response: {
    transref: string;
    amount: string;
    status: string;
    oldbal: string;
    newbal: string;
    date: string;
    service: string;
    description: string;
  };
}
