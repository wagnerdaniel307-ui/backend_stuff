# Bills & Pins Integration Guide - Frontend

This guide outlines how to integrate Peyflex and Topupmate bill payment features.

---

## 🔐 NEW: Transaction PIN Management
All purchases now **require** a 4-digit transaction PIN. Users must set this up before their first purchase.

### 1. Set Transaction PIN
Use this for first-time setup or if no PIN has been set yet.
- **Endpoint**: `POST /api/v1/wallets/pin/set`
- **Payload**: `{"pin": "1234"}`

### 2. Change Transaction PIN
- **Endpoint**: `POST /api/v1/wallets/pin/change`
- **Payload**: `{"currentPin": "1234", "newPin": "5678"}`

---

## Base URL
All endpoints are prefixed with `/api/v1/bills`.

## Authentication
All purchase endpoints require a valid JWT Bearer token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

## Mandatory "pin" Field
Every `POST` purchase endpoint described below now REQUIRES a `pin` field in the request body.

---

## 1. Data & Airtime (Peyflex)

### Data
1. **Fetch Networks**: `GET /api/v1/bills/data-networks`
2. **Fetch Plans**: `GET /api/v1/bills/data-plans?networkId=mtn_sme_data`
3. **Purchase**: `POST /api/v1/bills/data`
   - Payload: `{"mobile_number": "...", "network": "...", "plan_code": "...", "amount": 280, "planName": "...", "pin": "1234"}`

### Airtime
- **Purchase**: `POST /api/v1/bills/airtime`
  - Payload: `{"mobile_number": "...", "network": "1", "amount": 100, "pin": "1234"}`

---

## 2. Electricity & Cable TV (Peyflex)

- **Verify Customer**: `POST /api/v1/bills/verify-customer` (No PIN required for verification)
  - Payload (Electricity): `{"type": "electricity", "meter_number": "...", "provider": "AEDC"}`

- **Purchase Electricity**: `POST /api/v1/bills/electricity`
  - Payload: `{"meter_number": "...", "provider": "...", "meter_type": "Prepaid", "amount": 2000, "pin": "1234"}`

- **Purchase Cable**: `POST /api/v1/bills/cable-tv`
  - Payload: `{"provider": "...", "iuc_number": "...", "plan_code": "...", "amount": 10500, "plan_name": "...", "pin": "1234"}`

---

## 3. Exam & Recharge Pins (Topupmate)

### Fetch Services (For Dropdowns)
- **Endpoint**: `GET /api/v1/bills/topupmate/services?service=<service_name>`
- **Service Names**: `exampin`, `recharge-card`, `data-category`, `datapin`

### Purchase Exam Pin
- **Endpoint**: `POST /api/v1/bills/exam-pins`
- **Payload**:
  ```json
  {
    "provider": "1",
    "quantity": 2,
    "amount": 4000,
    "pin": "1234",
    "requestId": "unique-id"
  }
  ```

### Purchase Recharge Pin (E-Pin)
- **Endpoint**: `POST /api/v1/bills/recharge-pins`
- **Payload**:
  ```json
  {
    "network": "1",
    "quantity": 5,
    "plan": "100",
    "amount": 500,
    "businessname": "Your Shop Name",
    "pin": "1234",
    "requestId": "unique-id"
  }
  ```

---

## Error Codes
- `INVALID_CREDENTIALS`: The transaction PIN provided is incorrect.
- `INSUFFICIENT_FUNDS`: Wallet balance is too low.
- `SERVER_ERROR`: Provider API error.
- `VALIDATION_ERROR`: Missing or invalid fields (e.g. PIN must be 4 digits).
- `DUPLICATE_REQUEST`: Transaction with this `requestId` already exists.
