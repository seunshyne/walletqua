/**
 * Wallet Service
 * Handles wallet operations like fetching balances, sending, receiving
 */

import apiClient from '../api/client'

const WALLET_ENDPOINTS = {
  GET_WALLETS: '/wallets',
  GET_WALLET: (id) => `/wallets/${id}`,
  GET_BALANCE: (id) => `/wallets/${id}/balance`,
  SEND: '/transactions/transfer',
  RECEIVE: '/transactions/receive',
  GET_TRANSACTIONS: '/transactions',
  FUND_INITIATE: '/wallet/fund/initiate',
  FUND_VERIFY: '/wallet/fund/verify',
}

export const walletService = {
  /**
   * Get all wallets for current user
   */
  async getWallets() {
    try {
      const response = await apiClient.get(WALLET_ENDPOINTS.GET_WALLETS)
      return {
        success: true,
        wallets: response.data.wallets || response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Get specific wallet details
   */
  async getWallet(walletId) {
    try {
      const response = await apiClient.get(WALLET_ENDPOINTS.GET_WALLET(walletId))
      return {
        success: true,
        wallet: response.data.wallet || response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Get wallet balance
   */
  async getBalance(walletId) {
    try {
      const response = await apiClient.get(WALLET_ENDPOINTS.GET_BALANCE(walletId))
      return {
        success: true,
        balance: response.data.balance,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Send money to another wallet
   */
  async sendMoney(data) {
    try {
      const idempotencyKey = data?.idempotency_key || data?.client_idempotency_key
      const response = await apiClient.post(WALLET_ENDPOINTS.SEND, data, {
        headers: idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {},
      })
      return {
        success: true,
        transaction: response.data.transaction || response.data,
        message: response.data.message || 'Transaction sent successfully',
      }
    } catch (error) {
      // Extract detailed error information
      const errorData = error.response?.data || error.data || {}
      const normalizedErrorData = typeof errorData === 'string' ? { raw: errorData } : errorData
      const errorMessage =
        normalizedErrorData.message ||
        normalizedErrorData.error ||
        error.message ||
        'Transaction failed'
      const errors = errorData.errors || {}

      console.error('Transfer request failed', {
        status: error.response?.status || error.status,
        message: errorMessage,
        data: normalizedErrorData,
      })

      return {
        success: false,
        error: errors,
        message: errorMessage,
        statusCode: error.response?.status || error.status,
        rawError: normalizedErrorData,
      }
    }
  },

  /**
   * Get receive address for wallet
   */
  async getReceiveAddress(walletId) {
    try {
      const response = await apiClient.get(WALLET_ENDPOINTS.RECEIVE)
      return {
        success: true,
        address: response.data.address,
        qrCode: response.data.qrCode,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
   * Get transaction history
   */
  async getTransactions(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString()
      const endpoint = queryString
        ? `${WALLET_ENDPOINTS.GET_TRANSACTIONS}?${queryString}`
        : WALLET_ENDPOINTS.GET_TRANSACTIONS

      const response = await apiClient.get(endpoint)
      return {
        success: true,
        transactions: response.data.data || response.data.transactions || response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  },

  /**
 * Initiate Paystack wallet funding
 */
  async initiateWalletFunding(amount) {
    try {
      const response = await apiClient.post(WALLET_ENDPOINTS.FUND_INITIATE, { amount })
      return {
        success: true,
        paymentUrl: response.data.payment_url,
        reference: response.data.reference,
        message: response.data.message,
      }
    } catch (error) {
      const errorData = error.response?.data || {}
      return {
        success: false,
        error: errorData.message || error.message || 'Could not initiate payment',
        statusCode: error.response?.status,
      }
    }
  },

  /**
   * Verify Paystack payment and credit wallet
   */
  async verifyWalletFunding(reference) {
    try {
      const response = await apiClient.post(WALLET_ENDPOINTS.FUND_VERIFY, { reference })
      return {
        success: true,
        amount: response.data.amount,
        balance: response.data.balance,
        message: response.data.message,
      }
    } catch (error) {
      const errorData = error.response?.data || {}
      return {
        success: false,
        error: errorData.message || error.message || 'Payment verification failed',
        statusCode: error.response?.status,
      }
    }
  },
}

export default walletService
