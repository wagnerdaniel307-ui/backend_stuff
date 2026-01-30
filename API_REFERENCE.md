# API Reference Documentation

This document provides a comprehensive list of all available API endpoints for the VTU Backend.

## Base URL
`http://localhost:3000/api/v1`

## Authentication
Most endpoints require a Bearer token in the `Authorization` header.
`Authorization: Bearer <your_access_token>`

---

## 🔐 Authentication Module (`/auth`)

### 1. Health Check
- **URL:** `/auth/health`
- **Method:** `GET`
- **Authentication:** None

### 2. User Registration
- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "phone": "+2340000000000",
  "password": "StrongPassword1!",
  "firstName": "John",
  "lastName": "Doe",
  "referralCode": "optional_code"
}
```

### 3. User Login
- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword1!"
}
```

### 4. Refresh Token
- **URL:** `/auth/refresh-token`
- **Method:** `POST`
- **Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### 5. Verify Email
- **URL:** `/auth/verify-email`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### 6. Resend Email OTP
- **URL:** `/auth/resend-email-otp`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

### 7. Forgot Password
- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Body:**
```json
{
  "email": "user@example.com"
}
```

### 8. Validate Reset Token
- **URL:** `/auth/validate-reset-token`
- **Method:** `POST`
- **Body:**
```json
{
  "token": "reset_token_from_email"
}
```

### 9. Reset Password
- **URL:** `/auth/reset-password`
- **Method:** `POST`
- **Body:**
```json
{
  "token": "reset_token",
  "password": "NewStrongPassword1!",
  "confirmPassword": "NewStrongPassword1!"
}
```

### 10. Get Current User (`/me`)
- **URL:** `/auth/me`
- **Method:** `GET`
- **Authentication:** Required

### 11. Send Email Verification OTP
- **URL:** `/auth/send-email-otp`
- **Method:** `POST`
- **Authentication:** Required

### 12. Logout
- **URL:** `/auth/logout`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "refreshToken": "optional_token_to_revoke_specific_session"
}
```

---

## 👤 User Profile Module (`/users`)

### 1. User Service Health
- **URL:** `/users/health`
- **Method:** `GET`
- **Authentication:** Required

### 2. Get Profile
- **URL:** `/users/profile`
- **Method:** `GET`
- **Authentication:** Required

### 3. Update Profile
- **URL:** `/users/profile`
- **Method:** `PATCH`
- **Authentication:** Required
- **Body (all fields optional):**
```json
{
  "username": "janesmith",
  "firstName": "Jane",
  "lastName": "Doe",
  "middleName": "Rose",
  "dateOfBirth": "1995-05-20T00:00:00Z",
  "gender": "FEMALE",
  "address": "456 Side Street",
  "city": "Abuja",
  "state": "FCT"
}
```

### 4. Request Email Change
- **URL:** `/users/email/request-change`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "newEmail": "newemail@example.com",
  "password": "your_current_password"
}
```

### 5. Verify Email Change
- **URL:** `/users/email/verify-change`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "otp": "123456"
}
```

### 6. Request Phone Change
- **URL:** `/users/phone/request-change`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "newPhone": "+2348088887777",
  "password": "your_current_password"
}
```

### 7. Verify Phone Change
- **URL:** `/users/phone/verify-change`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "otp": "123456"
}
```

### 8. Change Password
- **URL:** `/users/change-password`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**
```json
{
  "currentPassword": "OldPassword1!",
  "newPassword": "NewStrongPassword1!",
  "confirmPassword": "NewStrongPassword1!"
}
```

### 9. Update Avatar
- **URL:** `/users/avatar`
- **Method:** `PATCH`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `avatar`: File (image file, max 5MB)

---

## 💳 10. Wallet & Virtual Accounts

### 10.1 Get Wallet Info
- **URL**: `/wallets/info`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: Returns wallet balance and linked virtual bank accounts.

### 10.2 Initialize Virtual Accounts
- **URL**: `/wallets/virtual-accounts`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Generates real bank account numbers (Monnify) for the user to fund their wallet via transfer.

### 10.3 Transaction History
- **URL**: `/wallets/transactions`
- **Method**: `GET`
- **Authentication**: Required
- **Query Params**: `limit` (default 20), `offset` (default 0)

---

## ⚡ 11. Payments & Webhooks

### 11.1 Monnify Webhook
- **URL**: `/payments/webhooks/monnify`
- **Method**: `POST`
- **Authentication**: Public (Signature verification required)
- **Description**: Receives payment notifications from Monnify and automatically credits user wallets.

## ❌ Common Error Codes
| Code | Description |
|------|-------------|
| `EMAIL_ALREADY_EXISTS` | Email already registered or in use |
| `PHONE_ALREADY_EXISTS` | Phone number already in use |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `USER_NOT_FOUND` | User does not exist |
| `VALIDATION_ERROR` | Request body failed validation |
| `OTP_EXPIRED` | Verification code time exceeded |
| `OTP_INVALID` | Incorrect verification code |
| `ACCOUNT_SUSPENDED` | Account access blocked |
| `INVALID_REFRESH_TOKEN` | Auth token invalid or corrupted |
