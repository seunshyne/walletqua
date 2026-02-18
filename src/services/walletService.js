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
      const response = await apiClient.post(WALLET_ENDPOINTS.SEND, data)
      return {
        success: true,
        transaction: response.data.transaction || response.data,
        message: response.data.message || 'Transaction sent successfully',
      }
    } catch (error) {
      // Extract detailed error information
      const errorData = error.response?.data || error.data || {}
      const errorMessage = errorData.message || error.message || 'Transaction failed'
      const errors = errorData.errors || {}

      return {
        success: false,
        error: errors,
        message: errorMessage,
        statusCode: error.response?.status || error.status
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
}

export default walletService
