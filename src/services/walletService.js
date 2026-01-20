/**
 * Wallet Service
 * Handles wallet operations like fetching balances, sending, receiving
 */

import apiClient from '../api/client'

const WALLET_ENDPOINTS = {
  GET_WALLETS: '/wallets',
  GET_WALLET: (id) => `/wallets/${id}`,
  GET_BALANCE: (id) => `/wallets/${id}/balance`,
  SEND: '/transactions/send',
  RECEIVE: '/transactions/receive',
  GET_TRANSACTIONS: (id) => `/wallets/${id}/transactions`,
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
      return {
        success: false,
        error: error.data?.errors || { general: error.message },
        message: error.data?.message || '',
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
  async getTransactions(walletId, filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString()
      const endpoint = queryString
        ? `${WALLET_ENDPOINTS.GET_TRANSACTIONS(walletId)}?${queryString}`
        : WALLET_ENDPOINTS.GET_TRANSACTIONS(walletId)

      const response = await apiClient.get(endpoint)
      return {
        success: true,
        transactions: response.data.transactions || response.data,
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
