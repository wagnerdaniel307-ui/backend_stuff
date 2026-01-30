# BVN Integration - Simple Flow ✅

## Overview
Users can add their BVN directly to their profile. **No external verification service is used.** Squad will validate the BVN when creating virtual accounts.

---

## How It Works

### 1. **User Adds BVN** (Frontend)
User updates their profile with BVN:
```
PATCH /api/v1/users/profile
{
  "bvn": "12345678901"
}
```

**Backend:**
- ✅ Validates format (11 digits, numeric)
- ✅ Saves to database
- ❌ Does NOT verify with external service

---

### 2. **User Creates Virtual Account**
When user tries to create virtual account:
```
POST /api/v1/wallets/virtual-accounts
```

**Backend checks:**
- ✅ User must have BVN saved
- ✅ Sends BVN to Squad API

**Squad validates:**
- If BVN is **valid** → Creates account ✅
- If BVN is **invalid** → Returns error ❌

---

## Error Handling

### **If BVN is Invalid (Caught by Squad)**

**Squad Response:**
```json
{
  "success": false,
  "message": "Validation Failure, invalid BVN"
}
```

**Your Backend Returns:**
```json
{
  "success": false,
  "message": "Validation Failure, invalid BVN",
  "code": "SERVER_ERROR"
}
```

**Frontend Should:**
1. Show error to user
2. Ask them to verify their BVN
3. Allow them to update BVN via profile
4. Retry virtual account creation

---

## Frontend Implementation

### **BVN Input Component**
```tsx
const BVNForm = () => {
  const [bvn, setBvn] = useState('');
  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    // Basic validation
    if (!/^\d{11}$/.test(bvn)) {
      alert('BVN must be exactly 11 digits');
      return;
    }

    try {
      await updateProfile.mutateAsync({ bvn });
      alert('BVN saved successfully!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={bvn}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
        maxLength={11}
        placeholder="Enter 11-digit BVN"
      />
      <button onClick={handleSave}>Save BVN</button>
    </div>
  );
};
```

### **Handle Virtual Account Creation Error**
```tsx
const createVirtualAccount = async () => {
  try {
    await fetch('/api/v1/wallets/virtual-accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
  } catch (error: any) {
    if (error.message.includes('BVN')) {
      // Show modal: "Please check your BVN and try again"
      showBVNErrorModal();
    }
  }
};
```

---

## Advantages

✅ **Simple** - No complex verification flow  
✅ **Free** - No external API costs  
✅ **Fast** - Instant BVN saving  
✅ **Secure** - Squad validates before creating accounts  
✅ **User-friendly** - One-step process  

---

## When to Add Verification

You may want to add BVN verification (Flutterwave/Paystack) later if:
- Users frequently enter wrong BVNs
- You want to verify names match before Squad call
- Fraud becomes an issue

For now, this simple approach works perfectly!

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/users/profile` | PATCH | Update user BVN |
| `/api/v1/wallets/info` | GET | Get wallet & check if BVN exists |
| `/api/v1/wallets/virtual-accounts` | POST | Create virtual account (requires BVN) |

---

**Status**: ✅ **Fully Implemented & Ready**
