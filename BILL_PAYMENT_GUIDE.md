# Bills & Pins Integration Guide - Frontend

This guide outlines how to integrate Peyflex and Topupmate bill payment features.

## Base URL
All endpoints are prefixed with `/api/v1/bills`.

## Authentication
All purchase endpoints require a valid JWT Bearer token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

## Idempotency (Preventing Double Charges)
All `POST` purchase endpoints support an optional `requestId` field. 
- **Recommendation**: Generate a unique GUID/UUID on the frontend for every new transaction attempt.
- **Benefit**: If a network error occurs, retrying with the same `requestId` will NOT debit the user's wallet again.

---

## 1. Data & Airtime (Peyflex)

### Data
1. **Fetch Networks**: `GET /api/v1/bills/data-networks`
2. **Fetch Plans**: `GET /api/v1/bills/data-plans?networkId=mtn_sme_data`
3. **Purchase**: `POST /api/v1/bills/data`
   - Payload: `{"mobile_number": "...", "network": "...", "plan_code": "...", "amount": 280, "planName": "..."}`

### Airtime
- **Purchase**: `POST /api/v1/bills/airtime`
  - Payload: `{"mobile_number": "...", "network": "1", "amount": 100}`

---

## 2. Electricity & Cable TV (Peyflex)

- **Verify Customer**: `POST /api/v1/bills/verify-customer`
  - Payload (Electricity): `{"type": "electricity", "meter_number": "...", "provider": "AEDC"}`
  - Payload (Cable): `{"type": "cable", "iuc_number": "...", "provider": "DSTV"}`

- **Purchase Electricity**: `POST /api/v1/bills/electricity`
  - Payload: `{"meter_number": "...", "provider": "...", "meter_type": "Prepaid", "amount": 2000}`

- **Purchase Cable**: `POST /api/v1/bills/cable-tv`
  - Payload: `{"provider": "...", "iuc_number": "...", "plan_code": "...", "amount": 10500, "plan_name": "..."}`

---

## 3. Exam & Recharge Pins (Topupmate)

### Fetch Services (For Dropdowns)
Use this to get provider IDs, plan IDs, and pricing for Pins.
- **Endpoint**: `GET /api/v1/bills/topupmate/services?service=<service_name>`
- **Service Names**: `exampin`, `recharge-card`, `data-category`, `datapin`

### Purchase Exam Pin
- **Endpoint**: `POST /api/v1/bills/exam-pins`
- **Payload**:
  ```json
  {
    "provider": "1", // WAEC
    "quantity": 2,
    "amount": 4000, // Total amount to debit
    "requestId": "unique-id"
  }
  ```

### Purchase Recharge Pin (E-Pin)
- **Endpoint**: `POST /api/v1/bills/recharge-pins`
- **Payload**:
  ```json
  {
    "network": "1", // MTN
    "quantity": 5,
    "plan": "100", // Face value
    "amount": 500, // Total to debit
    "businessname": "Your Shop Name",
    "requestId": "unique-id"
  }
  ```

### Purchase Data Pin
- **Endpoint**: `POST /api/v1/bills/data-pins`
- **Payload**:
  ```json
  {
    "network": "1",
    "quantity": 1,
    "data_plan": "5",
    "amount": 500,
    "businessname": "Your Shop Name",
    "requestId": "unique-id"
  }
  ```

---

## Error Codes
- `INSUFFICIENT_FUNDS`: Wallet balance is too low.
- `SERVER_ERROR`: Provider API error.
- `VALIDATION_ERROR`: Missing or invalid fields.
- `DUPLICATE_REQUEST`: Transaction with this `requestId` already exists.
