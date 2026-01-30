# Frontend Integration Guide: Username, Avatar & Wallet

This guide helps frontend developers implement the new **username**, **avatar upload**, and **wallet system** features.

---

## 🆔 1. Implementing the Username Feature

The `username` is an optional but unique field.
- **Rules**: 3-20 chars, alphanumeric + underscores.
- **Endpoint**: `PATCH /api/v1/users/profile`

---

## 🖼️ 2. Implementing Avatar Image Upload

- **Endpoint**: `PATCH /api/v1/users/avatar`
- **Method**: `PATCH`
- **Content-Type**: `multipart/form-data`
- **Key**: Must use `avatar` as the form-data key.

---

## � 3. Digital Wallet & Virtual Accounts

Users can now fund their wallets via bank transfers using **Monnify** virtual accounts.

### 3.1 Fetch Wallet Info (Balance & Bank Accounts)
- **URL**: `GET /api/v1/wallets/info`
- **Response**:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "balance": "5000.00",
      "virtualAccounts": [
        {
          "bankName": "Wema Bank",
          "accountNumber": "0123456789",
          "accountName": "VTU - John Doe"
        }
      ]
    }
  }
}
```

### 3.2 Initialize Bank Accounts
If a user has no bank accounts yet, they must "Initialize" them.
- **URL**: `POST /api/v1/wallets/virtual-accounts`
- **Implementation**: Call this once (e.g., when they first visit the Wallet screen). It connects to Monnify and generates the numbers.

### 3.3 Transaction History (Pagination)
- **URL**: `GET /api/v1/wallets/transactions?limit=20&offset=0`
- **Fields to show**: `amount`, `type` (DEPOSIT, PURCHASE), `status`, `description`, `createdAt`.

---

## 🚀 4. Fetching User Data

The `username` and `avatarUrl` are now included in the user object returned by standard auth/profile endpoints.

---

## 🛠️ Summary Checklist for Frontend
- [ ] **Username**: Add input to Profile and handle uniqueness errors (400).
- [ ] **Avatar**: Use `FormData` to upload images to the avatar endpoint.
- [ ] **Wallet**: Add a Wallet screen showing the `balance`.
- [ ] **Funding**: Display the Virtual Bank Accounts so users know where to transfer money.
- [ ] **History**: Add a "Recent Transactions" list using the transactions endpoint.
