/**
 * Application Constants
 */

export const APP_CONSTANTS = {
  // Wallet currencies
  CURRENCIES: {
    NGN: 'NGN',
    USD: 'USD',
    EUR: 'EUR',
  },

  // Transaction types
  TRANSACTION_TYPES: {
    SEND: 'send',
    RECEIVE: 'receive',
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
  },

  // Transaction statuses
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  // API timeouts
  API_TIMEOUT: 30000, // 30 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
}

export default APP_CONSTANTS
