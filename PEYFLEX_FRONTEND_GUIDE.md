# Peyflex Bills Integration Guide - Frontend

This guide outlines how to integrate the new Peyflex-powered bill payment features into the frontend.

## Base URL
All endpoints are prefixed with `/api/v1/bills`.

## Authentication
All purchase endpoints require a valid JWT Bearer token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

## Idempotency (Preventing Double Charges)
All `POST` purchase endpoints (Data, Airtime, etc.) support an optional `requestId` field in the request body. 
- **Recommendation**: Generate a unique GUID/UUID on the frontend for every new transaction attempt.
- **Benefit**: If a network error occurs and you retry with the same `requestId`, the backend will recognize it as the same transaction. It will **not** debit the user's wallet again and will simply return the status of the previous attempt.

---

## 1. Data Subscription Flow

### Step A: Fetch Data Networks
Get a list of supported networks to display in a dropdown.
- **Endpoint**: `GET /api/v1/bills/data-networks`
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      { "id": "mtn_sme_data", "name": "MTN SME" },
      { "id": "glo_data", "name": "Glo Gifting" }
    ]
  }
  ```

### Step B: Fetch Data Plans
Once a network is selected, fetch the specific plans for that network.
- **Endpoint**: `GET /api/v1/bills/data-plans?networkId=mtn_sme_data`
- **Response**:
  ```json
  {
    "status": "success",
    "data": [
      { "id": "M500MBS", "name": "500MB SME", "amount": 150, "duration": "30 days" },
      { "id": "M1GBS", "name": "1GB SME", "amount": 280, "duration": "30 days" }
    ]
  }
  ```

### Step C: Purchase Data
- **Endpoint**: `POST /api/v1/bills/data`
- **Payload**:
  ```json
  {
    "mobile_number": "08144216361",
    "network": "mtn_sme_data",
    "plan_code": "M1GBS",
    "amount": 280,
    "planName": "1GB SME"
  }
  ```

---

## 2. Airtime Top-Up
- **Endpoint**: `POST /api/v1/bills/airtime`
- **Payload**:
  ```json
  {
    "mobile_number": "08144216361",
    "network": "1", // Peyflex Network ID (1: MTN, 2: Glo, 3: 9mobile, 4: Airtel)
    "amount": 100
  }
  ```

---

## 3. Electricity Bill Payment

### Step A: Verify Meter
- **Endpoint**: `POST /api/v1/bills/verify-customer`
- **Payload**:
  ```json
  {
    "type": "electricity",
    "meter_number": "12345678901",
    "provider": "AEDC" // Provider ID
  }
  ```

### Step B: Purchase
- **Endpoint**: `POST /api/v1/bills/electricity`
- **Payload**:
  ```json
  {
    "meter_number": "12345678901",
    "provider": "AEDC",
    "meter_type": "Prepaid",
    "amount": 2000
  }
  ```

---

## 4. Cable TV Subscription

### Step A: Verify IUC
- **Endpoint**: `POST /api/v1/bills/verify-customer`
- **Payload**:
  ```json
  {
    "type": "cable",
    "iuc_number": "1234567890",
    "provider": "DSTV"
  }
  ```

### Step B: Purchase
- **Endpoint**: `POST /api/v1/bills/cable-tv`
- **Payload**:
  ```json
  {
    "provider": "DSTV",
    "iuc_number": "1234567890",
    "plan_code": "compact_monthly",
    "amount": 10500,
    "plan_name": "DStv Compact"
  }
  ```

---

## Error Codes
- `INSUFFICIENT_FUNDS`: Wallet balance is too low.
- `SERVER_ERROR`: Provider API error.
- `VALIDATION_ERROR`: Missing or invalid fields.
