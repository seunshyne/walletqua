# API & Services Architecture Guide

## Overview

This project uses a layered architecture for API communication:

```
Components/Pages
    ↓
Stores (Pinia)
    ↓
Services (Business Logic)
    ↓
API Client (HTTP Layer)
    ↓
Backend API
```

## Folder Structure

```
src/
├── api/
│   └── client.js          # HTTP client - handles all fetch requests
├── services/
│   ├── authService.js     # Authentication logic
│   ├── walletService.js   # Wallet operations
│   └── ...
├── stores/
│   ├── auth.js            # Auth state management
│   ├── transaction.js     # Transaction state
│   └── ...
├── utils/
│   └── index.js           # Helper functions
├── constants/
│   └── index.js           # App-wide constants
```

## How It Works

### 1. API Client (`src/api/client.js`)

The core HTTP communication layer. Handles:
- Token injection
- Request/response handling
- Error handling
- All HTTP methods (GET, POST, PUT, PATCH, DELETE)

**Usage:**
```javascript
import apiClient from '@/api/client'

// GET request
const response = await apiClient.get('/users')

// POST request
const response = await apiClient.post('/auth/login', { email, password })

// Without authentication
const response = await apiClient.get('/public-data', { includeAuth: false })
```

### 2. Services (`src/services/`)

Business logic layer. Each service handles domain-specific operations:

**Example: authService.js**
```javascript
import authService from '@/services/authService'

// Login
const result = await authService.login(email, password)
// Returns: { success, token, user, wallet, message, error }

// Register
const result = await authService.register(name, email, password, confirmPassword)

// Logout
await authService.logout()

// Get current user
const result = await authService.getCurrentUser()

// Resend verification
const result = await authService.resendVerificationEmail(email)
```

**Example: walletService.js**
```javascript
import walletService from '@/services/walletService'

// Get all wallets
const result = await walletService.getWallets()

// Get specific wallet
const result = await walletService.getWallet(walletId)

// Get balance
const result = await walletService.getBalance(walletId)

// Send money
const result = await walletService.sendMoney({ 
  recipientAddress, 
  amount, 
  description 
})

// Get transactions
const result = await walletService.getTransactions(walletId, { 
  limit: 20, 
  offset: 0 
})
```

### 3. Pinia Stores (`src/stores/`)

State management and derived logic. Connect UI to services:

```javascript
// In a component or store
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login through store
await authStore.authenticate('login', { email, password }, router)

// Access reactive state
const { user, isAuthenticated } = storeToRefs(authStore)
```

### 4. Components/Pages

Use stores, not services directly:

```vue
<script setup>
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, errors, message } = storeToRefs(authStore)

const handleLogin = async () => {
  await authStore.authenticate('login', formData, router)
}
</script>
```

## Service Response Pattern

All services return a consistent response object:

```javascript
{
  success: boolean,
  data?: any,
  error?: string | object,
  message?: string,
  status?: number
}
```

**Example:**
```javascript
const result = await authService.login(email, password)

if (result.success) {
  console.log('User:', result.user)
  // Handle success
} else {
  console.log('Error:', result.error)
  console.log('Message:', result.message)
  // Handle error
}
```

## Adding a New Service

1. Create a new file in `src/services/`, e.g., `src/services/notificationService.js`

```javascript
import apiClient from '@/api/client'

const ENDPOINTS = {
  GET_NOTIFICATIONS: '/notifications',
  MARK_AS_READ: (id) => `/notifications/${id}/read`,
}

export const notificationService = {
  async getNotifications() {
    try {
      const response = await apiClient.get(ENDPOINTS.GET_NOTIFICATIONS)
      return {
        success: true,
        notifications: response.data.notifications,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await apiClient.post(ENDPOINTS.MARK_AS_READ(notificationId), null)
      return {
        success: true,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },
}

export default notificationService
```

2. Create a store for it in `src/stores/notification.js`:

```javascript
import { defineStore } from 'pinia'
import notificationService from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loading: false,
  }),
  
  actions: {
    async fetchNotifications() {
      this.loading = true
      const result = await notificationService.getNotifications()
      if (result.success) {
        this.notifications = result.notifications
      }
      this.loading = false
    },

    async markAsRead(id) {
      const result = await notificationService.markAsRead(id)
      if (result.success) {
        const notification = this.notifications.find(n => n.id === id)
        if (notification) notification.read = true
      }
    },
  },

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
  },
})
```

## Environment Configuration

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Or for production:

```env
VITE_API_URL=https://api.yourapp.com/api
```

Usage in client:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
```

## Error Handling

Services handle errors consistently. All API errors include:

```javascript
try {
  const response = await apiClient.post('/endpoint', data)
} catch (error) {
  // error.status - HTTP status code
  // error.data - Response data
  // error.message - Error message
  // error.originalError - Original fetch error
}
```

Services catch and format these:

```javascript
catch (error) {
  return {
    success: false,
    error: error.data?.errors || error.message,
    message: error.data?.message || '',
    status: error.status,
  }
}
```

## Best Practices

1. **Always use services** - Never call API directly from components
2. **Handle all responses** - Check `success` property before accessing data
3. **Use stores for state** - Store state in Pinia, not in services
4. **Keep services pure** - Services should only handle API logic
5. **Reuse endpoints** - Define constants for all API endpoints
6. **Consistent errors** - Always use the standard response format
7. **Environment variables** - Use env for API URL, not hardcoded strings
8. **Token injection** - API client handles token automatically
