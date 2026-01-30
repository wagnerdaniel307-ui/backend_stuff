# Frontend Guide: How to Update User BVN

Quick guide for frontend developers to implement BVN (Bank Verification Number) updates.

---

## 📋 Overview

Users need to add their BVN to create virtual accounts for wallet funding. This is a **simple profile update** - no external verification needed.

---

## 🔌 API Endpoint

### **Update BVN**
- **URL**: `PATCH /api/v1/users/profile`
- **Auth**: Bearer Token Required
- **Content-Type**: `application/json`

---

## 📝 Request Format

### **Body**
```json
{
  "bvn": "12345678901"
}
```

### **Validation Rules**
- **Required**: No (optional field, but needed for virtual accounts)
- **Format**: Exactly 11 numeric digits
- **Example**: `"22222222222"` or `"12345678901"`

---

## ✅ Success Response

```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "cm123...",
      "email": "user@example.com",
      "firstName": "Emmanuel",
      "lastName": "Bamimore",
      "bvn": "12345678901",
      "updatedAt": "2026-01-30T12:42:00.000Z"
    }
  }
}
```

---

## ❌ Error Responses

### **Invalid Format**
```json
{
  "status": "error",
  "message": "BVN must be exactly 11 digits"
}
```

### **Non-numeric**
```json
{
  "status": "error",
  "message": "BVN must contain only numbers"
}
```

---

## 💻 Implementation Examples

### **1. Vanilla JavaScript/Fetch**

```javascript
async function updateBVN(bvn) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/v1/users/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bvn })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Usage
try {
  const result = await updateBVN('12345678901');
  console.log('BVN updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### **2. React with Axios**

```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const updateBVN = async (bvn: string) => {
  try {
    const { data } = await api.patch('/users/profile', { bvn });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update BVN');
  }
};
```

---

### **3. React Query Hook (Recommended)**

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateBVN = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bvn: string) => {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bvn })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh user profile data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  });
};

// In your component
const BVNForm = () => {
  const updateBVN = useUpdateBVN();
  
  const handleSubmit = (bvn: string) => {
    updateBVN.mutate(bvn, {
      onSuccess: () => {
        toast.success('BVN updated successfully!');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    });
  };
  
  return (
    <button 
      onClick={() => handleSubmit('12345678901')}
      disabled={updateBVN.isPending}
    >
      {updateBVN.isPending ? 'Saving...' : 'Save BVN'}
    </button>
  );
};
```

---

## 🎨 Complete UI Component

```tsx
import { useState } from 'react';
import { useUpdateBVN } from './hooks/useUpdateBVN';

export const BVNInputForm = () => {
  const [bvn, setBvn] = useState('');
  const [error, setError] = useState('');
  const updateBVN = useUpdateBVN();

  const validateBVN = (value: string): boolean => {
    if (!value) {
      setError('BVN is required');
      return false;
    }
    if (value.length !== 11) {
      setError('BVN must be exactly 11 digits');
      return false;
    }
    if (!/^\d{11}$/.test(value)) {
      setError('BVN must contain only numbers');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setBvn(value);
    if (value) validateBVN(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBVN(bvn)) return;

    updateBVN.mutate(bvn, {
      onSuccess: () => {
        alert('BVN saved successfully!');
      },
      onError: (err: Error) => {
        setError(err.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bvn" className="block text-sm font-medium">
          Bank Verification Number (BVN)
        </label>
        <input
          id="bvn"
          type="text"
          value={bvn}
          onChange={handleChange}
          maxLength={11}
          placeholder="Enter 11-digit BVN"
          className="mt-1 block w-full rounded-md border p-2"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Your BVN is required to create a virtual account for funding
        </p>
      </div>
      
      <button
        type="submit"
        disabled={updateBVN.isPending || !!error}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {updateBVN.isPending ? 'Saving BVN...' : 'Save BVN'}
      </button>
    </form>
  );
};
```

---

## 🔄 Integration with Virtual Account Flow

When user tries to create virtual account without BVN:

```tsx
const createVirtualAccount = async () => {
  try {
    const response = await fetch('/api/v1/wallets/virtual-accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    return data;
  } catch (error: any) {
    // Check if error is about missing BVN
    if (error.message.includes('BVN')) {
      // Show modal asking user to add BVN
      showBVNModal();
    } else {
      // Other error
      alert(error.message);
    }
  }
};
```

---

## 📱 UX Best Practices

### **1. Show BVN Status**
```tsx
const ProfilePage = () => {
  const { data: user } = useUser();
  
  return (
    <div>
      {user?.bvn ? (
        <div className="text-green-600">
          ✓ BVN Added (ends with {user.bvn.slice(-4)})
        </div>
      ) : (
        <div className="text-orange-600">
          ⚠ Add your BVN to enable virtual account
        </div>
      )}
    </div>
  );
};
```

### **2. Prompt Before Virtual Account Creation**
```tsx
const WalletPage = () => {
  const { data: user } = useUser();
  
  const handleCreateAccount = () => {
    if (!user?.bvn) {
      alert('Please add your BVN first');
      navigate('/profile');
      return;
    }
    
    // Proceed with creation
    createVirtualAccount();
  };
  
  return (
    <button onClick={handleCreateAccount}>
      Generate Account Number
    </button>
  );
};
```

---

## 🧪 Testing

### **Test BVNs (Sandbox)**
Use any 11-digit number for testing:
- `11111111111`
- `22222222222`  
- `12345678901`

---

## 📚 Related Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/users/profile` | Get current user (includes BVN) |
| `PATCH /api/v1/users/profile` | Update BVN |
| `POST /api/v1/wallets/virtual-accounts` | Create account (requires BVN) |

---

## ✅ Checklist

- [ ] Add BVN input field to Profile page
- [ ] Validate 11 digits, numeric only
- [ ] Show loading state while saving
- [ ] Display success/error messages
- [ ] Check BVN exists before virtual account creation
- [ ] Show BVN status to user

---

**Need Help?** The backend is ready - just call the endpoint! 🚀
