# Frontend Integration Guide: Squad Virtual Accounts
---

This guide details how to implement the Wallet Funding system using **Squad (GTBank)** Virtual Accounts.

## 🟢 Overview
The backend has switched from Monnify to **Squad**. This means users will now get **GTBank** account numbers to transfer money to. When they transfer, their wallet balance updates automatically.

---

## 🚀 1. How to "Initialize" a Wallet
When a user visits the "Deposit" or "Wallet" tab for the first time, you must check if they have a virtual account. If NOT, call this endpoint to generate one.

### **Endpoint**
- **URL**: `POST /api/v1/wallets/virtual-accounts`
- **Auth**: Bearer Token required
- **Body**: `{}` (Empty)

### **Response (Success)**
```json
{
  "status": "success",
  "message": "Virtual accounts initialized",
  "data": {
    "accounts": [
      {
        "id": "cm6j...",
        "bankName": "GTBank",
        "accountNumber": "0123456789",
        "accountName": "BAMIMORE EMANUEL",
        "provider": "squad"
      }
    ]
  }
}
```

---

## 💰 2. Displaying the Wallet & Accounts
Once initialized, you can always fetch the wallet info to show the Balance and the Account Number.

### **Endpoint**
- **URL**: `GET /api/v1/wallets/info`

### **Frontend Logic (React Example)**
```tsx
const WalletPage = () => {
  const { data: walletData } = useQuery('wallet-info', getWalletInfo);

  // If user has no accounts, create one automatically
  useEffect(() => {
    if (walletData && walletData.virtualAccounts.length === 0) {
      createVirtualAccountMutation.mutate(); 
    }
  }, [walletData]);

  const account = walletData?.virtualAccounts[0];

  return (
    <div className="card">
      <h2>₦ {walletData?.balance}</h2>
      
      {account ? (
        <div className="bank-details">
          <p>Bank: {account.bankName} (Squad)</p>
          <p>Account No: {account.accountNumber}</p>
          <p>Name: {account.accountName}</p>
          <small>Transfer to this account to fund your wallet instantly.</small>
        </div>
      ) : (
        <button onClick={() => createAccount()}>Generate Account Number</button>
      )}
    </div>
  );
};
```

---

## 📜 3. Transaction History
To show the user their past funding and spending:

- **URL**: `GET /api/v1/wallets/transactions?limit=20`

**Important Fields**:
- `type`: `DEPOSIT` (Funding) or `PURCHASE` (Spending)
- `status`: `SUCCESS`
- `amount`: The value
- `reference`: Useful for support
- `createdAt`: Date

---

## 🧪 Testing (Sandbox)
1. Since we are in **Sandbox**, the account number generated might be a test GTBank number.
2. Transfers initiated to this number will not move real money but will trigger the webhook if tested correctly.
